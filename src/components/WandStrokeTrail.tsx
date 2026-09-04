import { toViewBoxPath, type Pt } from "@/lib/wandGesture";

interface Props {
  points: Pt[];
  live: Pt | null;
}

export function WandStrokeTrail({ points, live }: Props) {
  const d = toViewBoxPath(points);
  const spark = live
    ? { x: 50 + live.x * 42, y: 50 + live.y * 42 }
    : points.length
      ? { x: 50 + points[points.length - 1]!.x * 42, y: 50 + points[points.length - 1]!.y * 42 }
      : null;

  if (!d && !spark) return null;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none fixed inset-0 z-[25] h-full w-full"
      aria-hidden
    >
      {d ? (
        <path
          d={d}
          fill="none"
          stroke="var(--color-lumos)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 8px var(--color-lumos))" }}
        />
      ) : null}
      {spark ? (
        <circle
          cx={spark.x}
          cy={spark.y}
          r="1.8"
          fill="oklch(0.95 0.08 90)"
          style={{ filter: "drop-shadow(0 0 10px oklch(0.86 0.15 88))" }}
        />
      ) : null}
    </svg>
  );
}
