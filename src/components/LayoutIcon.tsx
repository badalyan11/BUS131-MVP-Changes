import type { MemoryLayout } from "../types";

const PHOTO = "rounded-[2px] bg-ink/30";
const LINE = "rounded-full bg-ink/25";

/** A tiny visual preview of a page layout, used in the layout picker. */
export function LayoutIcon({ id }: { id: MemoryLayout }) {
  return (
    <span className="flex h-9 w-12 items-stretch gap-0.5 overflow-hidden rounded-[3px] bg-white p-1 ring-1 ring-inset ring-ink/10">
      {id === "photo-story-spread" && (
        <>
          <span className={`${PHOTO} flex-1`} />
          <span className="flex flex-1 flex-col justify-center gap-0.5">
            <span className={`${LINE} h-0.5 w-full`} />
            <span className={`${LINE} h-0.5 w-3/4`} />
            <span className={`${LINE} h-0.5 w-full`} />
          </span>
        </>
      )}
      {id === "story-photo-spread" && (
        <>
          <span className="flex flex-1 flex-col justify-center gap-0.5">
            <span className={`${LINE} h-0.5 w-full`} />
            <span className={`${LINE} h-0.5 w-3/4`} />
            <span className={`${LINE} h-0.5 w-full`} />
          </span>
          <span className={`${PHOTO} flex-1`} />
        </>
      )}
      {id === "photo-top" && (
        <span className="flex flex-1 flex-col gap-0.5">
          <span className={`${PHOTO} h-3/5 w-full`} />
          <span className="flex flex-1 flex-col justify-center gap-0.5">
            <span className={`${LINE} h-0.5 w-full`} />
            <span className={`${LINE} h-0.5 w-2/3`} />
          </span>
        </span>
      )}
      {id === "centered" && (
        <span className="flex flex-1 flex-col items-center justify-center gap-0.5">
          <span className={`${PHOTO} h-3.5 w-5`} />
          <span className={`${LINE} h-0.5 w-3/4`} />
          <span className={`${LINE} h-0.5 w-1/2`} />
        </span>
      )}
      {id === "scrapbook" && (
        <span className="relative flex-1">
          <span className={`${PHOTO} absolute left-0 top-0 h-5 w-6 -rotate-6`} />
          <span className="absolute bottom-0.5 left-0 flex w-full flex-col gap-0.5">
            <span className={`${LINE} h-0.5 w-full`} />
            <span className={`${LINE} h-0.5 w-2/3`} />
          </span>
        </span>
      )}
      {id === "text-focus" && (
        <span className="relative flex-1">
          <span className="flex flex-col gap-0.5 pt-0.5">
            <span className={`${LINE} h-0.5 w-full`} />
            <span className={`${LINE} h-0.5 w-full`} />
            <span className={`${LINE} h-0.5 w-5/6`} />
            <span className={`${LINE} h-0.5 w-full`} />
          </span>
          <span className={`${PHOTO} absolute bottom-0 right-0 h-2.5 w-3`} />
        </span>
      )}
    </span>
  );
}
