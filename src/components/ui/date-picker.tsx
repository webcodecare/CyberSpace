"use client";

import * as React from "react";
import { CalendarDays, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { cn } from "@/lib/utils";

/** "YYYY-MM-DD" <-> local Date (no timezone shifts). */
export const parseDateValue = (v: string): Date | undefined => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
};
export const formatDateValue = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Earliest / latest selectable day, as "YYYY-MM-DD". */
  min?: string;
  max?: string;
  clearable?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  min,
  max,
  clearable,
  className,
  ...rest
}: Props) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateValue(value);
  const minD = min ? parseDateValue(min) : undefined;
  const maxD = max ? parseDateValue(max) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("ui-date", className)}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn("ui-select-trigger", !selected && "is-placeholder")}
            aria-label={rest["aria-label"]}
          >
            <span className="ui-date__label">
              <CalendarDays size={15} />
              {selected ? selected.toLocaleDateString(undefined, { dateStyle: "medium" }) : placeholder}
            </span>
          </button>
        </PopoverTrigger>
        {clearable && selected && !disabled && (
          <button type="button" className="ui-date__clear" aria-label="Clear date" onClick={() => onChange("")}>
            <X size={14} />
          </button>
        )}
      </div>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? minD}
          onSelect={(d) => {
            if (d) onChange(formatDateValue(d));
            setOpen(false);
          }}
          disabled={[...(minD ? [{ before: minD }] : []), ...(maxD ? [{ after: maxD }] : [])]}
        />
      </PopoverContent>
    </Popover>
  );
}
