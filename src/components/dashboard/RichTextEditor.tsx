"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Link as LinkIcon, Eraser } from "lucide-react";

interface Props {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
}

const TOOLS: { cmd: string; arg?: string; label: string; icon: React.ReactNode }[] = [
  { cmd: "bold", label: "Bold", icon: <Bold size={14} /> },
  { cmd: "italic", label: "Italic", icon: <Italic size={14} /> },
  { cmd: "underline", label: "Underline", icon: <Underline size={14} /> },
  { cmd: "formatBlock", arg: "h3", label: "Heading", icon: <Heading2 size={14} /> },
  { cmd: "insertUnorderedList", label: "Bullet list", icon: <List size={14} /> },
  { cmd: "insertOrderedList", label: "Numbered list", icon: <ListOrdered size={14} /> },
];

/** Lightweight rich-text field. Output HTML is sanitized again on the server. */
export default function RichTextEditor({ id, value, onChange, disabled, placeholder, minHeight = 140 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external value (open/edit/reset) without clobbering the caret while typing.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value;
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    if (disabled) return;
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  };

  const link = () => {
    const url = window.prompt("Link URL (https://…)");
    if (url && /^(https?:\/\/|mailto:)/i.test(url)) exec("createLink", url);
  };

  return (
    <div className={`rte${disabled ? " is-disabled" : ""}`}>
      <div className="rte__bar" role="toolbar" aria-label="Formatting">
        {TOOLS.map((t) => (
          <button
            key={t.label}
            type="button"
            className="rte__btn"
            title={t.label}
            aria-label={t.label}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd, t.arg)}
          >
            {t.icon}
          </button>
        ))}
        <button type="button" className="rte__btn" title="Link" aria-label="Link" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={link}>
          <LinkIcon size={14} />
        </button>
        <button type="button" className="rte__btn" title="Clear formatting" aria-label="Clear formatting" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("removeFormat")}>
          <Eraser size={14} />
        </button>
      </div>
      <div
        id={id}
        ref={ref}
        className="rte__area rich-content"
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        onBlur={() => onChange(ref.current?.innerHTML ?? "")}
        onPaste={(e) => {
          // Paste as plain text to avoid foreign styles.
          e.preventDefault();
          document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
        }}
      />
    </div>
  );
}
