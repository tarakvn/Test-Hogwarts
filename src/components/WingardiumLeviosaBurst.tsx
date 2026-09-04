import { useEffect } from "react";

interface Props {
  duration?: number;
  onDone?: () => void;
}

const sparks = [
  { left: 44, delay: 0, duration: 4200, drift: -30 },
  { left: 48, delay: 420, duration: 4700, drift: 24 },
  { left: 52, delay: 760, duration: 3900, drift: -18 },
  { left: 56, delay: 980, duration: 5100, drift: 34 },
  { left: 40, delay: 1320, duration: 4400, drift: -24 },
  { left: 60, delay: 1580, duration: 4800, drift: 20 },
  { left: 46, delay: 1860, duration: 4300, drift: -12 },
  { left: 54, delay: 2140, duration: 5200, drift: 28 },
  { left: 38, delay: 2380, duration: 4500, drift: -28 },
  { left: 63, delay: 2640, duration: 4900, drift: 18 },
  { left: 43, delay: 2920, duration: 4100, drift: -20 },
  { left: 58, delay: 3180, duration: 5000, drift: 26 },
];

export function WingardiumLeviosaBurst({ duration = 9000, onDone }: Props) {
  useEffect(() => {
    if (!onDone) return;
    const id = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(id);
  }, [duration, onDone]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 100%, oklch(0.86 0.15 88 / 14%), transparent 58%)",
      }}
    >
      {sparks.map((spark, index) => (
        <span
          key={index}
          className="absolute bottom-[-4%] h-1.5 w-1.5 rounded-full"
          style={{
            left: `${spark.left}%`,
            animation: `leviosa-spark ${spark.duration}ms ${spark.delay}ms ease-out forwards`,
            opacity: 0,
            transform: `translateX(${spark.drift}px)`,
            background: "oklch(0.95 0.18 88)",
            boxShadow: "0 0 8px 3px oklch(0.86 0.15 88 / 80%)",
          }}
        />
      ))}

      <div
        className="absolute top-[105vh] left-1/2 h-28 w-12"
        style={{
          animation: `leviosa-feather ${duration}ms ease-in-out forwards`,
          filter: "drop-shadow(0 0 12px oklch(0.95 0.18 88 / 65%))",
        }}
      >
        <div className="absolute top-0 left-1/2 h-28 w-0.5 -translate-x-1/2 rotate-[20deg] rounded-full bg-white/90" />
        <div
          className="absolute top-1 left-1/2 h-24 w-10 -translate-x-[58%] -rotate-[28deg] rounded-[100%_0_100%_0]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.72) 54%, rgba(220,220,235,0.2))",
          }}
        />
        <div className="absolute top-5 left-1/2 h-px w-9 -translate-x-[62%] -rotate-[28deg] bg-white/80" />
      </div>
    </div>
  );
}
