import { spells } from "@/data/spells";

export interface Pt {
  x: number;
  y: number;
}

const SAMPLE_N = 64;

function pathLength(pts: Pt[]) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
  }
  return len;
}

export function resample(pts: Pt[], n = SAMPLE_N): Pt[] {
  if (pts.length < 2) return Array.from({ length: n }, () => ({ ...(pts[0] ?? { x: 0, y: 0 }) }));
  const total = pathLength(pts);
  if (total < 1e-6) return Array.from({ length: n }, () => ({ ...pts[0]! }));
  const interval = total / (n - 1);
  const src = pts.map((p) => ({ ...p }));
  const out: Pt[] = [{ ...src[0]! }];
  let d = 0;
  let i = 1;
  while (i < src.length && out.length < n) {
    const prev = src[i - 1]!;
    const next = src[i]!;
    const seg = Math.hypot(next.x - prev.x, next.y - prev.y);
    if (d + seg >= interval) {
      const t = (interval - d) / (seg || 1);
      const q = { x: prev.x + (next.x - prev.x) * t, y: prev.y + (next.y - prev.y) * t };
      out.push(q);
      src.splice(i, 0, q);
      d = 0;
      i += 1;
    } else {
      d += seg;
      i += 1;
    }
  }
  while (out.length < n) out.push({ ...src[src.length - 1]! });
  return out;
}

export function normalize(pts: Pt[]): Pt[] {
  const c = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  c.x /= pts.length;
  c.y /= pts.length;
  const shifted = pts.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
  const scale = Math.max(...shifted.map((p) => Math.hypot(p.x, p.y)), 1e-6);
  return shifted.map((p) => ({ x: p.x / scale, y: p.y / scale }));
}

function sampleCubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, steps: number) {
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
      y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y,
    });
  }
  return pts;
}

/** Flatten M / L / C / Z path data used by the spellbook into a polyline. */
export function flattenSvgPath(d: string): Pt[] {
  const tokens = d.match(/[MLCZmlcz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  const pts: Pt[] = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let start: Pt | null = null;

  const num = () => Number(tokens[i++] ?? 0);

  while (i < tokens.length) {
    const cmd = tokens[i]!;
    if (!/^[MLCZmlcz]$/.test(cmd)) break;
    i += 1;
    if (cmd === "M" || cmd === "m") {
      const rel = cmd === "m";
      cx = (rel ? cx : 0) + num();
      cy = (rel ? cy : 0) + num();
      start = { x: cx, y: cy };
      pts.push({ x: cx, y: cy });
    } else if (cmd === "L" || cmd === "l") {
      const rel = cmd === "l";
      while (i < tokens.length && !/^[MLCZmlcz]$/.test(tokens[i]!)) {
        cx = (rel ? cx : 0) + num();
        cy = (rel ? cy : 0) + num();
        pts.push({ x: cx, y: cy });
      }
    } else if (cmd === "C" || cmd === "c") {
      const rel = cmd === "c";
      while (i < tokens.length && !/^[MLCZmlcz]$/.test(tokens[i]!)) {
        const x1 = (rel ? cx : 0) + num();
        const y1 = (rel ? cy : 0) + num();
        const x2 = (rel ? cx : 0) + num();
        const y2 = (rel ? cy : 0) + num();
        const x = (rel ? cx : 0) + num();
        const y = (rel ? cy : 0) + num();
        pts.push(...sampleCubic({ x: cx, y: cy }, { x: x1, y: y1 }, { x: x2, y: y2 }, { x, y }, 12).slice(1));
        cx = x;
        cy = y;
      }
    } else if (cmd === "Z" || cmd === "z") {
      if (start) {
        pts.push({ ...start });
        cx = start.x;
        cy = start.y;
      }
    }
  }
  return pts;
}

function mse(a: Pt[], b: Pt[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    s += (a[i]!.x - b[i]!.x) ** 2 + (a[i]!.y - b[i]!.y) ** 2;
  }
  return s / a.length;
}

function tangentPenalty(a: Pt[], b: Pt[]) {
  let s = 0;
  let n = 0;
  for (let i = 1; i < a.length; i++) {
    const ax = a[i]!.x - a[i - 1]!.x;
    const ay = a[i]!.y - a[i - 1]!.y;
    const bx = b[i]!.x - b[i - 1]!.x;
    const by = b[i]!.y - b[i - 1]!.y;
    const al = Math.hypot(ax, ay);
    const bl = Math.hypot(bx, by);
    if (al < 1e-6 || bl < 1e-6) continue;
    const dot = (ax / al) * (bx / bl) + (ay / al) * (by / bl);
    s += 1 - Math.max(-1, Math.min(1, dot));
    n += 1;
  }
  return n ? s / n : 1;
}

const templates = spells
  .filter((spell) => spell.wandPath)
  .map((spell) => ({
    id: spell.id,
    points: normalize(resample(flattenSvgPath(spell.gesturePath ?? spell.wandPath!), SAMPLE_N)),
  }));

export function matchWandStroke(user: Pt[]): { id: string; score: number } | null {
  if (user.length < 8) return null;
  if (pathLength(user) < 0.12) return null;
  const stroke = normalize(resample(user, SAMPLE_N));
  let best: { id: string; score: number } | null = null;
  let second = Infinity;
  for (const template of templates) {
    const score = mse(stroke, template.points) + 0.45 * tangentPenalty(stroke, template.points);
    if (!best || score < best.score) {
      second = best?.score ?? Infinity;
      best = { id: template.id, score };
    } else if (score < second) {
      second = score;
    }
  }
  if (!best) return null;
  if (best.score > 0.62) return null;
  if (second < Infinity && best.score > 0.32 && best.score > second * 0.94) return null;
  return best;
}

/** Map plane / screen points into an SVG polyline string in a 0–100 viewBox. */
export function toViewBoxPath(pts: Pt[]): string {
  if (!pts.length) return "";
  const mapped = pts.map((p) => ({
    x: 50 + p.x * 42,
    y: 50 + p.y * 42,
  }));
  return mapped.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
}
