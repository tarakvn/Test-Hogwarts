import { useEffect } from "react";

interface Props {
  duration?: number;
  onDone?: () => void;
}

/**
 * Expelliarmus: a scarlet shockwave blasts outward while a wand is torn
 * from its owner's grip and spins off screen.
 */
export function DisarmBurst({ duration = 1600, onDone }: Props) {
  useEffect(() => {
    if (!onDone) return;
    const id = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(id);
  }, [duration, onDone]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.2 25 / 85%), oklch(0.6 0.24 20 / 45%) 45%, transparent 72%)",
          animation: "disarm-shock 900ms ease-out forwards",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          borderColor: "oklch(0.82 0.2 28 / 70%)",
          animation: "disarm-shock 1200ms 120ms ease-out forwards",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2"
        style={{ animation: "disarm-fling 1300ms cubic-bezier(.2,.7,.3,1) forwards" }}
      >
        <span
          className="block h-1.5 w-24 rounded-full"
          style={{
            background: "linear-gradient(90deg, oklch(0.4 0.05 40), oklch(0.78 0.09 60))",
            boxShadow: "0 0 18px oklch(0.85 0.2 25 / 70%)",
          }}
        />
      </div>
    </div>
  );
}
