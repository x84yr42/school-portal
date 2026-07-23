import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-button active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-black/80 radius-pill",
        secondary: "bg-white text-black border border-[#e6e6e6] hover:bg-[#f7f7f5] radius-pill",
        destructive: "bg-black text-white hover:bg-red-600 radius-pill",
        outline: "bg-white text-black border border-[#e6e6e6] hover:bg-[#f7f7f5] radius-pill",
        ghost: "text-black hover:bg-[#f7f7f5] radius-pill",
        link: "text-black underline-offset-4 hover:underline",
        magenta: "bg-[#ff3d8b] text-white hover:bg-[#ff3d8b]/80 radius-pill",
      },
      size: {
        default: "h-auto px-5 py-2.5",
        sm: "h-auto px-4 py-2 text-[16px]",
        lg: "h-auto px-8 py-3",
        icon: "h-10 w-10 radius-full bg-[#f7f7f5]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
