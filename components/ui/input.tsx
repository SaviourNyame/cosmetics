import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-outline-variant bg-white/70 px-3.5 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 outline-none transition-shadow focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-outline-variant bg-white/70 px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 outline-none transition-shadow focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
