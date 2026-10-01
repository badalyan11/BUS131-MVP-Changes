import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { useApp } from "../context/AppContext";
import { JournalCover } from "../components/JournalCover";
import { TitlePage } from "../components/TitlePage";
import { MemoryPageContent } from "../components/MemoryPageContent";
import { PageSurface } from "../components/PageSurface";
import { FlipPage } from "../components/FlipPage";
import { resolveLayout } from "../lib/layouts";
import type { Journal, Memory, MemoryLayout } from "../types";

type Slot =
  | { kind: "cover" }
  | { kind: "title" }
  | { kind: "empty" }
  | { kind: "filler" }
  | { kind: "memory"; memory: Memory; layout: MemoryLayout; part: "full" | "photo" | "story" };

function sortMemories(journal: Journal, memories: Memory[]): Memory[] {
  if (journal.pageOrderMode === "manual") {
    return [...memories].sort((a, b) => a.order - b.order);
  }
  return [...memories].sort((a, b) => {
    if (a.date && b.date) return a.date < b.date ? -1 : a.date > b.date ? 1 : a.order - b.order;
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return a.order - b.order;
  });
}

/**
 * Builds the flat list of physical pages. A "spread" layout needs its photo
 * half and story half to land together on one open spread, so a filler page
 * is inserted whenever that would otherwise start on the wrong side.
 */
function buildSlots(sortedMemories: Memory[]): Slot[] {
  const slots: Slot[] = [{ kind: "cover" }, { kind: "title" }];
  if (sortedMemories.length === 0) {
    slots.push({ kind: "empty" });
    return slots;
  }
  sortedMemories.forEach((memory, i) => {
    const layout = resolveLayout(memory, i);
    const isSpread = layout === "photo-story-spread" || layout === "story-photo-spread";
    if (isSpread && slots.length % 2 === 0) {
      slots.push({ kind: "filler" });
    }
    if (layout === "photo-story-spread") {
      slots.push({ kind: "memory", memory, layout, part: "photo" });
      slots.push({ kind: "memory", memory, layout, part: "story" });
    } else if (layout === "story-photo-spread") {
      slots.push({ kind: "memory", memory, layout, part: "story" });
      slots.push({ kind: "memory", memory, layout, part: "photo" });
    } else {
      slots.push({ kind: "memory", memory, layout, part: "full" });
    }
  });
  return slots;
}

interface PageFlipController {
  flipNext: () => void;
  flipPrev: () => void;
}
interface FlipBookHandle {
  pageFlip: () => PageFlipController;
}

export function JournalView() {
  const { journalId } = useParams<{ journalId: string }>();
  const { getJournal, memoriesFor } = useApp();
  const journal = journalId ? getJournal(journalId) : undefined;
  const memories = journalId ? memoriesFor(journalId) : [];
  const sorted = useMemo(() => (journal ? sortMemories(journal, memories) : []), [journal, memories]);
  const slots = useMemo(() => buildSlots(sorted), [sorted]);

  const flipBookRef = useRef<FlipBookHandle | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const goPrev = () => flipBookRef.current?.pageFlip().flipPrev();
  const goNext = () => flipBookRef.current?.pageFlip().flipNext();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (!journal || !journalId) return <Navigate to="/" replace />;

  const currentSlot = slots[Math.min(currentPage, slots.length - 1)];
  const isLastPage = currentPage === slots.length - 1 && currentSlot.kind === "memory";

  return (
    <div className="min-h-screen bg-cream px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-sm text-ink/50 hover:text-ink/80">
            &larr; My Journals
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link to={`/journal/${journalId}/new`} className="rounded-lg bg-sage-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-sage">
              + Add a memory
            </Link>
            <Link to={`/journal/${journalId}/organize`} className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-white">
              Organize pages
            </Link>
            <Link to={`/journal/${journalId}/book`} className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-white">
              Turn this into a book
            </Link>
            <Link to={`/journal/${journalId}/settings`} className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-white">
              Settings
            </Link>
          </div>
        </div>

        <div className="relative mt-10">
          <div className="pointer-events-none absolute inset-x-16 bottom-0 h-8 rounded-[50%] bg-ink/15 blur-2xl sm:inset-x-28" />

          <div className="relative flex items-center justify-center">
            <button
              onClick={goPrev}
              disabled={currentPage === 0}
              aria-label="Previous page"
              className="absolute left-0 z-10 -translate-x-2 rounded-full bg-white p-2 shadow ring-1 ring-ink/10 transition disabled:opacity-20 sm:-translate-x-6"
            >
              ‹
            </button>

            <HTMLFlipBook
              ref={flipBookRef}
              width={480}
              height={400}
              size="stretch"
              minWidth={300}
              maxWidth={560}
              minHeight={260}
              maxHeight={460}
              showCover
              usePortrait
              drawShadow
              flippingTime={650}
              maxShadowOpacity={0.4}
              mobileScrollSupport={false}
              useMouseEvents
              clickEventForward
              swipeDistance={30}
              showPageCorners
              disableFlipByClick={false}
              startPage={0}
              startZIndex={0}
              autoSize
              className="mx-auto"
              style={{}}
              onFlip={(e: { data: number }) => setCurrentPage(e.data)}
            >
              {slots.map((slot, i) => (
                <FlipPage key={i} hard={slot.kind === "cover"}>
                  {renderSlot(slot, journal)}
                </FlipPage>
              ))}
            </HTMLFlipBook>

            <button
              onClick={goNext}
              disabled={currentPage === slots.length - 1}
              aria-label="Next page"
              className="absolute right-0 z-10 translate-x-2 rounded-full bg-white p-2 shadow ring-1 ring-ink/10 transition disabled:opacity-20 sm:translate-x-6"
            >
              ›
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-ink/40">
          Page {currentPage + 1} of {slots.length}
        </p>

        {isLastPage && (
          <div className="mt-4 flex justify-center gap-3">
            <Link to={`/journal/${journalId}/new`} className="rounded-xl bg-sage-dark px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sage">
              Add a memory
            </Link>
            <Link to={`/journal/${journalId}/book`} className="rounded-xl border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-white">
              Turn this into a book
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function renderSlot(slot: Slot, journal: Journal) {
  switch (slot.kind) {
    case "cover":
      return <JournalCover title={journal.title} design={journal.design} subtitle={journal.subject} fill />;
    case "title":
      return <TitlePage journal={journal} />;
    case "filler":
      return <PageSurface pageStyle={journal.design.pageStyle} accentColor={journal.design.accentColor} className="h-full w-full" />;
    case "empty":
      return (
        <PageSurface pageStyle={journal.design.pageStyle} accentColor={journal.design.accentColor} className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
          <p className="font-serif text-lg text-ink">No pages yet.</p>
          <p className="mt-2 text-sm text-ink/60">What's a moment you want to keep?</p>
          <Link to={`/journal/${journal.id}/new`} className="mt-5 rounded-xl bg-sage-dark px-6 py-2.5 text-sm font-medium text-white transition hover:bg-sage">
            Add a memory
          </Link>
        </PageSurface>
      );
    case "memory":
      return <MemoryPageContent journal={journal} memory={slot.memory} layout={slot.layout} slot={slot.part} />;
  }
}
