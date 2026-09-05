import { useMemo, useState } from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import snapeImg from "@/assets/potions-master.png";
import { snapeGrumbles, type BrewStep, type Spell } from "@/data/spells";
import { getPersianBrewSteps, translate, usePersianLanguage } from "@/lib/language";

function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed + 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/** A tiny brewing bench: pick each step in the right order or Snape appears. */
export function PotionBrew({ spell }: { spell: Spell }) {
  const persian = usePersianLanguage();
  const steps = useMemo<BrewStep[]>(() => {
    const source = spell.potion?.steps ?? [];
    return persian ? getPersianBrewSteps(spell) : source;
  }, [persian, spell]);
  const [index, setIndex] = useState(0);
  const [mistake, setMistake] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const step = steps[index];
  const options = useMemo(
    () => (step ? shuffle([step.answer, ...step.decoys], index) : []),
    [step, index],
  );

  const reset = () => {
    setIndex(0);
    setMistake(null);
    setDone(false);
  };

  const choose = (option: string) => {
    if (!step) return;
    if (option !== step.answer) {
      setMistake(snapeGrumbles[Math.floor(Math.random() * snapeGrumbles.length)] ?? null);
      return;
    }
    if (index + 1 >= steps.length) {
      setDone(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(120);
      return;
    }
    setIndex(index + 1);
  };

  if (!steps.length) return null;

  return (
    <div className="rounded-2xl border border-primary/25 bg-background/50 p-4">
      <p className="font-serif text-[0.6rem] tracking-[0.4em] text-primary/70 uppercase">
        {translate("Brewing bench", persian)}
      </p>

      {done ? (
        <div className="animate-rise mt-4 text-center">
          <div
            className="mx-auto h-24 w-24 rounded-full"
            style={{
              background:
                spell.id === "wiggenweld"
                  ? "radial-gradient(circle, oklch(0.86 0.16 190 / 85%), oklch(0.48 0.16 205 / 40%) 60%, transparent 72%)"
                  : "radial-gradient(circle, oklch(0.85 0.12 350 / 75%), oklch(0.45 0.15 295 / 35%) 60%, transparent 72%)",
              filter: "blur(2px)",
            }}
          />
          <p className="mt-3 font-serif text-xl text-primary text-glow">
            {translate("The potion is complete", persian)}
          </p>
          <p className="mt-1 font-sans text-sm text-muted-foreground italic">
            {spell.id === "wiggenweld"
              ? translate("Turquoise light shimmers above the cauldron — full marks.", persian)
              : translate("Pink smoke curls from the cauldron — full marks.", persian)}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 font-serif text-xs tracking-[0.25em] text-primary uppercase"
          >
            <RotateCcw className="h-3.5 w-3.5" /> {translate("Brew again", persian)}
          </button>
        </div>
      ) : (
        <>
          <p className="mt-3 font-sans text-base text-foreground/90">{step?.prompt}</p>
          <div className="mt-3 flex flex-col gap-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                className="rounded-xl border border-primary/20 bg-card/50 px-3 py-2 text-left font-sans text-sm text-foreground/90 transition-colors hover:border-primary/50 hover:text-primary active:scale-[0.99]"
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={`h-1.5 flex-1 rounded-full ${i < index ? "bg-primary/70" : "bg-primary/15"}`}
              />
            ))}
          </div>
          <p className="mt-2 flex items-center gap-2 font-sans text-xs text-muted-foreground">
            {index === 0 ? (
              <>
                <Sparkles className="h-3.5 w-3.5" /> {persian ? "مرحله ۱ از" : "Step 1 of"} {steps.length}
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> {persian ? `مرحله ${index + 1} از` : `Step ${index + 1} of`} {steps.length}
              </>
            )}
          </p>
        </>
      )}

      {mistake ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-background/80 px-4 pb-8 backdrop-blur-sm">
          <div className="animate-rise w-full max-w-sm text-center">
            <img
              src={snapeImg}
              alt={persian ? "استاد معجون‌سازی ناراضی است" : "The Potions Master, unimpressed"}
              width={768}
              height={1024}
              loading="lazy"
              className="mx-auto h-64 w-auto drop-shadow-[0_0_28px_oklch(0.45_0.15_295/55%)]"
            />
            <p className="mt-2 font-serif text-lg text-destructive">{mistake}</p>
            <button
              type="button"
              onClick={() => setMistake(null)}
              className="mt-4 rounded-full border border-primary/40 px-5 py-2 font-serif text-xs tracking-[0.25em] text-primary uppercase"
            >
              {translate("Try again", persian)}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
