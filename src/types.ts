export type JournalMode = "ongoing" | "experience";
export type PageStyle = "plain" | "lined" | "dotted" | "vintage";
export type PageOrderMode = "byDate" | "manual";

/**
 * How a memory's page is composed. The "-spread" layouts use the photo and
 * the story as two facing pages of one open spread; the others are a single page.
 */
export type MemoryLayout =
  | "photo-story-spread"
  | "story-photo-spread"
  | "photo-top"
  | "centered"
  | "text-focus"
  | "scrapbook";

export interface JournalDesign {
  presetId: string; // a DESIGN_PRESETS id, or "custom"
  coverColor: string;
  coverImage: string | null;
  titleFont: string; // a TITLE_FONTS id
  pageStyle: PageStyle;
  accentColor: string;
}

export interface Journal {
  id: string;
  title: string;
  mode: JournalMode;
  journalType: string; // an id from ONGOING_TYPES / EXPERIENCE_TYPES, or "other"
  customTypeDescription: string;
  subject: string;
  dateLabel: string;
  design: JournalDesign;
  pageOrderMode: PageOrderMode;
  createdAt: string;
  updatedAt: string;
}

export interface Memory {
  id: string;
  journalId: string;
  title: string;
  date: string; // ISO date, or "" if none given
  showDate: boolean;
  roughNote: string;
  writtenText: string;
  photos: string[]; // MVP only ever uses photos[0]
  layout?: MemoryLayout; // absent on memories saved before layouts existed; resolved with a fallback at render time
  order: number;
  usedOwnWords: boolean; // stats: saved their own words instead of the written version
  editedBeforeSaving: boolean; // stats: edited the written version before saving
  createdAt: string;
  updatedAt: string;
}

export interface BookInterest {
  journalId: string;
  clickedAt: string;
}
