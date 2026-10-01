import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { DesignPicker } from "../components/DesignPicker";
import { getTypeOptions, suggestPreset } from "../lib/journalTypes";
import type { Journal, JournalDesign, JournalMode } from "../types";

function defaultDesignFor(journalType: string): JournalDesign {
  const preset = suggestPreset(journalType);
  return {
    presetId: preset.id,
    coverColor: preset.coverColor,
    coverImage: null,
    titleFont: preset.titleFont,
    pageStyle: preset.pageStyle,
    accentColor: preset.accentColor,
  };
}

export function CreateJournal() {
  const navigate = useNavigate();
  const { addJournal } = useApp();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<JournalMode | null>(null);
  const [journalType, setJournalType] = useState("");
  const [customTypeDescription, setCustomTypeDescription] = useState("");
  const [design, setDesign] = useState<JournalDesign>(defaultDesignFor("other"));
  const [designCustomized, setDesignCustomized] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dateLabel, setDateLabel] = useState("");

  const chooseType = (id: string) => {
    setJournalType(id);
    if (!designCustomized) setDesign(defaultDesignFor(id));
  };

  const handleDesignChange = (next: JournalDesign) => {
    setDesignCustomized(true);
    setDesign(next);
  };

  const canCreate = mode && journalType && title.trim() && subject.trim();

  const handleCreate = () => {
    if (!canCreate || !mode) return;
    const now = new Date().toISOString();
    const journal: Journal = {
      id: crypto.randomUUID(),
      title: title.trim(),
      mode,
      journalType,
      customTypeDescription: customTypeDescription.trim(),
      subject: subject.trim(),
      dateLabel: dateLabel.trim(),
      design,
      pageOrderMode: mode === "ongoing" ? "byDate" : "manual",
      createdAt: now,
      updatedAt: now,
    };
    addJournal(journal);
    navigate(`/journal/${journal.id}`);
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-sage-dark" : "bg-ink/10"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="mt-8">
            <h1 className="font-serif text-2xl text-ink sm:text-3xl">How would you like to create your journal?</h1>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setMode("ongoing");
                  setStep(2);
                }}
                className="rounded-2xl border border-ink/15 bg-white p-6 text-left transition hover:border-sage-dark hover:shadow-sm"
              >
                <p className="font-serif text-lg text-ink">Keep adding over time</p>
                <p className="mt-2 text-sm text-ink/60">
                  Perfect for childhood, relationships, family memories, college years, personal
                  journals, and stories that keep going.
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("experience");
                  setStep(2);
                }}
                className="rounded-2xl border border-ink/15 bg-white p-6 text-left transition hover:border-sage-dark hover:shadow-sm"
              >
                <p className="font-serif text-lg text-ink">Create a journal from an experience</p>
                <p className="mt-2 text-sm text-ink/60">
                  Perfect for vacations, weddings, birthdays, graduations, celebrations, and
                  experiences you want to turn into a complete keepsake.
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && mode && (
          <div className="mt-8">
            <h1 className="font-serif text-2xl text-ink sm:text-3xl">What's this journal about?</h1>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {getTypeOptions(mode).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => chooseType(option.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    journalType === option.id
                      ? "border-sage-dark bg-beige"
                      : "border-ink/15 bg-white hover:border-sage-dark"
                  }`}
                >
                  <p className="font-medium text-ink">{option.label}</p>
                  <p className="mt-1 text-xs text-ink/50">{option.blurb}</p>
                </button>
              ))}
            </div>

            {journalType === "other" && (
              <textarea
                value={customTypeDescription}
                onChange={(e) => setCustomTypeDescription(e.target.value)}
                placeholder="Tell us what this journal is about, in your own words..."
                rows={2}
                className="mt-4 w-full resize-none rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            )}

            <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!journalType} />
          </div>
        )}

        {step === 3 && (
          <div className="mt-8">
            <h1 className="font-serif text-2xl text-ink sm:text-3xl">Choose a design</h1>
            <div className="mt-6">
              <DesignPicker title={title} journalType={journalType} value={design} onChange={handleDesignChange} />
            </div>
            <StepNav onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        )}

        {step === 4 && mode && (
          <div className="mt-8">
            <h1 className="font-serif text-2xl text-ink sm:text-3xl">A few last details</h1>
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink/70">Journal title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={mode === "ongoing" ? "Leo's Childhood" : "Italy 2026"}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70">Who or what is it about?</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="my son Leo / my wife and me / our trip to Italy"
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
              {mode === "experience" && (
                <div>
                  <label className="block text-sm font-medium text-ink/70">When was this? (optional)</label>
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    placeholder="June 2026"
                    className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between gap-3">
              <button
                onClick={() => setStep(3)}
                className="rounded-xl border border-ink/15 px-6 py-3 font-medium text-ink/70 transition hover:bg-white"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreate}
                className="rounded-xl bg-sage-dark px-8 py-3 font-medium text-white transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create Journal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex justify-between gap-3">
      <button onClick={onBack} className="rounded-xl border border-ink/15 px-6 py-3 font-medium text-ink/70 transition hover:bg-white">
        Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-xl bg-sage-dark px-8 py-3 font-medium text-white transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-60"
      >
        Next
      </button>
    </div>
  );
}
