import type { Journal } from "../types";
import { fontClassFor } from "../lib/journalTypes";
import { PageSurface } from "./PageSurface";

/**
 * The album's intro page, shown right after the cover. Derived entirely from
 * the journal's own title/subject/date label, so there is nothing extra for
 * the user to set up.
 */
export function TitlePage({ journal }: { journal: Journal }) {
  const { pageStyle, accentColor, titleFont } = journal.design;

  return (
    <PageSurface pageStyle={pageStyle} accentColor={accentColor} className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="h-px w-12" style={{ backgroundColor: accentColor }} />
      <p className={`${fontClassFor(titleFont)} text-2xl leading-snug text-ink sm:text-3xl`}>{journal.title}</p>
      {journal.subject && <p className="font-caveat text-xl" style={{ color: accentColor }}>{journal.subject}</p>}
      {journal.dateLabel && <p className="text-xs uppercase tracking-wide text-ink/40">{journal.dateLabel}</p>}
      <div className="h-px w-12" style={{ backgroundColor: accentColor }} />
    </PageSurface>
  );
}
