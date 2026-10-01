import type { JournalMode, PageStyle } from "../types";

export interface TypeOption {
  id: string;
  label: string;
  blurb: string;
}

export const ONGOING_TYPES: TypeOption[] = [
  { id: "childhood", label: "Childhood", blurb: "Every little first, and the everyday moments too." },
  { id: "relationship", label: "Relationship", blurb: "The story of you two, one moment at a time." },
  { id: "family", label: "Family", blurb: "The moments that make your family yours." },
  { id: "friends", label: "Friends", blurb: "The people who feel like home." },
  { id: "school", label: "School / College", blurb: "The years you'll want to remember clearly." },
  { id: "personal", label: "Personal", blurb: "A place just for you and your thoughts." },
  { id: "other", label: "Other", blurb: "Tell us what this journal is about." },
];

export const EXPERIENCE_TYPES: TypeOption[] = [
  { id: "vacation", label: "Vacation / Travel", blurb: "Turn the trip into a story you can flip through." },
  { id: "wedding", label: "Wedding", blurb: "The day, told the way you felt it." },
  { id: "birthday", label: "Birthday", blurb: "The celebration, kept exactly as it happened." },
  { id: "graduation", label: "Graduation", blurb: "The finish line, and everything it took to get there." },
  { id: "anniversary", label: "Anniversary", blurb: "A milestone worth writing down." },
  { id: "celebration", label: "Celebration", blurb: "A reason to remember, in your own words." },
  { id: "specialEvent", label: "Special Event", blurb: "One day, written down before it fades." },
  { id: "other", label: "Other", blurb: "Tell us what this experience was." },
];

export function getTypeOptions(mode: JournalMode): TypeOption[] {
  return mode === "ongoing" ? ONGOING_TYPES : EXPERIENCE_TYPES;
}

export function getTypeLabel(mode: JournalMode, journalType: string, customTypeDescription: string): string {
  if (journalType === "other") return customTypeDescription || "Other";
  const option = getTypeOptions(mode).find((t) => t.id === journalType);
  return option?.label ?? journalType;
}

export const IDEA_CHIPS: Record<string, string[]> = {
  childhood: ["First word", "Something funny they said", "A normal day I want to remember"],
  relationship: ["How we met", "Our first date", "A small thing you do that I love"],
  family: ["A family dinner", "Something a grandparent always says", "A trip we took together"],
  friends: ["How we met", "A trip we took together", "An inside joke"],
  school: ["A favorite class", "A friend I made", "A moment I'll never forget"],
  personal: ["Something on my mind lately", "A small win today", "How I'm feeling right now"],
  vacation: ["First day there", "Best meal", "The moment I didn't want to leave"],
  wedding: ["Getting ready", "The vows", "The first dance"],
  birthday: ["The surprise", "Who came", "The cake"],
  graduation: ["Walking the stage", "Who was there", "What I'm proud of"],
  anniversary: ["How we celebrated", "What's changed", "What hasn't"],
  celebration: ["The moment it started", "Who made it special", "What I'll remember"],
  specialEvent: ["What happened", "Who was there", "The best part"],
  other: ["What happened", "Who was there", "Why it mattered"],
};

export function getIdeaChips(journalType: string): string[] {
  return IDEA_CHIPS[journalType] ?? IDEA_CHIPS.other;
}

export type ToneKey =
  | "sweet"
  | "romantic"
  | "warm"
  | "playful"
  | "reflective"
  | "vivid"
  | "joyful"
  | "proud";

const TONE_BY_TYPE: Record<string, ToneKey> = {
  childhood: "sweet",
  relationship: "romantic",
  family: "warm",
  friends: "playful",
  school: "playful",
  personal: "reflective",
  vacation: "vivid",
  wedding: "joyful",
  birthday: "joyful",
  graduation: "proud",
  anniversary: "romantic",
  celebration: "joyful",
  specialEvent: "joyful",
};

