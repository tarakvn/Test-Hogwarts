//spells
import lumosIcon from "@/assets/lumos-icon.png";
import expelliarmusIcon from "@/assets/expelliarmus-icon.png";
import rictusempraIcon from "@/assets/rictusempra-icon.png";
import wingardiumleviosaIcon from "@/assets/wingardium-leviosa-icon.png";
import alohomoraIcon from "@/assets/alohomora-icon.png";
import flipendoIcon from "@/assets/flipendo-icon.png";
import noxIcon from "@/assets/nox-icon.png";
//potions
import boilsIcon from "@/assets/cure-for-boils-icon.png";
import wiggenweldIcon from "@/assets/wiggenweld-icon.png";



export type SpellEffect = "torch" | "disarm" | "galaxy" | "brew" | "tickle" | "levitate" | "unlock" | "flipendo";
export type SpellCategory = "charm" | "potion";
export type LibrarySubject =
  | "potions"
  | "charms"
  | "flying"
  | "transfigurations"
  | "herbology"
  | "care-of-magical-creatures"
  | "defence-against-the-dark-arts"
  | "history-of-magic"
  | "divination"
  | "astronomy"
  | "muggle-studies";

export const librarySubjects: { id: LibrarySubject; label: string; blurb: string }[] = [
  { id: "potions", label: "Potions", blurb: "Brews and draughts, simmered with patience." },
  { id: "charms", label: "Charms", blurb: "Incantations that bend the world to your will." },
  { id: "flying", label: "Flying", blurb: "Lessons in broomstick control and aerial grace." },
  { id: "transfigurations", label: "Transfigurations", blurb: "The disciplined art of changing form." },
  { id: "herbology", label: "Herbology", blurb: "Magical plants, roots, and their hidden properties." },
  { id: "care-of-magical-creatures", label: "Care of Magical Creatures", blurb: "Respect and care for magical beasts." },
  { id: "defence-against-the-dark-arts", label: "Defence Against the Dark Arts", blurb: "Protective magic for dangerous encounters." },
  { id: "history-of-magic", label: "History of Magic", blurb: "The stories behind wizarding history." },
  { id: "divination", label: "Divination", blurb: "Seek signs in the patterns around you." },
  { id: "astronomy", label: "Astronomy", blurb: "The magic of stars, planets, and celestial motion." },
  { id: "muggle-studies", label: "Muggle Studies", blurb: "Understanding the non-magical world." },
];

export interface BrewStep {
  /** Prompt shown to the apprentice */
  prompt: string;
  /** The one correct action */
  answer: string;
  /** Wrong actions offered alongside the answer */
  decoys: string[];
}

export interface Spell {
  id: string;
  name: string;
  pronunciation: string;
  description: string;
  category: SpellCategory;
  subject?: LibrarySubject;
  /** SVG path of the wand movement, drawn inside a 0 0 100 100 viewBox */
  wandPath?: string;
  /** Optional simpler path used to recognize a live wand / gyro stroke */
  gesturePath?: string;
  /** Human description of the wand movement */
  movement?: string;
  effect: SpellEffect;
  icon: string;
  /** Extra accepted speech transcriptions */
  aliases: string[];
  /** Each group must appear in the transcript (handles mangled incantations). */
  speechGroups?: string[][];
  /** Potion-only lore */
  potion?: {
    method: string;
    uses: string;
    dangers: string;
    difficulty: string;
    characteristics: string;
    ingredients: string[];
    instructions: string[];
    lore: string[];
    steps: BrewStep[];
  };
}

/** Persian text that can be customized per charm or potion without changing its name. */
export interface PersianSpellTranslation {
  description?: string;
  movement?: string;
  difficulty?: string;
}

export const persianSpellTranslations: Record<string, PersianSpellTranslation> = {
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
  "cure-for-boils": {
    difficulty: "سطح دم کردن: مقدماتی. این معجون برای جادوگران تازه‌کار مناسب است.",
  },
  wiggenweld: {
    difficulty: "سطح دم کردن: پیشرفته. برای آماده‌سازی این معجون به دقت و صبر زیادی نیاز است.",
  },
};

