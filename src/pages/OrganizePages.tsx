import { Link, Navigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { Journal, Memory } from "../types";

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

export function OrganizePages() {
  const { journalId } = useParams<{ journalId: string }>();
  const { getJournal, memoriesFor, reorderMemories, deleteMemory, updateJournal } = useApp();
  const journal = journalId ? getJournal(journalId) : undefined;
  const memories = journalId ? memoriesFor(journalId) : [];

  if (!journal || !journalId) return <Navigate to="/" replace />;

  const sorted = sortMemories(journal, memories);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    if (journal.pageOrderMode !== "manual") updateJournal(journal.id, { pageOrderMode: "manual" });
    reorderMemories(journal.id, reordered.map((m) => m.id));
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This can't be undone.`)) {
      deleteMemory(id);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link to={`/journal/${journalId}`} className="text-sm text-ink/50 hover:text-ink/80">
          &larr; Back to {journal.title}
        </Link>
        <h1 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">Organize pages</h1>

        {sorted.length === 0 ? (
          <p className="mt-6 text-ink/60">No pages yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {sorted.map((memory, index) => (
              <div key={memory.id} className="flex items-center gap-3 rounded-xl bg-white/70 p-3 shadow-sm ring-1 ring-ink/5">
                {memory.photos[0] ? (
                  <img src={memory.photos[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-beige text-xs italic text-sage-dark">
                    page
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{memory.title}</p>
                  <p className="truncate text-xs text-ink/50">{memory.writtenText}</p>
                </div>
                <div className="flex shrink-0 flex-col">
                  <button onClick={() => move(index, -1)} disabled={index === 0} className="px-1 text-ink/50 hover:text-ink disabled:opacity-20">
                    ▲
                  </button>
                  <button onClick={() => move(index, 1)} disabled={index === sorted.length - 1} className="px-1 text-ink/50 hover:text-ink disabled:opacity-20">
                    ▼
                  </button>
                </div>
                <Link to={`/journal/${journalId}/memory/${memory.id}/edit`} className="shrink-0 rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-white">
                  Edit
                </Link>
                <button onClick={() => handleDelete(memory.id, memory.title)} className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
