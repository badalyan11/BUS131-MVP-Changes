import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { DesignPicker } from "../components/DesignPicker";
import type { JournalDesign } from "../types";

export function JournalSettings() {
  const { journalId } = useParams<{ journalId: string }>();
  const { getJournal, updateJournal, deleteJournal } = useApp();
  const navigate = useNavigate();
  const journal = journalId ? getJournal(journalId) : undefined;

  const [title, setTitle] = useState(journal?.title ?? "");
  const [subject, setSubject] = useState(journal?.subject ?? "");
  const [dateLabel, setDateLabel] = useState(journal?.dateLabel ?? "");
  const [design, setDesign] = useState<JournalDesign>(
    journal?.design ?? { presetId: "custom", coverColor: "#EDE8DE", coverImage: null, titleFont: "lora", pageStyle: "plain", accentColor: "#2F2F2F" }
  );

  if (!journal || !journalId) return <Navigate to="/" replace />;

  const handleSave = () => {
    updateJournal(journalId, { title: title.trim(), subject: subject.trim(), dateLabel: dateLabel.trim(), design });
    navigate(`/journal/${journalId}`);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${journal.title}" and everything in it? This can't be undone.`)) {
      deleteJournal(journalId);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link to={`/journal/${journalId}`} className="text-sm text-ink/50 hover:text-ink/80">
          &larr; Back to {journal.title}
        </Link>
        <h1 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">Journal settings</h1>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink/70">Journal title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70">Who or what is it about?</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>
          {journal.mode === "experience" && (
            <div>
              <label className="block text-sm font-medium text-ink/70">When was this? (optional)</label>
              <input
                type="text"
                value={dateLabel}
                onChange={(e) => setDateLabel(e.target.value)}
                placeholder="June 2026"
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-ink/70">Design</p>
            <div className="mt-3">
              <DesignPicker title={title} journalType={journal.journalType} value={design} onChange={setDesign} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <button onClick={handleDelete} className="rounded-xl border border-red-200 px-6 py-3 font-medium text-red-600 transition hover:bg-red-50">
            Delete journal
          </button>
          <button onClick={handleSave} className="rounded-xl bg-sage-dark px-8 py-3 font-medium text-white transition hover:bg-sage">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
