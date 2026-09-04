import { useEffect } from "react";
import type { Spell } from "@/data/spells";

interface Props {
  spell: Spell;
  /** Milliseconds the trace takes to complete */
  duration?: number;
  loop?: boolean;
  onDone?: () => void;
  className?: string;
}

/**
 * The app draws the wand movement itself: a glowing spark travels the
 * figure-eight while the trail lights up behind it.
 */
export function WandTrace({ spell, duration = 2000, loop = false, onDone, className }: Props) {
  useEffect(() => {
    if (loop || !onDone) return;
    const id = window.setTimeout(onDone, duration + 250);
    return () => window.clearTimeout(id);
  }, [duration, loop, onDone]);

  const seconds = `${duration / 1000}s`;

  return (
    <svg viewBox="0 0 100 100" className={className ?? "h-full w-full"} aria-hidden>
      <path
        d={spell.wandPath}
        fill="none"
        stroke="var(--color-primary)"
        strokeOpacity="0.18"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d={spell.wandPath}
        fill="none"
        stroke="var(--color-lumos)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray="100"
        style={{
          filter: "drop-shadow(0 0 8px var(--color-lumos))",
          animation: loop
            ? `trace-wand ${seconds} ease-in-out infinite`
            : `wand-draw ${seconds} ease-in-out forwards`,
        }}
      />
    </svg>
  );
}
