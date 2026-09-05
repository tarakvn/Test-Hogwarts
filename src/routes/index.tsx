import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Pencil, WandSparkles } from "lucide-react";
import spellbookIcon from "@/assets/spellbook-icon.png";
import { Starfield } from "@/components/Starfield";
import { WandTrace } from "@/components/WandTrace";
import { DisarmBurst } from "@/components/DisarmBurst";
import { RictusempraBurst } from "@/components/RictusempraBurst";
import { WingardiumLeviosaBurst } from "@/components/WingardiumLeviosaBurst";
import { AlohomoraBurst } from "@/components/AlohomoraBurst";
import { FlipendoBurst } from "@/components/FlipendoBurst";
import { WandStrokeTrail } from "@/components/WandStrokeTrail";
import { IncantationKeyboard } from "@/components/IncantationKeyboard";
import { useTorch } from "@/hooks/useTorch";
import { useSpeechSpell } from "@/hooks/useSpeechSpell";
import { useWandDraw } from "@/hooks/useWandDraw";
import { findSpell, isCounter } from "@/lib/spellMatch";
import { getSpell, type Spell } from "@/data/spells";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spellbook — Speak the Incantation" },
      {
        name: "description",
        content:
          "Speak a wizarding incantation and watch the wand movement draw itself before the magic takes hold.",
      },
      { property: "og:title", content: "Spellbook — Speak the Incantation" },
      {
        property: "og:description",
        content: "Speak the incantation and the wand movement draws itself in light.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CastPage,
});

function buzz(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate?.(pattern);
  }
}

