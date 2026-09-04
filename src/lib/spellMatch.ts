import { spells, counterWords, type Spell } from "@/data/spells";

export function normalizeSpoken(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function compactSpoken(text: string) {
  return normalizeSpoken(text).replace(/\s/g, "");
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min((curr[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]!;
  }
  return prev[b.length]!;
}

function compactNear(haystack: string, needle: string) {
  if (!needle) return false;
  if (haystack.includes(needle)) return true;
  if (needle.length < 8) return false;
  const maxDist = Math.max(2, Math.floor(needle.length * 0.28));
  const minLen = Math.max(6, needle.length - 3);
  const maxLen = needle.length + 4;
  for (let len = minLen; len <= Math.min(maxLen, haystack.length); len++) {
    for (let i = 0; i + len <= haystack.length; i++) {
      if (levenshtein(haystack.slice(i, i + len), needle) <= maxDist) return true;
    }
  }
  return false;
}

export function spokenIncludes(transcript: string, phrase: string) {
  const haystack = normalizeSpoken(transcript);
  const needle = normalizeSpoken(phrase);
  if (!needle) return false;
  if (haystack.includes(needle)) return true;
  const compactNeedle = compactSpoken(phrase);
  if (compactNeedle.length < 5) return false;
  return compactNear(compactSpoken(transcript), compactNeedle);
}

function tokenHits(haystack: string, compact: string, token: string) {
  const t = normalizeSpoken(token);
  if (!t) return false;
  if (t.length <= 4) {
    return new RegExp(`(?:^| )${t}(?: |$)`).test(haystack);
  }
  return haystack.includes(t) || compact.includes(t.replace(/\s/g, ""));
}

function groupsMatch(transcript: string, groups: string[][]) {
  const haystack = normalizeSpoken(transcript);
  const compact = compactSpoken(transcript);
  return groups.every((group) => group.some((token) => tokenHits(haystack, compact, token)));
}

export function spellPhrases(spell: Spell) {
  return [spell.name, spell.pronunciation, ...spell.aliases];
}

export function findSpell(transcript: string): Spell | null {
  const charmHits = spells.filter((spell) => {
    if (spell.speechGroups && groupsMatch(transcript, spell.speechGroups)) return true;
    return spellPhrases(spell).some((phrase) => spokenIncludes(transcript, phrase));
  });
  if (!charmHits.length) return null;
  // Prefer the longest matched incantation so "rictusempra" cannot lose to a short substring.
  return charmHits.sort((a, b) => b.name.length - a.name.length)[0] ?? null;
}

export function isCounter(transcript: string) {
  return counterWords.some((word) => spokenIncludes(transcript, word));
}
