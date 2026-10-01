import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { BookInterest, Journal, Memory } from "../types";
import {
  loadBookInterests,
  loadJournals,
  loadMemories,
  saveBookInterests,
  saveJournals,
  saveMemories,
} from "../lib/storage";

interface AppContextValue {
  journals: Journal[];
  memories: Memory[];
  bookInterests: BookInterest[];
  addJournal: (journal: Journal) => void;
  updateJournal: (id: string, updates: Partial<Journal>) => void;
  deleteJournal: (id: string) => void;
  getJournal: (id: string) => Journal | undefined;
  memoriesFor: (journalId: string) => Memory[];
  addMemory: (memory: Memory) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
  getMemory: (id: string) => Memory | undefined;
  reorderMemories: (journalId: string, orderedIds: string[]) => void;
  markBookInterest: (journalId: string) => void;
  hasBookInterest: (journalId: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [journals, setJournals] = useState<Journal[]>(() => loadJournals());
  const [memories, setMemories] = useState<Memory[]>(() => loadMemories());
  const [bookInterests, setBookInterests] = useState<BookInterest[]>(() => loadBookInterests());

  const addJournal = (journal: Journal) => {
    setJournals((prev) => {
      const next = [...prev, journal];
      saveJournals(next);
      return next;
    });
  };

  const updateJournal = (id: string, updates: Partial<Journal>) => {
    setJournals((prev) => {
      const next = prev.map((j) => (j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j));
      saveJournals(next);
      return next;
    });
  };

  const deleteJournal = (id: string) => {
    setJournals((prev) => {
      const next = prev.filter((j) => j.id !== id);
      saveJournals(next);
      return next;
    });
    setMemories((prev) => {
      const next = prev.filter((m) => m.journalId !== id);
      saveMemories(next);
      return next;
    });
  };

  const getJournal = (id: string) => journals.find((j) => j.id === id);

  const memoriesFor = (journalId: string) => memories.filter((m) => m.journalId === journalId);

  const addMemory = (memory: Memory) => {
    setMemories((prev) => {
      const next = [...prev, memory];
      saveMemories(next);
      return next;
    });
  };

  const updateMemory = (id: string, updates: Partial<Memory>) => {
    setMemories((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
      saveMemories(next);
      return next;
    });
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMemories(next);
      return next;
    });
  };

  const getMemory = (id: string) => memories.find((m) => m.id === id);

  const reorderMemories = (journalId: string, orderedIds: string[]) => {
    setMemories((prev) => {
      const next = prev.map((m) => {
        if (m.journalId !== journalId) return m;
        const order = orderedIds.indexOf(m.id);
        return order === -1 ? m : { ...m, order };
      });
      saveMemories(next);
      return next;
    });
  };

  const markBookInterest = (journalId: string) => {
    setBookInterests((prev) => {
      if (prev.some((b) => b.journalId === journalId)) return prev;
      const next = [...prev, { journalId, clickedAt: new Date().toISOString() }];
      saveBookInterests(next);
      return next;
    });
  };

  const hasBookInterest = (journalId: string) => bookInterests.some((b) => b.journalId === journalId);

  const value = useMemo(
    () => ({
      journals,
      memories,
      bookInterests,
      addJournal,
      updateJournal,
      deleteJournal,
      getJournal,
      memoriesFor,
      addMemory,
      updateMemory,
      deleteMemory,
      getMemory,
      reorderMemories,
      markBookInterest,
      hasBookInterest,
    }),
    [journals, memories, bookInterests]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
