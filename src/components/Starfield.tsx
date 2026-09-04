import { useMemo } from "react";

/** Decorative galaxy backdrop: nebula clouds + twinkling stars. */
export function Starfield({ density = 70 }: { density?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: density }, (_, i) => ({
        id: i,
        left: Number(((Math.sin(i * 12.9898) * 0.5 + 0.5) * 100).toFixed(2)),
        top: Number(((Math.sin(i * 78.233) * 0.5 + 0.5) * 100).toFixed(2)),
        size: 1 + ((i * 37) % 5) * 0.5,
        delay: ((i * 53) % 60) / 10,
        duration: 2.5 + ((i * 17) % 40) / 10,
      })),
    [density],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-foreground animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
