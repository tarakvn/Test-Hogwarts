import { Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
}

export function AlohomoraBurst({ open }: Props) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!open) {
      setUnlocked(false);
      return;
    }
    const id = window.setTimeout(() => setUnlocked(true), 850);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <div
      aria-label={unlocked ? "Unlocked magical lock" : "Locked magical box"}
      className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center"
    >
      <div
        className={`relative flex h-52 w-64 items-center justify-center rounded-3xl border bg-card/90 backdrop-blur-md transition-all duration-700 ${
          unlocked
            ? "border-primary/80 shadow-[0_0_55px_oklch(0.86_0.15_88_/55%)]"
            : "border-primary/40"
        }`}
      >
        <div className="absolute inset-3 rounded-2xl border border-primary/20" />
        <div
          className={`relative flex h-28 w-36 items-center justify-center rounded-xl border-2 transition-colors duration-700 ${
            unlocked ? "border-primary bg-primary/15" : "border-primary/55 bg-background/60"
          }`}
        >
          <div
            className={`absolute -top-10 left-1/2 h-14 w-16 -translate-x-1/2 rounded-t-full border-4 border-b-0 transition-transform duration-700 ${
              unlocked ? "rotate-12 border-primary" : "border-primary/70"
            }`}
          />
          {unlocked ? (
            <Unlock className="h-12 w-12 animate-rise text-primary text-glow" />
          ) : (
            <Lock className="h-12 w-12 text-primary/80" />
          )}
        </div>
        {unlocked ? (
          <span className="absolute -top-3 right-8 h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_4px_oklch(0.86_0.15_88_/70%)]" />
        ) : null}
      </div>
    </div>
  );
}
