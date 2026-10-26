"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  variant?: "destructive" | "default";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  loading = false,
  variant = "destructive",
}: ConfirmDialogProps) {
  async function handleConfirm() {
    await onConfirm();
  }

  const isDestructive = variant === "destructive";

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 4, paddingBottom: 2 }}>
            <div className={`cdlg-icon${isDestructive ? " cdlg-icon--danger" : " cdlg-icon--info"}`}>
              {isDestructive
                ? <AlertTriangle size={22} strokeWidth={2} />
                : <Info size={22} strokeWidth={2} />}
            </div>
            <DialogTitle style={{ textAlign: "center" }}>{title}</DialogTitle>
          </div>
        </DialogHeader>
        {description && (
          <DialogBody style={{ padding: "12px 24px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 13.5, color: "#5b6b82", margin: 0, lineHeight: 1.55 }}>{description}</p>
          </DialogBody>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span className="btn-spinner" />
                Deleting…
              </span>
            ) : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
