import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getTypeLabel } from "../lib/journalTypes";

export function Stats() {
  const { journals, memories, bookInterests } = useApp();

  const ongoingCount = journals.filter((j) => j.mode === "ongoing").length;
  const experienceCount = journals.filter((j) => j.mode === "experience").length;

  const byType = new Map<string, number>();
  for (const j of journals) {
    const label = getTypeLabel(j.mode, j.journalType, j.customTypeDescription);
    byType.set(label, (byType.get(label) ?? 0) + 1);
  }

  const usedWritten = memories.filter((m) => !m.usedOwnWords).length;
  const usedOwnWords = memories.filter((m) => m.usedOwnWords).length;
  const editedBeforeSaving = memories.filter((m) => m.editedBeforeSaving).length;

  return (
    <div className="min-h-screen bg-cream px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="text-sm text-ink/50 hover:text-ink/80">
          &larr; My Journals
        </Link>
        <h1 className="mt-4 font-serif text-2xl text-ink">MVP feedback stats</h1>
        <p className="mt-1 text-sm text-ink/50">Local only. No personal data, no external analytics.</p>

        <div className="mt-8 space-y-6">
          <StatBlock title="Journals created">
            <Stat label="Ongoing journals" value={ongoingCount} />
            <Stat label="Experience journals" value={experienceCount} />
            <Stat label="Total" value={journals.length} />
            <div className="mt-3 border-t border-ink/10 pt-3">
              {[...byType.entries()].map(([label, count]) => (
                <Stat key={label} label={label} value={count} />
              ))}
            </div>
          </StatBlock>

          <StatBlock title="Memories saved">
            <Stat label="Total pages saved" value={memories.length} />
            <Stat label="Used the written version" value={usedWritten} />
            <Stat label="Used their own words" value={usedOwnWords} />
            <Stat label="Edited the written version before saving" value={editedBeforeSaving} />
          </StatBlock>

          <StatBlock title="Printed book interest">
            <Stat label={`"I'm interested" clicks`} value={bookInterests.length} />
          </StatBlock>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-ink/5">
      <p className="font-serif text-lg text-ink">{title}</p>
      <div className="mt-3 space-y-1.5">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink/60">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
