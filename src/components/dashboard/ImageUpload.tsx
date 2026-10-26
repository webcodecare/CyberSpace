"use client";

import { useRef, useState, useCallback } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
  accept?: string;
  maxSizeMB?: number;
  showUrlInput?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
  label = "Image",
  hint = "JPG, PNG or WebP · max 5 MB",
  accept = "image/*",
  maxSizeMB = 5,
  showUrlInput = true,
}: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  async function uploadFile(file: File) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File too large — max ${maxSizeMB} MB`);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setUploadError("Unsupported format — use JPG, PNG, WebP or GIF");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.data?.imageUrl) {
        onChange(data.data.imageUrl);
      } else {
        setUploadError(data?.message ?? "Upload failed — try again");
      }
    } catch {
      setUploadError("Network error during upload");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || uploading) return;
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [disabled, uploading]
  );

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const hasImage = Boolean(value);

  return (
    <div className="pf-field">
      {label && <span className="pf-label">{label}</span>}

      {hasImage ? (
        <div className="img-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" />
          <div className="img-preview__bar">
            <span className="img-preview__name">{value.split("/").pop()}</span>
            <button
              type="button"
              className="img-preview__remove"
              onClick={() => { onChange(""); setUploadError(""); }}
              disabled={disabled || uploading}
              aria-label="Remove image"
            >
              Remove
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => fileRef.current?.click()}
              disabled={disabled || uploading}
              style={{ fontSize: ".75rem", padding: "3px 10px" }}
            >
              Replace
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`img-upload${isDragging ? " is-over" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && fileRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => e.key === "Enter" && !disabled && fileRef.current?.click()}
          aria-label="Upload image"
        >
          <div className="img-upload__inner">
            {uploading ? (
              <>
                <span className="img-upload__spinner" aria-hidden="true" />
                <span className="img-upload__label">Uploading…</span>
              </>
            ) : (
              <>
                <svg className="img-upload__icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span className="img-upload__label">Click or drag to upload</span>
                <span className="img-upload__hint">{hint}</span>
              </>
            )}
          </div>
          {uploading && <div className="img-upload-progress"><div className="img-upload-progress__bar" /></div>}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      {uploadError && <p className="err" role="alert">{uploadError}</p>}

      {showUrlInput && (
        <div className="img-dual" style={{ marginTop: 8 }}>
          <div className="img-dual__or">or paste URL</div>
          <input
            type="url"
            className="pf-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            disabled={disabled || uploading}
          />
        </div>
      )}
    </div>
  );
}
