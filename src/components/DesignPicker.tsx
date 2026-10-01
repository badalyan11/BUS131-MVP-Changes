import { useState } from "react";
import type { JournalDesign, PageStyle } from "../types";
import {
  COVER_COLORS,
  DESIGN_PRESETS,
  PAGE_STYLES,
  TITLE_FONTS,
  fontClassFor,
  suggestPreset,
} from "../lib/journalTypes";
import { fileToCompressedDataUrl } from "../lib/photo";
import { JournalCover } from "./JournalCover";
import { PageSurface } from "./PageSurface";

export function DesignPicker({
  title,
  journalType,
  value,
  onChange,
}: {
  title: string;
  journalType: string;
  value: JournalDesign;
  onChange: (design: JournalDesign) => void;
}) {
  const [mode, setMode] = useState<"preset" | "custom">(value.presetId === "custom" ? "custom" : "preset");
  const suggested = suggestPreset(journalType);

  const applyPreset = (presetId: string) => {
    const preset = DESIGN_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({
      presetId: preset.id,
      coverColor: preset.coverColor,
      coverImage: value.coverImage,
      titleFont: preset.titleFont,
      pageStyle: preset.pageStyle,
      accentColor: preset.accentColor,
    });
  };

  const setCustomField = <K extends keyof JournalDesign>(key: K, val: JournalDesign[K]) => {
    onChange({ ...value, presetId: "custom", [key]: val });
  };

  const handleCoverImage = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await fileToCompressedDataUrl(file, 1000, 0.8);
    setCustomField("coverImage", dataUrl);
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_260px]">
      <div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("preset")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              mode === "preset" ? "bg-sage-dark text-white" : "bg-beige text-ink/70"
            }`}
          >
            Ready-made design
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              mode === "custom" ? "bg-sage-dark text-white" : "bg-beige text-ink/70"
            }`}
          >
            Design my own
          </button>
        </div>

        {mode === "preset" ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {DESIGN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`rounded-xl p-2 text-left ring-2 transition ${
                  value.presetId === preset.id ? "ring-sage-dark" : "ring-transparent hover:ring-ink/10"
                }`}
              >
                <JournalCover
                  title={title || "Your Journal"}
                  design={{
                    presetId: preset.id,
                    coverColor: preset.coverColor,
                    coverImage: null,
                    titleFont: preset.titleFont,
                    pageStyle: preset.pageStyle,
                    accentColor: preset.accentColor,
                  }}
                  size="small"
                />
                <p className="mt-1.5 text-xs font-medium text-ink/70">
                  {preset.name}
                  {preset.id === suggested.id && <span className="text-sage-dark"> · suggested</span>}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm font-medium text-ink/70">Cover color</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {COVER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCustomField("coverColor", color)}
                    className={`h-8 w-8 rounded-full ring-2 ${
                      value.coverColor === color ? "ring-ink" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-ink/70">Accent color</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {COVER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCustomField("accentColor", color)}
                    className={`h-8 w-8 rounded-full ring-2 ${
                      value.accentColor === color ? "ring-ink" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-ink/70">Cover image (optional)</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleCoverImage(e.target.files?.[0])}
                className="mt-2 block w-full text-sm text-ink/70 file:mr-4 file:rounded-lg file:border-0 file:bg-beige file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-beige/70"
              />
              {value.coverImage && (
                <button
                  type="button"
                  onClick={() => setCustomField("coverImage", null)}
                  className="mt-2 text-sm text-ink/50 underline hover:text-ink/80"
                >
                  Remove image
                </button>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-ink/70">Title font</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TITLE_FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setCustomField("titleFont", font.id)}
                    className={`rounded-lg border px-3 py-2 text-sm ${fontClassFor(font.id)} ${
                      value.titleFont === font.id
                        ? "border-sage-dark bg-beige"
                        : "border-ink/15 hover:bg-white"
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-ink/70">Page style</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setCustomField("pageStyle", style.id as PageStyle)}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      value.pageStyle === style.id
                        ? "border-sage-dark bg-beige text-ink"
                        : "border-ink/15 text-ink/70 hover:bg-white"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-ink/70">Live preview</p>
        <JournalCover title={title || "Your Journal"} design={value} size="medium" />
        <PageSurface pageStyle={value.pageStyle} accentColor={value.accentColor} className="p-4">
          <p className={`${fontClassFor(value.titleFont)} text-sm`} style={{ color: value.accentColor }}>
            A Sample Page
          </p>
          <p className="mt-2 font-serif text-xs leading-relaxed text-ink/70">
            This is what your memory pages will look like.
          </p>
        </PageSurface>
      </div>
    </div>
  );
}
