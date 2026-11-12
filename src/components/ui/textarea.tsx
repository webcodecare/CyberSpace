import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]",
          "placeholder:text-[var(--muted)] placeholder:opacity-60",
          "transition-[border-color,box-shadow] duration-[var(--dur)]",
          "focus-visible:outline-none focus-visible:border-[var(--blue)] focus-visible:ring-[3px] focus-visible:ring-[rgba(47,107,255,0.12)]",
          "disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:opacity-60",
          "resize-y",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
