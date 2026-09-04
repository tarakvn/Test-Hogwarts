import lumosIcon from "@/assets/lumos-icon.png";
import expelliarmusIcon from "@/assets/expelliarmus-icon.png";
import boilsIcon from "@/assets/cure-for-boils-icon.png";
import rictusempraIcon from "@/assets/rictusempra-icon.png";

export type SpellEffect = "torch" | "disarm" | "galaxy" | "brew" | "tickle";
export type SpellCategory = "charm" | "potion";

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
  /** SVG path of the wand movement, drawn inside a 0 0 100 100 viewBox */
  wandPath?: string;
  /** Human description of the wand movement */
  movement?: string;
  effect: SpellEffect;
  icon: string;
  /** Extra accepted speech transcriptions */
  aliases: string[];
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

/** Lumos wand movement: an upward-pointing V, like a triangle with no base (∧). */
const LUMOS_PATH = "M 22 72 L 50 22 L 78 72";
/** Expelliarmus: a square missing its left and bottom sides, starting top-left. */
const EXPELLIARMUS_PATH = "M 24 24 L 76 24 L 76 76";
const RICTUSEMPRA_PATH = "M 4 72 " + "C 14 75, 18 69, 21 57 " + "C 24 42, 28 27, 41 19 " + "C 54 11, 74 11, 95 19 " + "C 84 28, 71 36, 58 45 " + "C 52 49, 47 51, 39 51 " + "C 39 45, 40 40, 43 36 " + "C 46 33, 50 31, 54 29";

export const spells: Spell[] = [
  {
    id: "lumos",
    name: "Lumos",
    pronunciation: "LOO-mos",
    description: "Provides illumination from the tip of caster's wand.",
    category: "charm",
    wandPath: LUMOS_PATH,
    movement: "An upward-pointing V, like a triangle missing its base.",
    effect: "torch",
    icon: lumosIcon,
    aliases: ["loomos", "lumus", "lumose", "loo mos", "lomos", "luminous"],
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
    ],
  },
  {
    id: "cure-for-boils",
    name: "Cure for Boils Potion",
    pronunciation: "Boil Cure",
    description: "A must-know for any teenager wizard.",
    category: "potion",
    effect: "brew",
    icon: boilsIcon,
    aliases: ["boil cure", "cure for boils"],
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
export const counterWords = ["nox", "knox", "knocks", "nocks", "nokes", "nooks", "no ox"];

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
