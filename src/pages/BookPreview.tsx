import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { JournalCover } from "../components/JournalCover";
import { PageSurface } from "../components/PageSurface";
import { fontClassFor } from "../lib/journalTypes";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function BookPreview() {
  const { journalId } = useParams<{ journalId: string }>();
  const { getJournal, memoriesFor, markBookInterest, hasBookInterest } = useApp();
  const journal = journalId ? getJournal(journalId) : undefined;
  const memories = journalId ? memoriesFor(journalId) : [];
  const [justClicked, setJustClicked] = useState(false);

  if (!journal || !journalId) return <Navigate to="/" replace />;

  const previewPages = memories.slice(0, 4);
  const interested = hasBookInterest(journalId);

  return (
    <div className="min-h-screen bg-cream px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to={`/journal/${journalId}`} className="text-sm text-ink/50 hover:text-ink/80">
          &larr; Back to {journal.title}
        </Link>

        <h1 className="mt-4 font-serif text-3xl text-ink">Bring your journal to life.</h1>
        <p className="mt-2 text-ink/60">Turn your journal into a printed keepsake you can hold onto for years.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-[220px_1fr]">
          <div className="mx-auto w-40 sm:w-full" style={{ filter: "drop-shadow(6px 8px 10px rgba(0,0,0,0.25))" }}>
            <JournalCover title={journal.title} design={journal.design} size="large" subtitle={journal.subject} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {previewPages.length === 0 ? (
              <p className="text-ink/60 sm:col-span-2">
                Add a few more memories and your book will start taking shape.
              </p>
            ) : (
              previewPages.map((memory) => (
                <PageSurface key={memory.id} pageStyle={journal.design.pageStyle} accentColor={journal.design.accentColor} className="flex flex-col gap-2 p-4">
                  <p className={`${fontClassFor(journal.design.titleFont)} text-sm`} style={{ color: journal.design.accentColor }}>
                    {memory.title}
                  </p>
                  {memory.showDate && memory.date && <p className="text-[11px] text-ink/50">{formatDate(memory.date)}</p>}
                  {memory.photos[0] && (
                    <img src={memory.photos[0]} alt="" className="max-h-28 w-full rounded border-2 border-white object-cover shadow" />
                  )}
                  <p className="line-clamp-4 font-serif text-xs leading-relaxed text-ink/80">{memory.writtenText}</p>
                </PageSurface>
              ))
            )}
          </div>
        </div>

        {memories.length > 0 && memories.length < 2 && (
          <p className="mt-4 text-sm text-ink/50">Add a few more memories and your book will start taking shape.</p>
        )}

        <div className="mt-10 rounded-2xl bg-white/70 p-6 text-center shadow-sm ring-1 ring-ink/5">
          <p className="font-serif text-lg text-ink">Printed journals are coming soon.</p>
          {justClicked ? (
            <p className="mt-3 text-sage-dark">Thanks! We'll let you know when printed journals are ready.</p>
          ) : interested ? (
            <p className="mt-3 text-sage-dark">You're on the list for this one.</p>
          ) : (
            <button
              onClick={() => {
                markBookInterest(journalId);
                setJustClicked(true);
              }}
              className="mt-4 rounded-xl bg-sage-dark px-6 py-2.5 text-sm font-medium text-white transition hover:bg-sage"
            >
              I'm interested
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
