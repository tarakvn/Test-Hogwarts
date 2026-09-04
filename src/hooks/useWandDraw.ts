import { useCallback, useEffect, useRef, useState } from "react";
import { matchWandStroke, type Pt } from "@/lib/wandGesture";

interface MotionPermissionCtor {
  requestPermission?: () => Promise<string>;
}

function projectAngles(yaw: number, pitch: number, plane = 0.55): Pt {
  // Extend the wand's current angle as a ray onto a near plane in front of the caster.
  return {
    x: Math.max(-1.6, Math.min(1.6, plane * Math.tan(yaw))),
    y: Math.max(-1.6, Math.min(1.6, plane * Math.tan(pitch))),
  };
}

function isUiTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, a, input, textarea, select, [role='dialog'], [data-no-wand]"));
}

async function requestSensorPermission() {
  const motion = window.DeviceMotionEvent as unknown as MotionPermissionCtor | undefined;
  const orient = window.DeviceOrientationEvent as unknown as MotionPermissionCtor | undefined;
  if (typeof motion?.requestPermission === "function") {
    const result = await motion.requestPermission();
    if (result !== "granted") return false;
  }
  if (typeof orient?.requestPermission === "function") {
    const result = await orient.requestPermission();
    if (result !== "granted") return false;
  }
  return true;
}

/**
 * Draw with the wand tip: gyroscope / orientation angles are projected onto a
 * near plane, and a still pause completes the stroke. Finger or mouse drag is
 * the same drawing language when sensors are missing.
 */
export function useWandDraw(onMatch: (spellId: string) => void, enabled: boolean) {
  const [points, setPoints] = useState<Pt[]>([]);
  const [live, setLive] = useState<Pt | null>(null);
  const [armed, setArmed] = useState(false);
  const [sensorReady, setSensorReady] = useState(false);

  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const strokeRef = useRef<Pt[]>([]);
  const drawingRef = useRef(false);
  const idleTimerRef = useRef<number | null>(null);
  const anglesRef = useRef({ yaw: 0, pitch: 0 });
  const restOrientRef = useRef<{ yaw: number; pitch: number } | null>(null);
  const lastMotionRef = useRef(0);
  const gyroUntilRef = useRef(0);
  const pointerStrokeRef = useRef(false);

  const finishStroke = useCallback(() => {
    const stroke = strokeRef.current;
    drawingRef.current = false;
    pointerStrokeRef.current = false;
    strokeRef.current = [];
    anglesRef.current = { yaw: 0, pitch: 0 };
    restOrientRef.current = null;
    setPoints([]);
    if (idleTimerRef.current != null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    const hit = matchWandStroke(stroke);
    if (hit) onMatchRef.current(hit.id);
  }, []);

  const bumpIdle = useCallback(() => {
    if (idleTimerRef.current != null) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      idleTimerRef.current = null;
      if (strokeRef.current.length >= 8) finishStroke();
      else {
        drawingRef.current = false;
        strokeRef.current = [];
        anglesRef.current = { yaw: 0, pitch: 0 };
        setPoints([]);
      }
    }, 520);
  }, [finishStroke]);

  const pushPoint = useCallback(
    (pt: Pt) => {
      if (!enabledRef.current) return;
      const last = strokeRef.current[strokeRef.current.length - 1];
      if (last && Math.hypot(pt.x - last.x, pt.y - last.y) < 0.008) return;
      if (!drawingRef.current) {
        drawingRef.current = true;
        strokeRef.current = [pt];
      } else {
        strokeRef.current = [...strokeRef.current, pt];
      }
      setPoints(strokeRef.current);
      setLive(pt);
      bumpIdle();
    },
    [bumpIdle],
  );

  const arm = useCallback(async () => {
    try {
      const ok = await requestSensorPermission();
      setSensorReady(ok);
      setArmed(true);
    } catch {
      setSensorReady(false);
      setArmed(true);
    }
  }, []);

  useEffect(() => {
    if (!armed) return;

    const onMotion = (event: DeviceMotionEvent) => {
      if (!enabledRef.current || pointerStrokeRef.current) return;
      const rate = event.rotationRate;
      if (!rate || (rate.alpha == null && rate.beta == null && rate.gamma == null)) return;
      gyroUntilRef.current = performance.now() + 220;
      const now = performance.now();
      const dt = lastMotionRef.current ? Math.min(0.05, (now - lastMotionRef.current) / 1000) : 0.016;
      lastMotionRef.current = now;
      const yawRate = rate.gamma ?? 0;
      const pitchRate = rate.beta ?? 0;
      const speed = Math.hypot(yawRate, pitchRate);
      if (!drawingRef.current && speed < 35) return;
      if (!drawingRef.current) anglesRef.current = { yaw: 0, pitch: 0 };
      anglesRef.current.yaw += ((yawRate * Math.PI) / 180) * dt;
      anglesRef.current.pitch += ((pitchRate * Math.PI) / 180) * dt;
      pushPoint(projectAngles(anglesRef.current.yaw, anglesRef.current.pitch));
    };

    const onOrient = (event: DeviceOrientationEvent) => {
      if (!enabledRef.current || pointerStrokeRef.current) return;
      if (performance.now() < gyroUntilRef.current) return;
      if (event.beta == null || event.gamma == null) return;
      const yaw = ((event.gamma ?? 0) * Math.PI) / 180;
      const pitch = (((event.beta ?? 0) - 45) * Math.PI) / 180;
      if (!restOrientRef.current) restOrientRef.current = { yaw, pitch };
      const dyaw = yaw - restOrientRef.current.yaw;
      const dpitch = pitch - restOrientRef.current.pitch;
      if (!drawingRef.current && Math.hypot(dyaw, dpitch) < 0.08) return;
      pushPoint(projectAngles(dyaw, dpitch));
    };

    window.addEventListener("devicemotion", onMotion);
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("devicemotion", onMotion);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, [armed, pushPoint]);

  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      if (!enabledRef.current) return;
      if (event.isPrimary === false) return;
      if (isUiTarget(event.target)) return;
      pointerStrokeRef.current = true;
      drawingRef.current = true;
      anglesRef.current = { yaw: 0, pitch: 0 };
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      strokeRef.current = [{ x, y }];
      setPoints(strokeRef.current);
      setLive({ x, y });
    };
    const onMove = (event: PointerEvent) => {
      if (!pointerStrokeRef.current) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      pushPoint({ x, y });
    };
    const onUp = () => {
      if (!pointerStrokeRef.current) return;
      finishStroke();
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [finishStroke, pushPoint]);

  useEffect(
    () => () => {
      if (idleTimerRef.current != null) window.clearTimeout(idleTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (enabled) return;
    drawingRef.current = false;
    pointerStrokeRef.current = false;
    strokeRef.current = [];
    setPoints([]);
    setLive(null);
  }, [enabled]);

  return { points, live, arm, armed, sensorReady };
}
