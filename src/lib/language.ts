import { useEffect, useState } from "react";
import type { Spell } from "@/data/spells";

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
  "Wand movement": "حرکت چوبدستی",
  "Recipe scroll": "طومار دستور",
  "Brew it": "دم کردن",
  Uses: "کاربردها",
  Dangers: "خطرات",
  Characteristics: "ویژگی‌ها",
  Difficulty: "درجه سختی",
  "Known ingredients": "مواد شناخته‌شده",
  "Brewing instructions": "دستور دم کردن",
  "More entries to be inscribed": "مدخل‌های بیشتری برای ثبت باقی مانده است",
  "Search the archives…": "در بایگانی جست‌وجو کنید…",
  "Search by name, effect, ingredient…": "بر اساس نام، اثر یا ماده جست‌وجو کنید…",
  "Close search": "بستن جست‌وجو",
  "Search the spellbook": "جست‌وجو در کتاب افسون‌ها",
  entry: "مدخل",
  entries: "مدخل",
  "found for": "برای عبارت پیدا شد",
  "Nothing written of that": "چیزی درباره آن نوشته نشده است",
  "These pages are still blank": "این صفحه‌ها هنوز خالی هستند",
  "No entries found.": "مدخلی پیدا نشد.",
  "Brewing bench": "میز دم کردن",
  "The potion is complete": "معجون کامل شد",
  "Turquoise light shimmers above the cauldron — full marks.": "نوری فیروزه‌ای بالای دیگ می‌درخشد — نمره کامل.",
  "Pink smoke curls from the cauldron — full marks.": "دودی صورتی از دیگ بالا می‌رود — نمره کامل.",
  "Brew again": "دوباره دم کنید",
  "Try again": "دوباره تلاش کنید",
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

const subjectBlurbs: Record<string, string> = {
  potions: "معجون‌ها و نوشیدنی‌هایی که با صبر دم می‌شوند.",
  charms: "افسون‌هایی که جهان را مطابق خواست شما تغییر می‌دهند.",
  flying: "درس‌های پرواز و هنر هدایت جارو.",
  transfigurations: "دگرگون کردن شکل و ماهیت اشیا.",
  herbology: "شناخت و پرورش گیاهان جادویی.",
  "care-of-magical-creatures": "شناخت و مراقبت از موجودات جادویی.",
  "defence-against-the-dark-arts": "دفاع در برابر نیروهای تاریک.",
  "history-of-magic": "روایت رویدادهای مهم جهان جادو.",
  divination: "هنر دیدن نشانه‌های آینده.",
  astronomy: "مطالعه آسمان و اجرام جادویی.",
  "muggle-studies": "شناخت زندگی و فرهنگ ماگل‌ها.",
};

export function localizeSubjectBlurb(id: string, blurb: string, persian: boolean) {
  return persian ? subjectBlurbs[id] ?? blurb : blurb;
}

export function translate(text: string, persian: boolean) {
  return persian ? translations[text] ?? text : text;
}

const spellText: Record<string, { description: string; movement?: string }> = {
  lumos: {
    description: "از نوک چوبدستی جادوگر روشنایی ایجاد می‌کند.",
    movement: "یک V رو به بالا، مانند مثلثی بدون ضلع پایینی.",
  },
  expelliarmus: {
    description: "افسون محبوب دوئل‌گران که چوبدستی حریف را از او می‌گیرد.",
    movement: "از بالا سمت چپ شروع کنید، به طرفین بکشید و سپس به پایین بروید.",
  },
  rictusempra: {
    description: "برای قلقلک دادن هر کسی در مسیر، دوست یا دشمن، عالی است.",
    movement: "از چپ شروع کنید، با قوسی به بالا بروید، به راست ادامه دهید و سپس به پایین برگردید.",
  },
  "wingardium-leviosa": {
    description: "حرکت «گار» را کشیده و زیبا ادا کنید.",
    movement: "از بالا سمت چپ شروع کنید، با قوسی نرم پایین بیایید، به راست بالا بروید و با ضربه‌ای آرام تمام کنید.",
  },
  alohomora: {
    description: "این افسون که دوست دزدها نامیده می‌شود، درهای بسته را باز می‌کند.",
    movement: "از بالا سمت راست شروع کنید، دایره‌ای خمیده خلاف جهت عقربه‌های ساعت بکشید و خطی مستقیم از مرکز به پایین بکشید.",
  },
  flipendo: {
    description: "به‌سادگی هدف جادوگر را به عقب پرتاب می‌کند.",
    movement: "از چپ شروع کنید، برای ساختن نوکی تیز پایین بروید، سپس به بالا خم شوید و با قلابی کوچک به راست پایان دهید.",
  },
  nox: {
    description: "نور انتهای چوبدستی جادوگر را خاموش می‌کند.",
    movement: "از پایین سمت چپ شروع کنید، با قوسی خمیده بالا بروید، به داخل خم شوید و به سمت راست پایان دهید.",
  },
};

