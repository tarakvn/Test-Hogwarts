import { useEffect, useState } from "react";

const STORAGE_KEY = "spellbook-language";

export function LanguageToggle() {
  const [persian, setPersian] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) === "fa";
    setPersian(saved);
    document.documentElement.lang = saved ? "fa" : "en";
    document.documentElement.dir = saved ? "rtl" : "ltr";
  }, []);

  const toggle = () => {
    const next = !persian;
    setPersian(next);
    window.localStorage.setItem(STORAGE_KEY, next ? "fa" : "en");
    document.documentElement.lang = next ? "fa" : "en";
    document.documentElement.dir = next ? "rtl" : "ltr";
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={persian ? "Switch to English" : "Switch to Persian"}
      className="fixed top-4 right-4 z-50 rounded-full border border-primary/40 bg-card/90 px-3 py-2 font-serif text-xs tracking-[0.12em] text-primary uppercase backdrop-blur transition-transform active:scale-95"
    >
      {persian ? "English" : "فارسی"}
    </button>
  );
}