function CastPage() {
  const torch = useTorch();
  const [tracing, setTracing] = useState<Spell | null>(null);
  const [cast, setCast] = useState<Spell | null>(null);
  const [disarming, setDisarming] = useState(false);
  const [tickling, setTickling] = useState(false);
  const [levitating, setLevitating] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"speech" | "draw">("speech");
  const litRef = useRef(false);
  litRef.current = torch.isOn;
  const busyRef = useRef(false);

  const beginSpell = useCallback(
    (spell: Spell) => {
      if (busyRef.current) return;
      if (litRef.current) return;
      busyRef.current = true;
      setCast(null);
      setTracing(spell);
    },
    [],
  );

  const castNox = useCallback(() => {
    torch.stop();
    const nox = getSpell("nox");
    if (!nox || busyRef.current) return;
    busyRef.current = true;
    setCast(null);
    setStatus(null);
    setTracing(nox);
    buzz(40);
  }, [torch]);

  const heard = useCallback(
    (text: string) => {
      if (isCounter(text)) {
        castNox();
        return;
      }
      const spell = findSpell(text);
      if (!spell) return;
      if (spell.category !== "charm") return;
      if (spell.id === "nox") {
        castNox();
        return;
      }
      beginSpell(spell);
    },
    [beginSpell, castNox],
  );

  const speech = useSpeechSpell(heard);

  const wand = useWandDraw(
    (spellId) => {
      const spell = getSpell(spellId);
      if (!spell) return;
      if (spell.id === "nox") {
        castNox();
        return;
      }
      beginSpell(spell);
    },
    inputMode === "draw" &&
      !tracing &&
      !disarming &&
      !tickling &&
      !levitating &&
      !unlocking &&
      !flipping,
  );

  const chooseInputMode = useCallback(
    (mode: "speech" | "draw") => {
      setInputMode(mode);
      if (mode === "speech") {
        speech.stop();
        return;
      }
      void wand.arm();
    },
    [speech, wand],
  );

  useEffect(() => {
    busyRef.current = Boolean(tracing || disarming || tickling || levitating || unlocking);
  }, [tracing, disarming, tickling, levitating, unlocking]);

  useEffect(() => {
    if (!tracing) return;
    buzz([20, 30, 60]);
  }, [tracing]);

  const finishTrace = useCallback(async () => {
    const spell = tracing;
    setTracing(null);
    if (!spell) return;
    setCast(spell);
    buzz(120);
    if (spell.effect === "disarm") {
      setDisarming(true);
      buzz([30, 40, 120]);
      setStatus("Expelliarmus! The wand is torn away.");
      return;
    }
    if (spell.effect === "tickle") {
      setTickling(true);
      buzz([40, 60, 40, 80]);
      setStatus("Rictusempra! Uncontrollable laughter!");
      return;
    }
    if (spell.effect === "levitate") {
      setLevitating(true);
      buzz([30, 50, 30, 70]);
      setStatus("Wingardium Leviosa! The feather rises.");
      return;
    }
    if (spell.effect === "unlock") {
      setUnlocking(true);
      buzz([30, 60, 30, 100]);
      setStatus("Alohomora! The lock opens.");
      return;
    }
    if (spell.effect === "flipendo") {
      setFlipping(true);
      buzz([40, 80, 40, 120]);
      setStatus("Flipendo! The target is blasted backward.");
      return;
    }
    if (spell.id === "nox") {
      setStatus("Nox. The light fades.");
      return;
    }

    const mode = await torch.start();
    setStatus(
      mode === "hardware" ? "Wand tip alight — real flame kindled." : "Wandlight fills the screen.",
    );
  }, [torch, tracing]);

  useEffect(() => {
    if (!status || unlocking) return;
    const id = window.setTimeout(() => setStatus(null), 3500);
    return () => window.clearTimeout(id);
  }, [status, unlocking]);

  const lit = torch.isOn;

  return (
    <main className="relative min-h-screen">
      <Starfield />

      <WandStrokeTrail points={wand.points} live={wand.live} />

      {/* Lumos glow lives on this very page — spoken counter-spell puts it out */}
      {lit ? (
        <div
          aria-hidden
          className="animate-rise pointer-events-none fixed inset-0 z-10"
          style={{
            background:
              torch.mode === "hardware"
                ? "radial-gradient(circle at 50% 42%, oklch(0.6 0.1 90 / 45%), transparent 70%)"
                : "radial-gradient(circle at 50% 42%, oklch(1 0 0 / 96%), oklch(0.93 0.09 92 / 88%) 55%, oklch(0.88 0.1 90 / 65%))",
          }}
        />
      ) : null}

      {disarming ? <DisarmBurst onDone={() => setDisarming(false)} /> : null}
      {tickling ? <RictusempraBurst onDone={() => setTickling(false)} /> : null}
      {levitating ? <WingardiumLeviosaBurst onDone={() => setLevitating(false)} /> : null}
      {unlocking ? <AlohomoraBurst open /> : null}
      {flipping ? <FlipendoBurst onDone={() => setFlipping(false)} /> : null}

      {tracing ? (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-background/85 px-8 backdrop-blur-md">
          <p className="animate-rise font-serif text-3xl tracking-[0.28em] text-primary uppercase text-glow">
            {tracing.name}
          </p>
          <div className="w-full max-w-xs">
            <WandTrace spell={tracing} duration={2000} onDone={() => void finishTrace()} />
          </div>
          <p className="font-sans text-sm text-muted-foreground italic">
            The wand traces its own path…
          </p>
        </div>
      ) : null}

      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-md flex-col items-center gap-8 px-5 pt-14 pb-24">
        <header className="animate-rise text-center">
          <p
            className="font-serif text-[0.65rem] tracking-[0.45em] uppercase"
            style={{ color: lit ? "oklch(0.35 0.06 60)" : undefined }}
          >
            <span className={lit ? "" : "text-primary/80"}>Standard Book of Spells</span>
          </p>
          <h1
            className={`mt-3 font-serif text-4xl font-semibold ${lit ? "" : "text-primary text-glow"}`}
            style={{ color: lit ? "oklch(0.28 0.06 60)" : undefined }}
          >
            Speak, and it shall be
          </h1>
          <p
            className="mt-3 font-sans text-base italic"
            style={{ color: lit ? "oklch(0.38 0.05 60)" : undefined }}
          >
            <span className={lit ? "" : "text-muted-foreground"}>
              Say the incantation, sweep the wand through the air, or type it. The charm will draw
              itself.
            </span>
          </p>
        </header>

        <div className="relative flex flex-1 items-center justify-center">
          <div
            className="absolute h-64 w-64 rounded-full opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(circle, oklch(0.86 0.15 88 / 22%), oklch(0.45 0.15 295 / 18%) 55%, transparent 72%)",
            }}
          />
          <div
            className="animate-glow-pulse relative flex h-52 w-52 items-center justify-center rounded-full border border-primary/30"
            style={{ boxShadow: "var(--shadow-arcane)" }}
          >
            <div className="absolute inset-4 rounded-full border border-primary/15" />
            {cast ? (
              <img
                src={cast.icon}
                alt={`${cast.name} sigil`}
                width={104}
                height={104}
                className="animate-rise h-24 w-24 rounded-full opacity-90"
              />
            ) : (
              <span
                aria-hidden
                className="h-24 w-24 rounded-full border border-dashed border-primary/20"
              />
            )}
          </div>
        </div>

        {cast ? (
          <p className="animate-rise text-center font-serif text-[0.6rem] tracking-[0.4em] text-primary/60 uppercase">
            {cast.name} · Charms
          </p>
        ) : null}

        <div data-no-wand className="flex w-full items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (inputMode !== "speech") {
                chooseInputMode("speech");
                return;
              }
              if (speech.listening) speech.stop();
              else void speech.start();
            }}
            aria-pressed={inputMode === "speech"}
            className={`flex min-w-0 flex-1 items-center justify-center gap-3 rounded-full border px-4 py-4 font-serif text-sm tracking-[0.12em] uppercase backdrop-blur transition-transform active:scale-95 ${inputMode === "speech"
                ? "border-primary/40 bg-card/60 text-primary"
                : "border-primary/20 bg-card/30 text-muted-foreground"
              }`}
            style={inputMode === "speech" ? { boxShadow: "var(--shadow-glow)" } : undefined}
          >
            {speech.listening ? (
              <>
                <Mic className="h-4 w-4 animate-pulse" /> Listening…
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" /> Speak
              </>
            )}
          </button>
          {inputMode === "speech" ? (
            <button
              type="button"
              onClick={() => chooseInputMode("draw")}
              aria-label="Draw the wand movement"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-card/60 text-primary backdrop-blur transition-transform active:scale-95"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              <Pencil className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => chooseInputMode("speech")}
              aria-label="Speak the incantation"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-card/60 text-primary backdrop-blur transition-transform active:scale-95"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>

        {inputMode === "draw" ? (
          <p className="flex items-center justify-center gap-2 text-center font-sans text-sm text-muted-foreground">
            <WandSparkles className="h-4 w-4 text-primary" />
            {wand.sensorReady
              ? "Move your wand to draw the movement."
              : "Move your finger, or allow motion access to use your wand."}
          </p>
        ) : null}

        {!speech.supported ? (
          <p className="flex items-center justify-center gap-2 font-sans text-sm text-muted-foreground">
            <MicOff className="h-4 w-4" /> Your browser can't hear incantations.
          </p>
        ) : null}

        {speech.error === "not-allowed" ? (
          <p className="text-center font-sans text-sm text-muted-foreground">
            Allow the microphone (and camera for Lumos) in system settings, then tap Speak again.
          </p>
        ) : null}

        {status ? (
          <div data-no-wand className="flex flex-col items-center gap-3">
            <p
              className="animate-rise text-center font-sans text-sm"
              style={{ color: lit ? "oklch(0.32 0.06 60)" : "oklch(0.86 0.14 88)" }}
            >
              {status}
            </p>
            {unlocking ? (
              <button
                type="button"
                onClick={() => {
                  setUnlocking(false);
                  setCast(null);
                  setStatus(null);
                }}
                className="rounded-full border border-primary/40 bg-card/70 px-5 py-2 font-serif text-xs tracking-[0.2em] text-primary uppercase transition-transform active:scale-95"
              >
                Clear and cast another
              </button>
            ) : null}
          </div>
        ) : null}

        <Link
          to="/library"
          className="rounded-2xl transition-transform active:scale-95"
          aria-label="Open the spellbook"
        >
          <img
            src={spellbookIcon}
            alt="Spellbook"
            width={80}
            height={80}
            loading="lazy"
            className="h-20 w-20 drop-shadow-[0_0_18px_oklch(0.86_0.15_88_/45%)]"
          />
        </Link>
      </div>

      <IncantationKeyboard onCast={heard} disabled={Boolean(tracing)} />
    </main>
  );
}
