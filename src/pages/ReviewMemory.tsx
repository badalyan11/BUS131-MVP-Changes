import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { fileToCompressedDataUrl } from "../lib/photo";
import { cleanBody, generateJournalEntry, type GeneratedEntry } from "../lib/generateJournalEntry";
import { layoutOptionsFor, pickDefaultLayout, resolveLayout } from "../lib/layouts";
import { LayoutIcon } from "../components/LayoutIcon";
import type { Memory, MemoryLayout } from "../types";

export interface DraftMemory {
  journalId: string;
  roughNote: string;
  date: string;
  showDate: boolean;
  photo: string | null;
  generated: GeneratedEntry;
}

export function ReviewMemory() {
  const { journalId, memoryId } = useParams<{ journalId: string; memoryId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { getJournal, getMemory, addMemory, updateMemory, memoriesFor } = useApp();

  const journal = journalId ? getJournal(journalId) : undefined;
  const existingMemory = memoryId ? getMemory(memoryId) : undefined;
  const draft = (location.state as DraftMemory | null) ?? null;

  const isEdit = Boolean(memoryId);

  const initial = isEdit
    ? existingMemory
      ? {
          roughNote: existingMemory.roughNote,
          date: existingMemory.date,
          showDate: existingMemory.showDate,
          photo: existingMemory.photos[0] ?? null,
          title: existingMemory.title,
          text: existingMemory.writtenText,
          lastGenerated: existingMemory.writtenText,
          usedOwnWords: existingMemory.usedOwnWords,
        }
      : null
    : draft
      ? {
          roughNote: draft.roughNote,
          date: draft.date,
          showDate: draft.showDate,
          photo: draft.photo,
          title: draft.generated.title,
          text: draft.generated.text,
          lastGenerated: draft.generated.text,
          usedOwnWords: false,
        }
      : null;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [text, setText] = useState(initial?.text ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [showDate, setShowDate] = useState(initial?.showDate ?? true);
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [lastGeneratedText, setLastGeneratedText] = useState(initial?.lastGenerated ?? "");
  const [usedOwnWords, setUsedOwnWords] = useState(initial?.usedOwnWords ?? false);
  const [variantIndex, setVariantIndex] = useState(draft ? draft.generated.variantIndex : 0);
  const [warm, setWarm] = useState(draft ? draft.generated.warm : false);
  const [isBusy, setIsBusy] = useState(false);
  const [layout, setLayout] = useState<MemoryLayout>(() =>
    isEdit && existingMemory
      ? resolveLayout(existingMemory, existingMemory.order)
      : pickDefaultLayout(Boolean(initial?.photo), memoriesFor(journalId ?? "").length)
  );

  useEffect(() => {
    if (!photo && layout !== "text-focus") setLayout("text-focus");
  }, [photo, layout]);

  if (!journal || !journalId || !initial) {
    return <Navigate to={journalId ? `/journal/${journalId}` : "/"} replace />;
  }

  const roughNote = initial.roughNote;
  const context = {
    mode: journal.mode,
    journalType: journal.journalType,
    customTypeDescription: journal.customTypeDescription,
    subject: journal.subject,
  };

  const applyEntry = (entry: GeneratedEntry) => {
    setText(entry.text);
    if (entry.title) setTitle(entry.title);
    setLastGeneratedText(entry.text);
    setVariantIndex(entry.variantIndex);
    setWarm(entry.warm);
    setUsedOwnWords(false);
  };

  const handleTryAnother = async () => {
    setIsBusy(true);
    try {
      applyEntry(await generateJournalEntry(roughNote, context, variantIndex + 1, warm));
    } finally {
      setIsBusy(false);
    }
  };

  const handleShorter = () => {
    setText(cleanBody(roughNote));
    setUsedOwnWords(false);
  };

  const handleWarmer = async () => {
    setIsBusy(true);
    try {
      applyEntry(await generateJournalEntry(roughNote, context, variantIndex, true));
    } finally {
      setIsBusy(false);
    }
  };

  const handleUseOwnWords = () => {
    setText(roughNote);
    setUsedOwnWords(true);
  };

  const handlePhotoChange = async (file: File | undefined) => {
    if (!file) return;
    setPhoto(await fileToCompressedDataUrl(file));
    if (layout === "text-focus") {
      setLayout(pickDefaultLayout(true, memoriesFor(journalId).length));
    }
  };

  const handleCancel = () => navigate(`/journal/${journalId}`);

  const handleSave = () => {
    const editedBeforeSaving = !usedOwnWords && text.trim() !== lastGeneratedText.trim();
    const photos = photo ? [photo] : [];

    if (isEdit && existingMemory) {
      updateMemory(existingMemory.id, {
        title: title.trim() || existingMemory.title,
        date,
        showDate,
        writtenText: text.trim(),
        photos,
        layout: photo ? layout : "text-focus",
        usedOwnWords,
        editedBeforeSaving,
      });
    } else {
      const now = new Date().toISOString();
      const memory: Memory = {
        id: crypto.randomUUID(),
        journalId,
        title: title.trim() || "A Memory",
        date,
        showDate,
        roughNote,
        writtenText: text.trim(),
        photos,
        layout: photo ? layout : "text-focus",
        order: memoriesFor(journalId).length,
        usedOwnWords,
        editedBeforeSaving,
        createdAt: now,
        updatedAt: now,
      };
      addMemory(memory);
    }
    navigate(`/journal/${journalId}`);
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-2xl text-ink sm:text-3xl">Here's your memory.</h1>

        <div className="mt-6 space-y-5 rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
          {photo ? (
            <div className="space-y-2">
              <img src={photo} alt="" className="max-h-80 w-full rounded-xl object-cover" />
              <button type="button" onClick={() => setPhoto(null)} className="text-sm text-ink/50 underline hover:text-ink/80">
                Remove photo
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e.target.files?.[0])}
              className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-lg file:border-0 file:bg-beige file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-beige/70"
            />
          )}

          {photo && (
            <div>
              <p className="text-sm font-medium text-ink/70">Page layout</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {layoutOptionsFor(true).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setLayout(option.id)}
                    title={option.label}
                    className={`rounded-lg border p-1.5 transition ${
                      layout === option.id ? "border-sage-dark bg-beige" : "border-ink/15 hover:bg-white"
                    }`}
                  >
                    <LayoutIcon id={option.id} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink/70">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 font-serif text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 rounded-xl border border-ink/15 bg-white px-3 py-2 text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-ink/70">
              <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
              Show date
            </label>
          </div>

          <textarea
            rows={9}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-none rounded-xl border border-ink/15 bg-white px-4 py-4 font-serif text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button onClick={handleTryAnother} disabled={isBusy} className="rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-white disabled:opacity-60">
            Try another version
          </button>
          <button onClick={handleShorter} disabled={isBusy} className="rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-white disabled:opacity-60">
            Make it shorter
          </button>
          <button onClick={handleWarmer} disabled={isBusy} className="rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-white disabled:opacity-60">
            Make it warmer
          </button>
          <button onClick={handleUseOwnWords} disabled={isBusy} className="rounded-xl border border-ink/15 px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-white disabled:opacity-60">
            Use my own words
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={handleSave} disabled={!text.trim()} className="flex-1 rounded-xl bg-sage-dark px-6 py-3.5 font-medium text-white transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-60">
            Save to Journal
          </button>
          <button onClick={handleCancel} className="rounded-xl border border-ink/15 px-6 py-3.5 font-medium text-ink/70 transition hover:bg-white">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
