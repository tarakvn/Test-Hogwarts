import { FormEvent, useEffect, useRef, useState } from "react";
import { Keyboard } from "lucide-react";

interface Props {
  onCast: (text: string) => void;
  disabled?: boolean;
}

export function IncantationKeyboard({ onCast, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    onCast(text);
    setValue("");
    setOpen(false);
  };

  return (
    <div data-no-wand className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2">
      {open ? (
        <form
          onSubmit={submit}
          className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-primary/35 bg-card/95 p-3 shadow-lg backdrop-blur"
          style={{ boxShadow: "var(--shadow-arcane)" }}
        >
          <label htmlFor="incantation-type" className="sr-only">
            Type an incantation
          </label>
          <input
            id="incantation-type"
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Type the incantation…"
            autoComplete="off"
            autoCorrect="off"
            disabled={disabled}
            className="h-10 w-full rounded-xl border border-primary/25 bg-background/70 px-3 font-serif text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="mt-2 w-full rounded-full border border-primary/40 bg-primary/15 py-2 font-serif text-xs tracking-[0.2em] text-primary uppercase"
          >
            Cast
          </button>
        </form>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        aria-label={open ? "Close keyboard" : "Type an incantation"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-card/90 text-primary backdrop-blur transition-transform active:scale-95"
        style={{ boxShadow: "var(--shadow-glow)" }}
      >
        <Keyboard className="h-6 w-6" />
      </button>
    </div>
  );
}
