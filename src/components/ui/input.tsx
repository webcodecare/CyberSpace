import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]",
          "placeholder:text-[var(--muted)] placeholder:opacity-60",
          "transition-[border-color,box-shadow] duration-[var(--dur)]",
          "focus-visible:outline-none focus-visible:border-[var(--blue)] focus-visible:ring-[3px] focus-visible:ring-[rgba(47,107,255,0.12)]",
          "disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:opacity-60",
          "read-only:bg-[var(--surface-2)] read-only:cursor-default",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
