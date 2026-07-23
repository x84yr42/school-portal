import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center radius-pill px-3 py-1 text-[13px] font-[480]",
  {
    variants: {
      variant: {
        default: "bg-black text-white",
        gray: "bg-[#f7f7f5] text-black",
        green: "bg-[#c8e6cd] text-[#1ea64a]",
        red: "bg-[#efd4d4] text-black",
        yellow: "bg-[#f4ecd6] text-black",
        outline: "border border-[#e6e6e6] text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
