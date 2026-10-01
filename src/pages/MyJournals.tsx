import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { JournalCover } from "../components/JournalCover";

export function MyJournals() {
  const { journals, memoriesFor } = useApp();

  return (
    <div className="min-h-screen bg-cream px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-serif text-3xl text-ink">My Journals</h1>
          <Link to="/welcome" className="text-sm text-ink/50 underline hover:text-ink/80">
            How it works
          </Link>
        </header>

        <Link
          to="/create"
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-sage-dark px-6 py-4 text-lg font-medium text-white shadow-sm transition hover:bg-sage sm:w-auto sm:px-10"
        >
          + Start a new journal
        </Link>

        <div className="mt-10">
          {journals.length === 0 ? (
            <div className="rounded-2xl bg-white/60 px-6 py-14 text-center">
              <p className="font-serif text-xl text-ink">No journals yet.</p>
              <p className="mx-auto mt-3 max-w-sm text-ink/60">
                Start one for a part of your life you want to remember, or a trip you don't want to
                forget.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
              {journals.map((journal) => (
                <Link key={journal.id} to={`/journal/${journal.id}`} className="block">
                  <JournalCover title={journal.title} design={journal.design} size="medium" />
                  <p className="mt-2 text-sm text-ink/70">{journal.title}</p>
                  <p className="text-xs text-ink/40">
                    {journal.mode === "ongoing" ? "Ongoing" : "Experience"} ·{" "}
                    {memoriesFor(journal.id).length} {memoriesFor(journal.id).length === 1 ? "page" : "pages"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
