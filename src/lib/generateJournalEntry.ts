import { getTone, type ToneKey } from "./journalTypes";

export interface WritingContext {
  mode: "ongoing" | "experience";
  journalType: string;
  customTypeDescription: string;
  subject: string;
}

export interface GeneratedEntry {
  title: string;
  text: string;
  /** The cleaned-up version of the user's own sentences, with no added opener/closer. */
  bodyOnly: string;
  variantIndex: number;
  warm: boolean;
}

// Every line here is written pronoun-neutral on purpose: the opener/closer wraps
// the user's own sentences, so it must never assert "I" or "we" and risk
// contradicting whatever perspective the user actually wrote in.
const TONE_LINES: Record<ToneKey, { openers: string[]; closers: string[]; warmBoost: string }> = {
  sweet: {
    openers: [
      "Here's a little moment worth keeping.",
      "One of those small things worth never forgetting.",
      "A little piece of the everyday, written down.",
    ],
    closers: [
      "A small thing, but it made the day.",
      "A moment worth remembering exactly as it felt.",
      "Moments like this are worth keeping.",
    ],
    warmBoost: "A moment that fills the heart just thinking about it.",
  },
  romantic: {
    openers: [
      "A moment worth remembering clearly.",
      "One to come back to.",
      "Some moments deserve to be written down properly, and this is one of them.",
    ],
    closers: [
      "A lucky thing, to have this as part of the story.",
      "A feeling worth coming back to.",
      "One of those moments worth choosing again.",
    ],
    warmBoost: "A moment that still feels like something worth holding onto.",
  },
  warm: {
    openers: [
      "Here's a moment worth holding onto.",
      "This is one for the family stories.",
      "A moment worth keeping close.",
    ],
    closers: [
      "The kind of moment that stays with you.",
      "Glad this one got written down.",
      "These are the moments that add up to everything.",
    ],
    warmBoost: "A reminder of how lucky moments like this are.",
  },
  playful: {
    openers: [
      "Okay, this one's worth remembering.",
      "This is a good one.",
      "Here's a moment worth laughing about later.",
    ],
    closers: [
      "Classic, and wouldn't have it any other way.",
      "A story worth telling again.",
      "Good times, worth writing down.",
    ],
    warmBoost: "It's the little moments like this that make everything worth it.",
  },
  reflective: {
    openers: [
      "Here's what's been on the mind lately.",
      "Writing this down to remember how it felt.",
      "A moment worth sitting with for a bit.",
    ],
    closers: [
      "Worth getting down before it faded.",
      "It helps to write this out.",
      "This felt worth remembering, exactly as it was.",
    ],
    warmBoost: "A reminder to be a little gentler about it.",
  },
  vivid: {
    openers: [
      "Here's what this day looked like.",
      "Worth remembering exactly how this felt.",
      "One worth keeping the details of.",
    ],
    closers: [
      "Still clear as a picture.",
      "Days like this are worth it.",
      "Glad it happened this way.",
    ],
    warmBoost: "The kind of day worth thinking back on for years.",
  },
  joyful: {
    openers: [
      "What a day this was.",
      "Here's a moment worth celebrating.",
      "Worth remembering every part of this.",
    ],
    closers: [
      "It was everything hoped for.",
      "So glad this happened.",
      "A day worth keeping, start to finish.",
    ],
    warmBoost: "A day that filled the heart completely.",
  },
  proud: {
    openers: [
      "Here's a moment worth being proud of.",
      "This one's worth writing down properly.",
      "Worth remembering exactly how this felt.",
    ],
    closers: [
      "It took a lot to get here, and it was worth it.",
      "A moment worth being proud of.",
      "A moment worth looking back on for a long time.",
    ],
    warmBoost: "A pride worth holding onto.",
  },
};

const BANNED_PATTERN =
  /\b(cherish(ed|ing)?|treasure[sd]?|tapestry|testament|whirlwind|journey|embark(ed|ing)?|delve[sd]?|heartwarming|little did (I|we|he|she|they) know|forever grateful|etched in my memory)\b/gi;

function stripDashes(text: string): string {
  return text.replace(/[–—]/g, ", ").replace(/ ,/g, ",").replace(/,\s*,/g, ",");
}

function stripBannedPhrases(text: string): string {
  return text.replace(BANNED_PATTERN, "").replace(/\s{2,}/g, " ").trim();
}

export function cleanBody(roughNote: string): string {
  const sentences = roughNote
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .map((sentence) => {
      const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
    });
  return sentences.join(" ");
}

function titleCase(words: string[]): string {
  const minor = new Set(["a", "an", "and", "at", "for", "in", "of", "on", "the", "to", "with"]);
  return words
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i > 0 && minor.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function suggestTitle(roughNote: string): string {
  const firstSentence = roughNote.replace(/\s+/g, " ").trim().split(/[.!?]/)[0] ?? "";
  const words = firstSentence
    .replace(/[^a-zA-Z0-9' ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 6);
  if (words.length === 0) return "A Memory";
  return titleCase(words);
}

/** The one place that knows how a rough note becomes a written memory. Swap the fetch below for a real AI call whenever you're ready — everything else stays the same. */
export async function generateJournalEntry(
  roughNote: string,
  context: WritingContext,
  variantIndex = 0,
  warm = false
): Promise<GeneratedEntry> {
  const trimmedNote = roughNote.trim();
  if (!trimmedNote) {
    return { title: "", text: "", bodyOnly: "", variantIndex, warm };
  }

  try {
    const res = await fetch("/api/generate-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roughNote: trimmedNote, context, variantIndex, warm }),
    });
    if (res.ok) {
      const data = (await res.json()) as Partial<GeneratedEntry>;
      if (data.text) {
        return {
          title: data.title ?? suggestTitle(trimmedNote),
          text: stripDashes(data.text),
          bodyOnly: data.bodyOnly ?? cleanBody(trimmedNote),
          variantIndex,
          warm,
        };
      }
    }
  } catch {
    // No backend reachable — fall through to the offline version below.
  }

  return offlineRewrite(trimmedNote, context, variantIndex, warm);
}

/**
 * Placeholder "writing assistant". Never invents facts: it only wraps the
 * user's own cleaned-up sentences with a tone-appropriate opener and closer
 * (pure feeling, no new details) chosen from the journal's type. Real AI
 * (via the API route above) does true rewriting once connected.
 */
function offlineRewrite(
  roughNote: string,
  context: WritingContext,
  variantIndex: number,
  warm: boolean
): GeneratedEntry {
  const tone = getTone(context.journalType, context.customTypeDescription);
  const lines = TONE_LINES[tone];
  const body = cleanBody(roughNote);
  const idx = ((variantIndex % 3) + 3) % 3;

  const opener = lines.openers[idx];
  let closer = lines.closers[idx];
  if (warm) closer = `${closer} ${lines.warmBoost}`;

  const text = stripBannedPhrases(stripDashes(`${opener} ${body} ${closer}`));

  return {
    title: suggestTitle(roughNote),
    text,
    bodyOnly: body,
    variantIndex,
    warm,
  };
}
