"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group flex items-center gap-3 rounded-[16px] border border-[#e6e6e6] bg-white px-4 py-3 text-body-sm text-black",
          title: "text-body-sm font-medium text-black",
          description: "text-body-sm text-black/60",
          actionButton:
            "rounded-full bg-black px-3 py-1 text-[13px] text-white",
          cancelButton:
            "rounded-full bg-[#f7f7f5] px-3 py-1 text-[13px] text-black",
          success: "[&_[data-icon]]:text-[#1ea64a]",
          error: "[&_[data-icon]]:text-[#ff3d8b]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