const LUMOS_PATH = "M 22 72 L 50 22 L 78 72";
const EXPELLIARMUS_PATH = "M 24 24 L 76 24 L 76 76";
const RICTUSEMPRA_PATH = "M 4 72 " + "C 14 75, 18 69, 21 57 " + "C 24 42, 28 27, 41 19 " + "C 54 11, 74 11, 95 19 " + "C 84 28, 71 36, 58 45 " + "C 52 49, 47 51, 39 51 " + "C 39 45, 40 40, 43 36 " + "C 46 33, 50 31, 54 29";
const WINGARDIUM_LEVIOSA_PATH = "M 18 18 " + "C 18 45, 30 72, 50 72 " + "C 70 72, 82 48, 82 18 " + "C 82 35, 82 55, 82 78";
const ALOHOMORA_PATH = "M 70 15 " + "C 82 20, 88 35, 82 50 " + "C 76 65, 58 70, 42 62 " + "C 25 54, 18 35, 28 22 " + "C 38 10, 52 12, 52 12 " + "L 52 88";
const FLIPENDO_PATH = "M 20 40 " + "L 30 52 " + "C 35 42, 42 27, 48 18 " + "C 52 12, 57 14, 60 20 " + "C 63 26, 68 25, 73 22 " + "C 77 20, 80 16, 80 12";
const NOX_PATH = "M 14 70 " + "C 18 58, 22 40, 30 31" + "C 40 20, 48 15, 58 17" + "C 68 22, 78 29, 84 34" + "C 76 33, 68 31, 62 33" + "C 53 36, 49 44, 53 53" + "C 57 63, 69 70, 84 70";

