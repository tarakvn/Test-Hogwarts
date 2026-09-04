import { useEffect } from "react";

interface Props {
  duration?: number;
  onDone?: () => void;
}

export function RictusempraBurst({ duration = 2200, onDone }: Props) {
  useEffect(() => {
    // Play a playful laugh using the browser's built-in speech synthesis.
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const laugh = new SpeechSynthesisUtterance("Ha ha ha! Ha ha ha!");
      laugh.lang = "en-US";
      laugh.rate = 1.15;
      laugh.pitch = 1.35;
      laugh.volume = 0.9;

      window.speechSynthesis.speak(laugh);
    }

    if (!onDone) return;

    const id = window.setTimeout(() => {
      window.speechSynthesis?.cancel();
      onDone();
    }, duration);

    return () => {
      window.clearTimeout(id);
      window.speechSynthesis?.cancel();
    };
  }, [duration, onDone]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {/* Magical purple-blue glow */}
      <div
        className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.8 0.2 300 / 75%), oklch(0.6 0.2 285 / 40%) 45%, transparent 72%)",
          animation: "rictusempra-glow 1200ms ease-in-out infinite",
        }}
      />

      {/* Laughing magical rings */}
      <div
        className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{
          borderColor: "oklch(0.82 0.18 300 / 75%)",
          animation: "rictusempra-ring 1100ms ease-out forwards",
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: "oklch(0.82 0.15 220 / 60%)",
          animation: "rictusempra-ring 1300ms 180ms ease-out forwards",
        }}
      />

      {/* Floating magical laughter symbols */}
      <div className="absolute top-1/2 left-1/2">
        <span
          className="absolute text-4xl text-primary text-glow"
          style={{
            animation: "rictusempra-laugh 1600ms ease-out forwards",
          }}
        >
          HA!
        </span>

        <span
          className="absolute text-3xl text-primary text-glow"
          style={{
            animation: "rictusempra-laugh-left 1800ms 120ms ease-out forwards",
          }}
        >
          HA!
        </span>

        <span
          className="absolute text-2xl text-primary text-glow"
          style={{
            animation: "rictusempra-laugh-right 1700ms 220ms ease-out forwards",
          }}
        >
          HA!
        </span>
      </div>
    </div>
  );
}