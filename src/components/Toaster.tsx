"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";

type ToastItem = { id: number; msg: string; type: "success" | "error" | "info"; sub?: string; exiting?: boolean };

export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    toast._register((msg, type = "success", sub) => {
      const id = Date.now();
      setItems((prev) => [...prev, { id, msg, type, sub }]);
      setTimeout(() => {
        setItems((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 350);
      }, 4000);
    });
  }, []);

  if (!items.length) return null;

  return (
    <div className="toaster" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`toast toast--${item.type}${item.exiting ? " toast--exit" : ""}`}>
          <span className="toast__icon">
            {item.type === "success" && (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-5" />
              </svg>
            )}
            {item.type === "error" && (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
            )}
            {item.type === "info" && (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
              </svg>
            )}
          </span>
          <div className="toast__body">
            <p className="toast__msg">{item.msg}</p>
            {item.sub && <p className="toast__sub">{item.sub}</p>}
          </div>
          <button
            type="button"
            className="toast__close"
            onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