export const spells: Spell[] = [
  //spells
  //first year
  {
    id: "lumos",
    name: "Lumos",
    pronunciation: "LOO-mos",
    description: "Provides illumination from the tip of caster's wand.",
    category: "charm",
    subject: "charms",
    wandPath: LUMOS_PATH,
    movement: "An upward-pointing V, like a triangle missing its base.",
    effect: "torch",
    icon: lumosIcon,
    aliases: [
      "loomos",
      "lumus",
      "lumose",
      "loo mos",
      "lomos",
      "luminous",
      "loom us",
      "loomas",
      "lumas",
      "loomis",
      "lumous",
      "loo most",
      "loomose",
      "bluemos",
    ],
  },
  {
    id: "expelliarmus",
    name: "Expelliarmus",
    pronunciation: "ex-PELL-ee-AR-mus",
    description: "The duelist's go-to charm, it relieves an opponent of his or her wand.",
    category: "charm",
    wandPath: EXPELLIARMUS_PATH,
    movement: "From the top left, across and then down — a square without its left and bottom sides.",
    effect: "disarm",
    icon: expelliarmusIcon,
    aliases: [
      "expeliarmus",
      "expelliarmous",
      "expeliarmous",
      "expelly armus",
      "expelly harmless",
      "expel your mouse",
      "expelliramus",
      "ex peli armus",
      "expel armus",
      "expel e armus",
      "excel armus",
      "expelli aramus",
      "expel aramus",
      "expel harm us",
      "expelli harm us",
      "expel armadillo",
      "expelli armadillo",
      "expel the armadillo",
      "expel army us",
      "expel le armus",
      "expelliar mus",
    ],
  },
  {
    id: "rictusempra",
    name: "Rictusempra",
    pronunciation: "rik-too-SEM-pra",
    description: "Great for tickling anyone in your path, friend or foe.",
    category: "charm",
    wandPath: RICTUSEMPRA_PATH,
    movement: "Start from the left, sweep upward in a curve, continue to the right, then curve back down.",
    effect: "tickle",
    icon: rictusempraIcon,
    aliases: [
      "rictusempera",
      "rictus sempra",
      "rictussempra",
      "rictus empra",
      "rictusembra",
      "rictus em pra",
      "rictus emperor",
      "rectus emperor",
      "rictus empire",
      "rectus empire",
      "ridiculous emperor",
      "ridiculous empire",
      "rictus temper",
      "rictus tempera",
      "rictus semper",
      "rectus sempra",
      "rick too sempra",
      "rick to sempra",
      "rick to simpler",
      "rictus and pra",
      "rictus impra",
      "rectus empra",
      "rictus simpler",
      "rictus umbra",
      "victus emperor",
      "rictus emperer",
      "rictus emperah",
    ],
    speechGroups: [
      ["rictus", "rectus", "ricktus", "riktus", "rictous", "victus", "ridiculous", "rick"],
      ["sempra", "empra", "emperor", "empire", "semper", "temper", "tempera", "simpler", "impra", "embra", "umbra", "emperer"],
    ],
  },
  {
    id: "wingardium-leviosa",
    name: "Wingardium Leviosa",
    pronunciation: "WING-gar-dium LEV-i-osa",
    description: "Make the 'gar' nice and long.",
    category: "charm",
    wandPath: WINGARDIUM_LEVIOSA_PATH,
    movement: "Start from the top left, sweep downward in a smooth curve, rise back up to the right, then finish with a downward flick.",
    effect: "levitate",
    icon: wingardiumleviosaIcon,
    aliases: [
      "wingardium leviosa",
      "wingardium leviosa",
      "wingardium leviosah",
      "wingardium levio sa",
      "wingardium leviosa charm",
      "wingardium leviosa spell",
      "wingardium leviosa spell",
      "wingardium",
      "wingardian leviosa",
      "wingardium leviousa",
      "wingardium leviosa",
      "wingardium leviosar",
      "wingardium leviosa",
      "wingardium levioser",
      "wingardium levioza",
      "wingardium leviosa",
      "wingardium naviosa",
      "wingardium leviosa",
      "wingardium leviosa please",
      "wingardium leviosaa",
    ],
  },
  {
    id: "alohomora",
    name: "Alohomora",
    pronunciation: "al-oh-ho-MOR-ah",
    description: "Known as the Thief's Friend, this charm unlocks and opens sealed doors.",
    category: "charm",
    wandPath: ALOHOMORA_PATH,
    movement: "Start from the top right, draw a curved circle counterclockwise, then pull a straight line downward through the center.",
    effect: "unlock",
    icon: alohomoraIcon,
    aliases: [
      "alohomora",
      "alo homora",
      "aloho mora",
      "alohomora spell",
      "alohomorah",
      "alo mora",
      "alohomorra",
      "alohomora",
      "alohamora",
      "alohomorra",
      "alo homorra",
    ],
  },
  {
    id: "flipendo",
    name: "Felipendo",
    pronunciation: "FLEE-pen-doe",
    description: "Quite simply knocks back the caster's target.",
    category: "charm",
    wandPath: FLIPENDO_PATH,
    movement: "Start from the left, sweep down to form a sharp point, then curve upward and finish with a small hook to the right.",
    effect: "flipendo",
    icon: flipendoIcon,
    aliases: [
      "flipendo",
      "felipendo",
      "fleependo",
      "fli pendo",
      "flee pendo",
      "flippendo",
      "flipendo spell",
      "flip endo",
      "flip into",
      "flippin do",
      "felipendo",
      "feli pendo",
    ],
  },
  {
    id: "nox",
    name: "Nox",
    pronunciation: "NOCKS",
    description: "Extinguishes the light at the end of the caster's wand",
    category: "charm",
    wandPath: NOX_PATH,
    movement: "Start from the lower left, sweep upward in a curved arc, then bend inward and finish toward the right.",
    effect: "torch",
    icon: noxIcon,
    aliases: [
      "nox",
      "nocks",
      "knox",
      "noks",
      "nox spell",
      "nox charm",
      "nocks spell",
      "nock",
      "noxx",
    ],
  },
  //potions
  //first year
  {
    id: "cure-for-boils",
    name: "Cure for Boils Potion",
    pronunciation: "Boil Cure",
    description: "A must-know for any teenager wizard.",
    category: "potion",
    subject: "potions",
    effect: "brew",
    icon: boilsIcon,
    aliases: [
      "boil cure",
      "cure for boils",
      "cure of boils",
      "cure boils",
      "boils potion",
      "boil potion",
    ],
    potion: {
      method:
        "A simple potion used to cure boils, often set by the Potions Master of Hogwarts to first-year Potions students.",
      uses: "To cure boils",
      dangers: "Can cause boils if mixed incorrectly",
      difficulty: "Beginner",
      characteristics: "Blue-coloured, with pink smoke rising from the cauldron when brewed correctly",
      ingredients: [
        "Dried nettles",
        "6 snake fangs",
        "4 horned slugs",
        "2 porcupine quills",
      ],
      instructions: [
        "Add 6 snake fangs to the mortar.",
        "Crush into a fine powder using the pestle.",
        "Take the cauldron off the fire before adding the next ingredient.",
        "Add dried nettles and horned slugs.",
        "Add 2 porcupine quills to your cauldron.",
        "Stir 5 times, clockwise.",
        "Wave your wand to complete the potion.",
      ],
      lore: [
        "An elementary potion taught to first-year students at Hogwarts; its recipe can be found in Magical Drafts and Potions.",
        "The cauldron must be taken off the fire before the porcupine quills go in — as Neville Longbottom discovered, otherwise the cauldron melts, reeks horribly, and any spill erupts the skin in vicious boils.",
      ],
      steps: [
        {
          prompt: "Begin the brew.",
          answer: "Add 6 snake fangs to the mortar",
          decoys: ["Pour the nettles into the cauldron", "Wave your wand"],
        },
        {
          prompt: "The fangs sit in the mortar.",
          answer: "Crush them to a fine powder with the pestle",
          decoys: ["Tip them straight into the cauldron", "Add the porcupine quills"],
        },
        {
          prompt: "The powder is ready. The cauldron simmers on the fire.",
          answer: "Take the cauldron off the fire",
          decoys: ["Turn the flame up higher", "Add the quills while it boils"],
        },
        {
          prompt: "The cauldron rests off the flame.",
          answer: "Add dried nettles and horned slugs",
          decoys: ["Add porcupine quills first", "Stir counter-clockwise"],
        },
        {
          prompt: "The brew darkens.",
          answer: "Add 2 porcupine quills",
          decoys: ["Add 6 porcupine quills", "Put the cauldron back on the fire"],
        },
        {
          prompt: "Everything is in the cauldron.",
          answer: "Stir 5 times, clockwise",
          decoys: ["Stir 5 times, counter-clockwise", "Stir 12 times, clockwise"],
        },
        {
          prompt: "The brew turns blue.",
          answer: "Wave your wand to complete the potion",
          decoys: ["Bottle it at once", "Blow out the fire"],
        },
      ],
    },
  },
  {
    id: "wiggenweld",
    name: "Wiggenweld Potion",
    pronunciation: "WIG-en-weld",
    description: "A complex healing potion of some renown.",
    category: "potion",
    effect: "brew",
    icon: wiggenweldIcon,
    aliases: [
      "wiggenweld",
      "wiggen weld",
      "wiggenweld potion",
      "wiggen weld potion",
      "wiggen weld potions",
      "wiggenweld potions",
      "wiggenwelt",
      "wiggenwell",
      "wiggen world",
      "wiggen wall",
    ],
    potion: {
      method:
        "A complex restorative potion brewed through a precise sequence of salamander blood, lionfish spines, Flobberworm Mucus, Honeywater, and boom berry juice, with the brew changing colour at each stage.",

      uses: "A restorative potion intended for consumption.",

      dangers:
        "The source provided does not specify brewing dangers.",

      difficulty: "Advanced",

      characteristics:
        "The potion changes through red, orange, yellow, green, turquoise, indigo, pink, red, yellow, purple, orange, yellow, and turquoise during the brewing process. The source does not specify a final colour after cooling.",

      ingredients: [
        "Salamander blood",
        "5 lionfish spines",
        "5 more lionfish spines",
        "Flobberworm Mucus",
        "Honeywater",
        "Boom berry juice",
      ],

      instructions: [
        "Add salamander blood until the potion turns red.",
        "Stir until the potion turns orange.",
        "Add more salamander blood until the potion turns yellow.",
        "Stir until the potion turns green.",
        "Add more salamander blood until the potion turns turquoise.",
        "Heat until the potion turns indigo.",
        "Add more salamander blood until the potion turns pink.",
        "Heat until the potion turns red.",
        "Add five lionfish spines.",
        "Heat until the potion turns yellow.",
        "Add five more lionfish spines.",
        "Add Flobberworm Mucus until the potion turns purple.",
        "Stir until it turns red.",
        "Add more Flobberworm Mucus until the potion turns orange.",
        "Stir until it turns yellow.",
        "Add Honeywater until it turns turquoise.",
        "Add a few drops of boom berry juice.",
        "Stir again and let it simmer for thirty minutes.",
        "Take the potion away from the heat and allow it to cool.",
        "When cooled, the potion is ready for consumption.",
      ],

      lore: [
        "The name refers to the Wiggen or Wiggentree and to the word 'weld'.",
        "Wiggen derives from old Breton for strength, bravery, or courage, while weld refers to joining by heating until melting.",
      ],

      steps: [
        {
          prompt: "Begin the brew.",
          answer: "Add salamander blood until the potion turns red",
          decoys: [
            "Add the lionfish spines",
            "Pour in the Honeywater",
          ],
        },
        {
          prompt: "The potion is red.",
          answer: "Stir until the potion turns orange",
          decoys: [
            "Heat until it turns indigo",
            "Add Flobberworm Mucus",
          ],
        },
        {
          prompt: "The potion is orange.",
          answer: "Add more salamander blood until the potion turns yellow",
          decoys: [
            "Add the boom berry juice",
            "Take the cauldron off the heat",
          ],
        },
        {
          prompt: "The potion is yellow.",
          answer: "Stir until the potion turns green",
          decoys: [
            "Add five lionfish spines",
            "Add Honeywater",
          ],
        },
        {
          prompt: "The potion is green.",
          answer: "Add more salamander blood until the potion turns turquoise",
          decoys: [
            "Add the Flobberworm Mucus",
            "Heat until it turns pink",
          ],
        },
        {
          prompt: "The potion is turquoise.",
          answer: "Heat until the potion turns indigo",
          decoys: [
            "Stir until it turns orange",
            "Add Honeywater",
          ],
        },
        {
          prompt: "The potion is indigo.",
          answer: "Add more salamander blood until the potion turns pink",
          decoys: [
            "Add five lionfish spines",
            "Remove it from the heat",
          ],
        },
        {
          prompt: "The potion is pink.",
          answer: "Heat until the potion turns red",
          decoys: [
            "Add Flobberworm Mucus",
            "Stir until it turns green",
          ],
        },
        {
          prompt: "The potion is red again.",
          answer: "Add five lionfish spines",
          decoys: [
            "Add five more lionfish spines immediately",
            "Add Honeywater",
          ],
        },
        {
          prompt: "The potion has been heated to yellow.",
          answer: "Add five more lionfish spines",
          decoys: [
            "Add salamander blood",
            "Take the potion away from the heat",
          ],
        },
        {
          prompt: "The lionfish spines are in.",
          answer: "Add Flobberworm Mucus until the potion turns purple",
          decoys: [
            "Add boom berry juice",
            "Stir until turquoise",
          ],
        },
        {
          prompt: "The potion is purple.",
          answer: "Stir until it turns red",
          decoys: [
            "Heat until it turns indigo",
            "Add Honeywater",
          ],
        },
        {
          prompt: "The potion is red.",
          answer: "Add more Flobberworm Mucus until the potion turns orange",
          decoys: [
            "Add more salamander blood",
            "Add the lionfish spines",
          ],
        },
        {
          prompt: "The potion is orange.",
          answer: "Stir until it turns yellow",
          decoys: [
            "Heat until turquoise",
            "Add Honeywater immediately",
          ],
        },
        {
          prompt: "The potion is yellow again.",
          answer: "Add Honeywater until it turns turquoise",
          decoys: [
            "Add salamander blood",
            "Add five lionfish spines",
          ],
        },
        {
          prompt: "The potion is turquoise.",
          answer: "Add a few drops of boom berry juice",
          decoys: [
            "Add more Flobberworm Mucus",
            "Add five lionfish spines",
          ],
        },
        {
          prompt: "The final ingredient is in.",
          answer: "Stir the potion and let it simmer for thirty minutes",
          decoys: [
            "Bottle it immediately",
            "Cool it without stirring",
          ],
        },
        {
          prompt: "The thirty-minute simmer is complete.",
          answer: "Take the potion away from the heat",
          decoys: [
            "Heat it for another thirty minutes",
            "Add more salamander blood",
          ],
        },
        {
          prompt: "The potion is off the heat.",
          answer: "Allow it to cool",
          decoys: [
            "Return it to the fire",
            "Add more Honeywater",
          ],
        },
        {
          prompt: "The potion has cooled.",
          answer: "The potion is ready for consumption",
          decoys: [
            "Add five more lionfish spines",
            "Continue heating it",
          ],
        },
      ],
    },
  },
];

