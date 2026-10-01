import type { JournalDesign } from "../types";
import { fontClassFor } from "../lib/journalTypes";
import { getContrastText } from "../lib/color";

export function JournalCover({
  title,
  design,
  subtitle,
  size = "medium",
  fill = false,
}: {
  title: string;
  design: JournalDesign;
  subtitle?: string;
  size?: "small" | "medium" | "large";
  /** Fill the parent's size instead of enforcing its own aspect ratio (for use inside the flip-book). */
  fill?: boolean;
}) {
  const hasPhoto = Boolean(design.coverImage);
  const textColor = hasPhoto ? "#FAF6EF" : getContrastText(design.coverColor);
  const shapeClasses = {
    small: "rounded-lg p-4",
    medium: "rounded-xl p-6",
    large: "rounded-2xl p-10",
  }[size];
  const sizeClasses = fill ? `h-full w-full ${shapeClasses}` : `aspect-[3/4] ${shapeClasses}`;
  const titleSizeClasses = { small: "text-base", medium: "text-2xl", large: "text-4xl" }[size];

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden shadow-md ring-1 ring-black/10 ${sizeClasses}`}
      style={{
        backgroundColor: design.coverColor,
        backgroundImage: design.coverImage ? `url(${design.coverImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {hasPhoto && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 45%, transparent 70%)" }}
        />
      )}
      <div className="relative h-1 w-10 rounded-full" style={{ backgroundColor: design.accentColor }} />
      <div className="relative" style={{ color: textColor }}>
        <p className={`${fontClassFor(design.titleFont)} ${titleSizeClasses} leading-snug`}>{title}</p>
        {subtitle && <p className="mt-1 text-xs opacity-80">{subtitle}</p>}
      </div>
    </div>
  );
}