export function getTone(journalType: string, customTypeDescription: string): ToneKey {
  if (journalType in TONE_BY_TYPE) return TONE_BY_TYPE[journalType];
  const text = customTypeDescription.toLowerCase();
  if (/(love|partner|husband|wife|boyfriend|girlfriend|fianc)/.test(text)) return "romantic";
  if (/(baby|child|kid|son|daughter)/.test(text)) return "sweet";
  if (/(trip|travel|vacation|abroad)/.test(text)) return "vivid";
  if (/(grad|degree|diploma)/.test(text)) return "proud";
  if (/(wedding|married|anniversary)/.test(text)) return "joyful";
  return "warm";
}

export interface DesignPreset {
  id: string;
  name: string;
  coverColor: string;
  accentColor: string;
  titleFont: string;
  pageStyle: PageStyle;
  suggestedFor: string[];
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: "classicLeather",
    name: "Classic Leather",
    coverColor: "#5B3A29",
    accentColor: "#C9A227",
    titleFont: "playfair",
    pageStyle: "vintage",
    suggestedFor: ["personal", "other"],
  },
  {
    id: "softBabyPastel",
    name: "Soft Baby Pastel",
    coverColor: "#D9ECE4",
    accentColor: "#6F9C8B",
    titleFont: "lora",
    pageStyle: "plain",
    suggestedFor: ["childhood"],
  },
  {
    id: "romanticBlush",
    name: "Romantic Blush",
    coverColor: "#E8C6C6",
    accentColor: "#A24E5A",
    titleFont: "caveat",
    pageStyle: "lined",
    suggestedFor: ["relationship", "wedding", "anniversary"],
  },
  {
    id: "familyHeritage",
    name: "Family Heritage",
    coverColor: "#77816A",
    accentColor: "#3F3A2E",
    titleFont: "garamond",
    pageStyle: "vintage",
    suggestedFor: ["family", "school", "friends"],
  },
  {
    id: "modernMinimal",
    name: "Modern Minimal",
    coverColor: "#EDE8DE",
    accentColor: "#2F2F2F",
    titleFont: "lora",
    pageStyle: "plain",
    suggestedFor: ["personal"],
  },
  {
    id: "travelNotebook",
    name: "Travel Notebook",
    coverColor: "#C08A4E",
    accentColor: "#4A3117",
    titleFont: "garamond",
    pageStyle: "dotted",
    suggestedFor: ["vacation", "graduation", "celebration", "specialEvent", "birthday"],
  },
];

export function suggestPreset(journalType: string): DesignPreset {
  const match = DESIGN_PRESETS.find((p) => p.suggestedFor.includes(journalType));
  return match ?? DESIGN_PRESETS.find((p) => p.id === "modernMinimal")!;
}

export const COVER_COLORS = [
  "#EDE8DE", // cream
  "#E8C6C6", // blush
  "#77816A", // sage
  "#7B93A6", // dusty blue
  "#C08A4E", // terracotta
  "#3A3A3A", // charcoal
  "#C9A227", // mustard
  "#A79BC1", // lavender
  "#5B3A29", // deep brown
  "#D9ECE4", // soft mint
];

export const TITLE_FONTS: { id: string; label: string; cssClass: string }[] = [
  { id: "lora", label: "Lora", cssClass: "font-serif" },
  { id: "playfair", label: "Playfair Display", cssClass: "font-playfair" },
  { id: "garamond", label: "EB Garamond", cssClass: "font-garamond" },
  { id: "caveat", label: "Caveat", cssClass: "font-caveat" },
];

export function fontClassFor(titleFont: string): string {
  return TITLE_FONTS.find((f) => f.id === titleFont)?.cssClass ?? "font-serif";
}

export const PAGE_STYLES: { id: PageStyle; label: string }[] = [
  { id: "plain", label: "Plain" },
  { id: "lined", label: "Lined" },
  { id: "dotted", label: "Dotted" },
  { id: "vintage", label: "Kraft / Vintage" },
];
