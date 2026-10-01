import type { ReactNode } from "react";
import type { PageStyle } from "../types";

function backgroundFor(pageStyle: PageStyle, accentColor: string): React.CSSProperties {
  switch (pageStyle) {
    case "lined":
      return {
        backgroundColor: "#FFFDF8",
        backgroundImage: `repeating-linear-gradient(${accentColor}33 0 1px, transparent 1px 2rem)`,
        backgroundPosition: "0 2.5rem",
      };
    case "dotted":
      return {
        backgroundColor: "#FFFDF8",
        backgroundImage: `radial-gradient(${accentColor}55 1px, transparent 1px)`,
        backgroundSize: "1.25rem 1.25rem",
      };
    case "vintage":
      return {
        backgroundColor: "#EFE3CD",
        backgroundImage: "radial-gradient(#00000008 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      };
    case "plain":
    default:
      return { backgroundColor: "#FFFDF8" };
  }
}

export function PageSurface({
  pageStyle,
  accentColor,
  className = "",
  children,
}: {
  pageStyle: PageStyle;
  accentColor: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl shadow-sm ring-1 ring-black/5 ${className}`}
      style={backgroundFor(pageStyle, accentColor)}
    >
      {children}
    </div>
  );
}