/** Snape's remarks when an apprentice botches a step. */
export const snapeGrumbles = [
  "Obviously you did not read the instructions. One point from your house.",
  "Tut, tut — fame clearly isn't everything, is it?",
  "Have you the sense of a flobberworm? Start again.",
  "I see we have another Longbottom in the dungeons. Wipe that up.",
  "Do you never think before you stir? Pitiful.",
];

/** Spoken words that undo an active spell (Nox and near-transcriptions). */
export const counterWords = [
  "nox",
  "knox",
  "knocks",
  "nocks",
  "nokes",
  "nooks",
  "no ox",
  "knock",
];

export const categories: { id: SpellCategory; label: string; blurb: string }[] = [
  { id: "charm", label: "Charms", blurb: "Incantations that bend the world to your will." },
  { id: "potion", label: "Potions", blurb: "Brews and draughts, simmered with patience." },
];

export const getSpell = (id: string) => spells.find((s) => s.id === id);

/** Free-text search across names, descriptions, movements, ingredients. */
export function searchSpells(query: string): Spell[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return spells.filter((spell) =>
    [
      spell.name,
      spell.pronunciation,
      spell.description,
      spell.movement ?? "",
      spell.category,
      ...spell.aliases,
      spell.potion?.method ?? "",
      spell.potion?.uses ?? "",
      spell.potion?.dangers ?? "",
      spell.potion?.difficulty ?? "",
      ...(spell.potion?.ingredients ?? []),
      ...(spell.potion?.instructions ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}
