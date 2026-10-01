import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { fileToCompressedDataUrl } from "../lib/photo";
import { generateJournalEntry } from "../lib/generateJournalEntry";
import { getIdeaChips } from "../lib/journalTypes";
import type { DraftMemory } from "./ReviewMemory";

export function NewMemory() {
  const { journalId } = useParams<{ journalId: string }>();
  const { getJournal } = useApp();
  const navigate = useNavigate();
  const journal = journalId ? getJournal(journalId) : undefined;

  const [roughNote, setRoughNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showDate, setShowDate] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState("");

  if (!journal || !journalId) return <Navigate to="/" replace />;

  const ideaChips = getIdeaChips(journal.journalType);

  const handlePhotoChange = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPhoto(await fileToCompressedDataUrl(file));
    } catch {
      setError("Couldn't load that photo, try a different one.");
    }
  };

  const handleSubmit = async () => {
    if (!roughNote.trim()) return;
    setError("");
    setIsWriting(true);
    try {
      const entry = await generateJournalEntry(roughNote, {
        mode: journal.mode,
        journalType: journal.journalType,
        customTypeDescription: journal.customTypeDescription,
        subject: journal.subject,
      });
      const draft: DraftMemory = {
        journalId,
        roughNote: roughNote.trim(),
        date,
        showDate,
        photo,
        generated: entry,
      };
      navigate(`/journal/${journalId}/review`, { state: draft });
    } catch {
      setError("Something went wrong on our side. Your words are safe, want to try again?");
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link to={`/journal/${journalId}`} className="text-sm text-ink/50 hover:text-ink/80">
          &larr; Back to {journal.title}
        </Link>

        <h1 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">What happened?</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {ideaChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setRoughNote((prev) => (prev ? prev : `${chip}: `))}
              className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs text-ink/70 transition hover:border-sage-dark hover:text-ink"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-6">
          <textarea
            required
            rows={6}
            value={roughNote}
            onChange={(e) => setRoughNote(e.target.value)}
            placeholder="Just write it how you'd tell a friend. Messy is fine."
            className="w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-4 text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-ink/70">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <label className="flex items-center gap-2 pb-3 text-sm text-ink/70">
              <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
              Show date on page
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Photo (optional)</label>
            {photo ? (
              <div className="mt-2 flex items-center gap-4">
                <img src={photo} alt="Selected" className="h-20 w-20 rounded-xl object-cover" />
                <button type="button" onClick={() => setPhoto(null)} className="text-sm text-ink/50 underline hover:text-ink/80">
                  Remove photo
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                className="mt-2 block w-full text-sm text-ink/70 file:mr-4 file:rounded-lg file:border-0 file:bg-beige file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-beige/70"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isWriting || !roughNote.trim()}
            className="w-full rounded-xl bg-sage-dark px-6 py-3.5 font-medium text-white transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWriting ? "Writing this down for you..." : "Help me write this"}
          </button>
        </div>
      </div>
    </div>
  );
}
