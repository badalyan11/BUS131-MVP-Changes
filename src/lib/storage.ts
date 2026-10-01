import type { BookInterest, Journal, Memory } from "../types";

const JOURNALS_KEY = "life-journal:journals";
const MEMORIES_KEY = "life-journal:memories";
const BOOK_INTERESTS_KEY = "life-journal:book-interests";
const HAS_SEEN_WELCOME_KEY = "life-journal:has-seen-welcome";

function load<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const loadJournals = () => load<Journal>(JOURNALS_KEY);
export const saveJournals = (journals: Journal[]) => save(JOURNALS_KEY, journals);

export const loadMemories = () => load<Memory>(MEMORIES_KEY);
export const saveMemories = (memories: Memory[]) => save(MEMORIES_KEY, memories);

export const loadBookInterests = () => load<BookInterest>(BOOK_INTERESTS_KEY);
export const saveBookInterests = (interests: BookInterest[]) => save(BOOK_INTERESTS_KEY, interests);

export function hasSeenWelcome(): boolean {
  return localStorage.getItem(HAS_SEEN_WELCOME_KEY) === "true";
}

export function markWelcomeSeen(): void {
  localStorage.setItem(HAS_SEEN_WELCOME_KEY, "true");
}
