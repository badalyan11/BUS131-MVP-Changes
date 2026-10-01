import type { Memory, MemoryLayout } from "../types";

export interface LayoutOption {
  id: MemoryLayout;
  label: string;
  /** Whether this layout needs a photo to make sense. */
  needsPhoto: boolean;
  /** Whether this layout uses the photo and the story as two facing pages of one spread. */
  isSpread: boolean;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  { id: "photo-story-spread", label: "Photo / Story spread", needsPhoto: true, isSpread: true },
  { id: "story-photo-spread", label: "Story / Photo spread", needsPhoto: true, isSpread: true },
  { id: "photo-top", label: "Photo top, story below", needsPhoto: true, isSpread: false },
  { id: "centered", label: "Centered photo", needsPhoto: true, isSpread: false },
  { id: "scrapbook", label: "Scrapbook", needsPhoto: true, isSpread: false },
  { id: "text-focus", label: "Mostly writing", needsPhoto: false, isSpread: false },
];

const PHOTO_ROTATION: MemoryLayout[] = [
  "photo-story-spread",
  "scrapbook",
  "story-photo-spread",
  "photo-top",
  "centered",
];

/** Picks a varied, sensible default layout for a newly created memory. */
export function pickDefaultLayout(hasPhoto: boolean, index: number): MemoryLayout {
  if (!hasPhoto) return "text-focus";
  return PHOTO_ROTATION[index % PHOTO_ROTATION.length];
}

/**
 * Resolves the effective layout for a memory: falls back to a deterministic
 * default for memories saved before layouts existed, and forces a
 * no-photo-friendly layout if the photo was since removed.
 */
export function resolveLayout(memory: Memory, index: number): MemoryLayout {
  const hasPhoto = memory.photos.length > 0;
  if (!hasPhoto) return "text-focus";
  if (memory.layout && LAYOUT_OPTIONS.some((l) => l.id === memory.layout)) return memory.layout;
  return pickDefaultLayout(hasPhoto, index);
}

export function layoutOptionsFor(hasPhoto: boolean): LayoutOption[] {
  return hasPhoto ? LAYOUT_OPTIONS : LAYOUT_OPTIONS.filter((l) => !l.needsPhoto);
}