const potionText: Record<string, NonNullable<Spell["potion"]>> = {
  "cure-for-boils": {
    method: "معجونی ساده برای درمان جوش‌ها که معمولاً استاد معجون‌سازی آن را به دانش‌آموزان سال اول می‌آموزد.",
    uses: "برای درمان جوش‌ها",
    dangers: "اگر نادرست مخلوط شود می‌تواند باعث ایجاد جوش شود.",
    difficulty: "مبتدی",
    characteristics: "آبی‌رنگ است و هنگام آماده شدن دود صورتی از دیگ بالا می‌رود.",
    ingredients: ["گزنه خشک", "۶ نیش مار", "۴ لیسه شاخ‌دار", "۲ پر خارپشت"],
    instructions: [
      "۶ نیش مار را در هاون بریزید.",
      "آن‌ها را با دسته‌هاون به پودری نرم تبدیل کنید.",
      "پیش از افزودن ماده بعدی، دیگ را از روی آتش بردارید.",
      "گزنه خشک و لیسه‌های شاخ‌دار را اضافه کنید.",
      "۲ پر خارپشت را به دیگ اضافه کنید.",
      "۵ بار در جهت عقربه‌های ساعت هم بزنید.",
      "برای کامل کردن معجون چوبدستی خود را تکان دهید.",
    ],
    lore: [
      "معجونی ابتدایی است که به دانش‌آموزان سال اول هاگوارتز آموزش داده می‌شود.",
      "دیگ باید پیش از افزودن پرهای خارپشت از روی آتش برداشته شود.",
    ],
    steps: [
      { prompt: "دم کردن معجون را آغاز کنید.", answer: "۶ نیش مار را در هاون بریزید", decoys: ["گزنه را در دیگ بریزید", "چوبدستی خود را تکان دهید"] },
      { prompt: "نیش‌ها در هاون هستند.", answer: "آن‌ها را با دسته‌هاون به پودری نرم تبدیل کنید", decoys: ["آن‌ها را مستقیم در دیگ بریزید", "پرهای خارپشت را اضافه کنید"] },
      { prompt: "پودر آماده است و دیگ روی آتش می‌جوشد.", answer: "دیگ را از روی آتش بردارید", decoys: ["شعله را بیشتر کنید", "پرها را هنگام جوشیدن اضافه کنید"] },
      { prompt: "دیگ از روی شعله برداشته شده است.", answer: "گزنه خشک و لیسه‌های شاخ‌دار را اضافه کنید", decoys: ["اول پرهای خارپشت را اضافه کنید", "خلاف جهت عقربه‌های ساعت هم بزنید"] },
      { prompt: "معجون تیره‌تر می‌شود.", answer: "۲ پر خارپشت را اضافه کنید", decoys: ["۶ پر خارپشت اضافه کنید", "دیگ را دوباره روی آتش بگذارید"] },
      { prompt: "همه مواد در دیگ هستند.", answer: "۵ بار در جهت عقربه‌های ساعت هم بزنید", decoys: ["۵ بار خلاف جهت عقربه‌های ساعت هم بزنید", "۱۲ بار در جهت عقربه‌های ساعت هم بزنید"] },
      { prompt: "معجون آبی می‌شود.", answer: "برای کامل کردن معجون چوبدستی خود را تکان دهید", decoys: ["فوراً آن را بطری کنید", "آتش را خاموش کنید"] },
    ],
  },
  wiggenweld: {
    method: "معجونی درمانی و پیچیده که با ترتیب دقیقی از خون سمندر، خارماهی، مخاط فلابرورم، آب عسل و آب توت انفجاری دم می‌شود.",
    uses: "یک معجون ترمیم‌کننده برای نوشیدن",
    dangers: "خطرات دم کردن در منبع مشخص نشده است.",
    difficulty: "پیشرفته",
    characteristics: "معجون در هر مرحله رنگ‌های گوناگونی پیدا می‌کند و پس از خنک شدن آماده مصرف است.",
    ingredients: ["خون سمندر", "۵ خارماهی", "۵ خارماهی دیگر", "مخاط فلابرورم", "آب عسل", "آب توت انفجاری"],
    instructions: [
      "خون سمندر را تا قرمز شدن معجون اضافه کنید.", "هم بزنید تا نارنجی شود.", "خون سمندر بیشتری اضافه کنید تا زرد شود.",
      "هم بزنید تا سبز شود.", "خون سمندر بیشتری اضافه کنید تا فیروزه‌ای شود.", "حرارت دهید تا نیلی شود.",
      "خون سمندر بیشتری اضافه کنید تا صورتی شود.", "حرارت دهید تا قرمز شود.", "پنج خارماهی اضافه کنید.",
      "حرارت دهید تا زرد شود.", "پنج خارماهی دیگر اضافه کنید.", "مخاط فلابرورم را تا بنفش شدن اضافه کنید.",
      "هم بزنید تا قرمز شود.", "مخاط بیشتری اضافه کنید تا نارنجی شود.", "هم بزنید تا زرد شود.",
      "آب عسل را تا فیروزه‌ای شدن اضافه کنید.", "چند قطره آب توت انفجاری اضافه کنید.", "دوباره هم بزنید و سی دقیقه آرام بجوشانید.",
      "معجون را از روی حرارت بردارید و بگذارید خنک شود.", "پس از خنک شدن، معجون آماده مصرف است.",
    ],
    lore: ["نام آن از درخت ویگن و واژه «جوش دادن» گرفته شده است.", "ویگن به معنای نیرو و شجاعت است."],
    steps: [],
  },
};

export function localizeSpell(spell: Spell, persian: boolean): Spell {
  if (!persian) return spell;
  const text = spellText[spell.id];
  const potion = spell.potion ? potionText[spell.id] : undefined;
  return {
    ...spell,
    description: text?.description ?? spell.description,
    ...(text?.movement ?? spell.movement ? { movement: text?.movement ?? spell.movement } : {}),
    ...(spell.potion ? {
      potion: potion
        ? { ...potion, steps: potion.steps.length ? potion.steps : spell.potion.steps }
        : spell.potion,
    } : {}),
  };
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
