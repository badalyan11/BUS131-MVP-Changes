import type { Journal, Memory, MemoryLayout } from "../types";
import { fontClassFor } from "../lib/journalTypes";
import { PageSurface } from "./PageSurface";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DateLine({ memory, accentColor }: { memory: Memory; accentColor: string }) {
  if (!memory.showDate || !memory.date) return null;
  return (
    <p className="font-caveat text-lg leading-none" style={{ color: accentColor }}>
      {formatDate(memory.date)}
    </p>
  );
}

function Title({ memory, journal }: { memory: Memory; journal: Journal }) {
  return (
    <p className={`${fontClassFor(journal.design.titleFont)} text-xl leading-snug text-ink sm:text-2xl`}>
      {memory.title}
    </p>
  );
}

function Story({ memory }: { memory: Memory }) {
  return (
    <p className="whitespace-pre-line font-serif leading-relaxed text-ink/90">{memory.writtenText}</p>
  );
}

function Photo({ memory, className = "" }: { memory: Memory; className?: string }) {
  return <img src={memory.photos[0]} alt="" className={`object-cover ${className}`} />;
}

/**
 * Renders one page's worth of a memory. `slot` controls which half of a
 * two-page spread layout this particular page is (the other half is a
 * separate page in the flip-book), or "full" for single-page layouts.
 */
export function MemoryPageContent({
  journal,
  memory,
  layout,
  slot,
}: {
  journal: Journal;
  memory: Memory;
  layout: MemoryLayout;
  slot: "full" | "photo" | "story";
}) {
  const { pageStyle, accentColor } = journal.design;

  if (slot === "photo") {
    return (
      <PageSurface pageStyle={pageStyle} accentColor={accentColor} className="h-full w-full">
        <Photo memory={memory} className="h-full w-full" />
      </PageSurface>
    );
  }

  if (slot === "story") {
    return (
      <PageSurface pageStyle={pageStyle} accentColor={accentColor} className="flex h-full w-full flex-col justify-center gap-3 p-6 sm:p-10">
        <Title memory={memory} journal={journal} />
        <DateLine memory={memory} accentColor={accentColor} />
        <Story memory={memory} />
      </PageSurface>
    );
  }

  // Single-page layouts.
  switch (layout) {
    case "photo-top":
      return (
        <PageSurface pageStyle={pageStyle} accentColor={accentColor} className="flex h-full w-full flex-col overflow-hidden">
          <div className="min-h-0 shrink-0 overflow-hidden" style={{ flex: "0 0 55%" }}>
            <Photo memory={memory} className="h-full w-full" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-start gap-2 overflow-y-auto p-5 sm:p-6">
            <Title memory={memory} journal={journal} />
            <DateLine memory={memory} accentColor={accentColor} />
            <Story memory={memory} />
          </div>
        </PageSurface>
      );

    case "centered":
      return (
        <PageSurface pageStyle={pageStyle} accentColor={accentColor} className="flex h-full w-full flex-col items-center justify-center gap-3 overflow-y-auto p-6 text-center sm:p-10">
          <Title memory={memory} journal={journal} />
          {memory.photos[0] && (
            <div className="min-h-0 w-[80%] shrink-0 overflow-hidden" style={{ flex: "0 1 42%" }}>
              <img src={memory.photos[0]} alt="" className="h-full w-full rounded-sm border-4 border-white object-cover shadow-md" />
            </div>
          )}
          <DateLine memory={memory} accentColor={accentColor} />
          <div className="max-w-sm">
            <Story memory={memory} />
          </div>
        </PageSurface>
      );

    case "scrapbook":
      return (
        <PageSurface pageStyle={pageStyle} accentColor={accentColor} className="relative flex h-full w-full flex-col overflow-hidden p-6 sm:p-8">
          <div className="flex min-h-0 shrink-0 justify-center overflow-hidden pt-2" style={{ flex: "0 0 46%" }}>
            {memory.photos[0] && (
              <img
                src={memory.photos[0]}
                alt=""
                className="h-full w-[78%] -rotate-2 rounded-sm border-[6px] border-white object-cover shadow-lg"
              />
            )}
          </div>
          <div className="mt-4 flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto text-center">
            <Title memory={memory} journal={journal} />
            <DateLine memory={memory} accentColor={accentColor} />
            <div className="max-w-sm">
              <Story memory={memory} />
            </div>
          </div>
        </PageSurface>
      );

    case "text-focus":
    default:
      return (
        <PageSurface pageStyle={pageStyle} accentColor={accentColor} className="flex h-full w-full flex-col gap-3 overflow-y-auto p-6 sm:p-10">
          <Title memory={memory} journal={journal} />
          <DateLine memory={memory} accentColor={accentColor} />
          <Story memory={memory} />
          {memory.photos[0] && (
            <img
              src={memory.photos[0]}
              alt=""
              className="ml-auto mt-auto h-20 w-20 shrink-0 rounded-sm border-4 border-white object-cover shadow-md"
            />
          )}
        </PageSurface>
      );
  }
}
