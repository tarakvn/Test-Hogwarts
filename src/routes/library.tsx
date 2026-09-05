import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, Search, X } from "lucide-react";
import { useState } from "react";
import { Starfield } from "@/components/Starfield";
import { WandTrace } from "@/components/WandTrace";
import { PotionBrew } from "@/components/PotionBrew";
import {
  spells,
  librarySubjects,
  searchSpells,
  type Spell,
  type LibrarySubject,
} from "@/data/spells";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "The Spellbook — Charms & Potions Library" },
      {
        name: "description",
        content:
          "An open spellbook of charms and potions: incantations, effects, animated wand movements and a brewing bench.",
      },
      { property: "og:title", content: "The Spellbook — Charms & Potions Library" },
      {
        property: "og:description",
        content: "Turn the pages: charms and potions with animated wand movements and brewing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const [tab, setTab] = useState<LibrarySubject>("charms");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const active = librarySubjects.find((c) => c.id === tab)!;
  const results = searchSpells(query);
  const entries = query.trim()
    ? results
    : spells.filter((s) => (s.subject ?? (s.category === "potion" ? "potions" : "charms")) === tab);

  return (
    <main className="relative min-h-screen">
      <Starfield density={50} />
      <LanguageToggle />
      <div className="relative mx-auto w-full max-w-2xl px-4 pt-8 pb-14">
        <Link
          to="/"
          className="flex items-center gap-2 font-serif text-xs tracking-[0.3em] text-muted-foreground uppercase transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Cast
        </Link>

        {/* Book */}
        <div
          className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-primary/30"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.28 0.05 285), oklch(0.19 0.04 280) 55%, oklch(0.24 0.05 300))",
            boxShadow: "var(--shadow-arcane)",
          }}
        >
          {/* spine */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-6 w-px bg-primary/25"
            style={{ boxShadow: "0 0 14px var(--color-primary)" }}
          />

          <div className="pt-8 pr-5 pb-7 pl-12">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-[0.6rem] tracking-[0.45em] text-primary/70 uppercase">
                  Liber Magicae
                </p>
                <h1 className="mt-2 font-serif text-3xl font-semibold text-primary text-glow">
                  LESSONS
                </h1>
              </div>
              <button
                type="button"
                aria-label={searching ? "Close search" : "Search the spellbook"}
                onClick={() => {
                  setSearching((s) => !s);
                  if (searching) setQuery("");
                }}
                className="mt-1 rounded-full border border-primary/35 p-2 text-primary transition-transform active:scale-95"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                {searching ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </button>
            </div>

            {searching ? (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, effect, ingredient…"
                className="animate-rise mt-4 w-full rounded-xl border border-primary/30 bg-background/50 px-4 py-2.5 font-sans text-base text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
              />
            ) : null}

            {/* tabs / bookmarks */}
            {query.trim() ? null : (
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {librarySubjects.map((c) => {
                  const on = c.id === tab;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setTab(c.id)}
                      className={`rounded-xl border px-3 py-2 text-left font-serif text-[0.65rem] tracking-[0.12em] uppercase transition-colors ${on
                          ? "border-primary/50 bg-card/70 text-primary"
                          : "border-primary/15 bg-background/30 text-muted-foreground"
                        }`}
                      style={on ? { boxShadow: "var(--shadow-glow)" } : undefined}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* page */}
            <div className="animate-rise rounded-b-2xl rounded-tr-2xl border border-primary/25 bg-background/40 p-4">
              <p className="font-sans text-sm text-muted-foreground italic">
                {query.trim()
                  ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} found for “${query.trim()}”`
                  : active.blurb}
              </p>

              {entries.length ? (
                <ul className="mt-5 space-y-4">
                  {entries.map((spell) => (
                    <SpellEntry key={spell.id} spell={spell} />
                  ))}
                </ul>
              ) : (
                <p className="mt-8 text-center font-serif text-xs tracking-[0.3em] text-muted-foreground uppercase">
                  {query.trim() ? "Nothing written of that" : "These pages are still blank"}
                </p>
              )}
            </div>

            <p className="mt-6 text-center font-serif text-[0.55rem] tracking-[0.4em] text-muted-foreground uppercase">
              More entries to be inscribed
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function SpellEntry({ spell }: { spell: Spell }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="overflow-hidden rounded-2xl border border-primary/15 bg-card/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-3 text-left"
      >
        <img
          src={spell.icon}
          alt={`${spell.name} sigil`}
          className="h-14 w-14 rounded-xl"
          loading="lazy"
        />
        <span className="flex-1">
          <span className="block font-serif text-xl text-primary">{spell.name}</span>
          <span className="mt-1 block font-sans text-sm text-foreground/85">
            {spell.description}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-primary/70 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="animate-rise border-t border-primary/15 px-3 pt-3 pb-4">
          <p className="font-sans text-xs tracking-widest text-muted-foreground uppercase">
            {spell.pronunciation}
          </p>

          {spell.wandPath ? (
            <>
              <div className="relative mt-3 aspect-square w-full rounded-2xl border border-primary/15 bg-card/40">
                <WandTrace spell={spell} duration={2400} loop />
              </div>
              <p className="mt-2 text-center font-sans text-xs text-muted-foreground">
                Wand movement: {spell.movement}
              </p>
            </>
          ) : null}

          {spell.potion ? <PotionPages spell={spell} /> : null}
        </div>
      ) : null}
    </li>
  );
}

function PotionPages({ spell }: { spell: Spell }) {
  const potion = spell.potion!;
  const [view, setView] = useState<"recipe" | "brew">("recipe");

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        {(["recipe", "brew"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex-1 rounded-xl border px-3 py-2 font-serif text-[0.65rem] tracking-[0.25em] uppercase transition-colors ${view === v
                ? "border-primary/50 bg-card/70 text-primary"
                : "border-primary/15 bg-background/30 text-muted-foreground"
              }`}
          >
            {v === "recipe" ? "Recipe scroll" : "Brew it"}
          </button>
        ))}
      </div>

      {view === "recipe" ? (
        <div
          className="animate-rise mt-3 rounded-2xl border border-primary/20 p-4"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.93 0.05 85 / 10%), oklch(0.86 0.06 80 / 5%))",
            boxShadow: "inset 0 0 40px oklch(0.86 0.15 88 / 10%)",
          }}
        >
          <p className="font-sans text-base text-foreground/90 italic">{potion.method}</p>
          <h3 className="mt-5 font-serif text-[0.6rem] tracking-[0.4em] text-primary/70 uppercase">
            Uses
          </h3>
          <h3 className="mt-2 list-disc space-y-1 pl-5 font-sans text-sm text-foreground/90">
            {potion.uses}
          </h3>
          <h3 className="mt-5 font-serif text-[0.6rem] tracking-[0.4em] text-primary/70 uppercase">
            Dangers
          </h3>
          <h3 className="mt-2 list-disc space-y-1 pl-5 font-sans text-sm text-foreground/90">
            {potion.dangers}
          </h3>
          <h3 className="mt-5 font-serif text-[0.6rem] tracking-[0.4em] text-primary/70 uppercase">
            Characteristics
          </h3>
          <h3 className="mt-2 list-disc space-y-1 pl-5 font-sans text-sm text-foreground/90">
            {potion.characteristics}
          </h3>
          <h3 className="mt-5 font-serif text-[0.6rem] tracking-[0.4em] text-primary/70 uppercase">
            Difficulty
          </h3>
          <h3 className="mt-2 list-disc space-y-1 pl-5 font-sans text-sm text-foreground/90">
            {potion.difficulty}
          </h3>
          <h3 className="mt-5 font-serif text-[0.6rem] tracking-[0.4em] text-primary/70 uppercase">
            Known ingredients
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-sans text-sm text-foreground/90">
            {potion.ingredients.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 className="mt-5 font-serif text-[0.6rem] tracking-[0.4em] text-primary/70 uppercase">
            Brewing instructions
          </h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 font-sans text-sm text-foreground/90">
            {potion.instructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>

          <div className="mt-5 space-y-2 border-t border-primary/15 pt-3 font-sans text-sm text-muted-foreground italic">
            {potion.lore.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-rise mt-3">
          <PotionBrew spell={spell} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-serif text-[0.6rem] tracking-[0.3em] text-primary/70 uppercase">
        {label}
      </dt>
      <dd className="text-foreground/90">{value}</dd>
    </div>
  );
}
