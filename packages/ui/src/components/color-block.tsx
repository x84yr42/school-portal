import * as React from "react";
import { cn } from "../lib/utils";

const colorMap: Record<string, { bg: string; text: string }> = {
  lime: { bg: "bg-[#dceeb1]", text: "text-black" },
  lilac: { bg: "bg-[#a78bfa]", text: "text-black" },
  cream: { bg: "bg-[#f4ecd6]", text: "text-black" },
  mint: { bg: "bg-[#c8e6cd]", text: "text-black" },
  pink: { bg: "bg-[#efd4d4]", text: "text-black" },
  coral: { bg: "bg-[#f3c9b6]", text: "text-black" },
  navy: { bg: "bg-[#1f1d3d]", text: "text-white" },
};

interface ColorBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "lime" | "lilac" | "cream" | "mint" | "pink" | "coral" | "navy";
}

const ColorBlock = React.forwardRef<HTMLDivElement, ColorBlockProps>(
  ({ className, color = "lime", children, ...props }, ref) => {
    const palette = colorMap[color] ?? colorMap.lime;
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[24px] p-12",
          palette.bg,
          palette.text,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ColorBlock.displayName = "ColorBlock";

export { ColorBlock };
