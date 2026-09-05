import { useEffect } from "react";

interface Props {
  duration?: number;
  onDone?: () => void;
}

export function FlipendoBurst({ duration = 1500, onDone }: Props) {
  useEffect(() => {
    if (!onDone) return;

    const id = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(id);
  }, [duration, onDone]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {/* Main impact flash */}
      <div
        className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.95 0.15 195 / 90%), oklch(0.7 0.18 200 / 55%) 40%, transparent 72%)",
          animation: "flipendo-impact 500ms ease-out forwards",
        }}
      />

      {/* Expanding shockwave */}
      <div
        className="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
        style={{
          borderColor: "oklch(0.82 0.18 195 / 85%)",
          boxShadow: "0 0 24px oklch(0.75 0.18 195 / 70%)",
          animation: "flipendo-shockwave 900ms cubic-bezier(.15,.8,.25,1) forwards",
        }}
      />

      {/* Magical hit streaks */}
      <div className="absolute top-1/2 left-1/2">
        <span
          className="absolute block h-1 w-20 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.9 0.16 195), transparent)",
            transform: "rotate(-20deg)",
            animation: "flipendo-streak-left 700ms ease-out forwards",
          }}
        />

        <span
          className="absolute block h-1 w-24 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.88 0.14 210), transparent)",
            transform: "rotate(18deg)",
            animation: "flipendo-streak-right 750ms ease-out forwards",
          }}
        />

        <span
          className="absolute block h-0.5 w-16 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.98 0.1 190), transparent)",
            transform: "rotate(42deg)",
            animation: "flipendo-streak-up 650ms ease-out forwards",
          }}
        />
      </div>

      {/* Target being blasted backward */}
      <div
        className="absolute top-1/2 left-1/2 h-16 w-8"
        style={{
          animation:
            "flipendo-fling 1200ms cubic-bezier(.12,.78,.22,1) forwards",
        }}
      >
        <div
          className="mx-auto h-12 w-4 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.78 0.1 220), oklch(0.32 0.07 230))",
            boxShadow: "0 0 16px oklch(0.65 0.16 200 / 60%)",
          }}
        />
      </div>
    </div>
  );
}