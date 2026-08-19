"use client";

import { useCallback, useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { UploadCloud, FileText, X } from "lucide-react";
import { getFirebaseStorage } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  name: string;
  url: string;
}

interface PendingFile {
  file: File;
  progress: number;
  error?: string;
}

/**
 * Drag-and-drop uploader backed directly by Firebase Storage
 * (uploadBytesResumable gives per-file progress). `storagePath` is the
 * folder files are written to, e.g. `supplier-documents/${supplierId}` —
 * see storage.rules for which paths a given role may write to.
 */
export function FileUpload({
  storagePath,
  accept,
  maxSizeMB = 10,
  multiple = false,
  onUploaded,
}: {
  storagePath: string;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  onUploaded: (files: UploadedFile[]) => void;
}) {
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList).slice(0, multiple ? undefined : 1);
      const accepted: File[] = [];

      for (const file of files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setPending((prev) => [
            ...prev,
            { file, progress: 0, error: `Exceeds ${maxSizeMB}MB limit` },
          ]);
          continue;
        }
        accepted.push(file);
      }

      const newPending: PendingFile[] = accepted.map((file) => ({ file, progress: 0 }));
      setPending((prev) => [...prev, ...newPending]);

      const uploaded: UploadedFile[] = [];
      let remaining = accepted.length;
      if (remaining === 0) return;

      accepted.forEach((file) => {
        const storageRef = ref(getFirebaseStorage(), `${storagePath}/${Date.now()}-${file.name}`);
        const task = uploadBytesResumable(storageRef, file);

        task.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setPending((prev) =>
              prev.map((p) => (p.file === file ? { ...p, progress } : p))
            );
          },
          () => {
            setPending((prev) =>
              prev.map((p) => (p.file === file ? { ...p, error: "Upload failed" } : p))
            );
            remaining -= 1;
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            uploaded.push({ name: file.name, url });
            setPending((prev) => prev.filter((p) => p.file !== file));
            remaining -= 1;
            if (remaining === 0) onUploaded(uploaded);
          }
        );
      });
    },
    [maxSizeMB, multiple, onUploaded, storagePath]
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-outline-variant bg-white/40 hover:bg-white/70"
        )}
      >
        <UploadCloud className="size-7 text-on-surface-variant" strokeWidth={1.5} />
        <p className="text-sm text-on-surface">
          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-on-surface-variant">
          {accept ?? "Any file"} up to {maxSizeMB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {pending.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pending.map((p, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border border-outline-variant/60 bg-white/60 px-3 py-2"
            >
              <FileText className="size-4 text-on-surface-variant shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{p.file.name}</p>
                {p.error ? (
                  <p className="text-xs text-error">{p.error}</p>
                ) : (
                  <div className="h-1.5 w-full rounded-full bg-surface-container-high mt-1">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {p.error && (
                <button
                  onClick={() => setPending((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-on-surface-variant hover:text-error"
                >
                  <X className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
