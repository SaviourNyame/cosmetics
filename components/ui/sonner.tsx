"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        className: "!rounded-xl !border !border-white/40 !bg-white/95 !backdrop-blur-xl !text-on-surface !shadow-2xl",
      }}
    />
  );
}
