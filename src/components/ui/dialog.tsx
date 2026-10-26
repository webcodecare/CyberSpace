"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9998,
  backgroundColor: "rgba(7, 20, 40, 0.55)",
  backdropFilter: "blur(5px)",
  WebkitBackdropFilter: "blur(5px)",
  animation: "overlayShow 0.18s ease both",
};

function getMaxWidth(size?: "sm" | "default" | "wide" | "xl") {
  if (size === "xl")   return 940;
  if (size === "wide") return 720;
  if (size === "sm")   return 420;
  return 540;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} style={{ ...overlayStyle, ...style }} {...props} />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    size?: "sm" | "default" | "wide" | "xl";
  }
>(({ children, size, style, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        zIndex: 9999,
        transform: "translate(-50%, -50%)",
        width: `min(${getMaxWidth(size)}px, calc(100vw - 20px))`,
        maxHeight: "min(92vh, 860px)",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        border: "1px solid #dbe3ef",
        boxShadow: "0 24px 80px rgba(10,27,61,0.22), 0 6px 24px rgba(10,27,61,0.10)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "dlgIn 0.2s cubic-bezier(0.25,0.1,0.25,1) both",
        ...style,
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close aria-label="Close" className="dlg-close">
        <X size={15} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      padding: "20px 24px 16px",
      borderBottom: "1px solid #dbe3ef",
      flexShrink: 0,
      paddingRight: 52,
      ...style,
    }}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    style={{
      fontSize: 15,
      fontWeight: 600,
      color: "#0f1b2d",
      margin: 0,
      ...style,
    }}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    style={{
      fontSize: 13,
      color: "#5b6b82",
      margin: "4px 0 0",
      ...style,
    }}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const DialogBody = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      flex: "1 1 auto",
      overflowY: "auto",
      padding: "20px 24px",
      ...style,
    }}
    {...props}
  />
);
DialogBody.displayName = "DialogBody";

const DialogFooter = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
      padding: "14px 24px",
      borderTop: "1px solid #dbe3ef",
      flexShrink: 0,
      background: "#f8fafd",
      borderRadius: "0 0 14px 14px",
      ...style,
    }}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

// Wraps a <form> so it participates correctly in the flex-column layout of
// DialogContent (flex: 1 1 auto + min-height: 0 are required for the
// DialogBody's overflow-y: auto to actually activate).
const DialogForm = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ style, ...props }, ref) => (
  <form
    ref={ref}
    style={{
      display: "flex",
      flexDirection: "column",
      flex: "1 1 auto",
      minHeight: 0,
      overflow: "hidden",
      ...style,
    }}
    {...props}
  />
));
DialogForm.displayName = "DialogForm";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogForm,
};
