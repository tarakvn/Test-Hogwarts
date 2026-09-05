import { useEffect, useState } from "react";

export const LANGUAGE_EVENT = "spellbook-language-change";

const translations: Record<string, string> = {
  Cast: "بازگشت",
  LESSONS: "درس‌ها",
  Speak: "صحبت",
  "Speak, and it shall be": "بگو تا انجام شود",
  "Type the incantation…": "افسون را بنویسید…",
  "Draw the wand movement": "حرکت چوبدستی را بکشید",
  "Move your wand to draw the movement.": "چوبدستی را حرکت دهید تا مسیر را بکشید.",
  "Move your finger, or allow motion access to use your wand.": "با انگشت بکشید یا دسترسی حرکت را فعال کنید.",
  "Your browser can't hear incantations.": "مرورگر شما نمی‌تواند افسون‌ها را بشنود.",
  "The potion is complete": "معجون کامل شد",
  "Brew again": "دوباره دم کنید",
  Potions: "معجون‌ها",
  Charms: "افسون‌ها",
  Flying: "پرواز",
  Transfigurations: "تغییر شکل",
  Herbology: "گیاه‌شناسی",
  "Care of Magical Creatures": "مراقبت از موجودات جادویی",
  "Defence Against the Dark Arts": "دفاع در برابر جادوی سیاه",
  "History of Magic": "تاریخ جادو",
  Divination: "پیشگویی",
  Astronomy: "ستاره‌شناسی",
  "Muggle Studies": "مطالعات ماگل‌ها",
};

export function translate(text: string, persian: boolean) {
  return persian ? translations[text] ?? text : text;
}

export function usePersianLanguage() {
  const [persian, setPersian] = useState(false);

  useEffect(() => {
    const sync = () => setPersian(window.localStorage.getItem("spellbook-language") === "fa");
    sync();
    window.addEventListener(LANGUAGE_EVENT, sync);
    return () => window.removeEventListener(LANGUAGE_EVENT, sync);
  }, []);

  return persian;
}
