import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Thin layout wrapper around a form control: label, the control itself
 * (passed as children, typically an <Input>/<Select>/<Textarea> registered
 * via react-hook-form), an optional hint, and an error message. Framework
 * agnostic on purpose — pass `error` as a plain string so it works the same
 * whether the control is wired with register(), Controller, or plain state.
 */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-on-surface-variant">{hint}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-6">
      <div className="mb-6">
        <h3 className="font-display text-lg text-on-surface">{title}</h3>
        {description && <p className="text-sm text-on-surface-variant mt-1">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
    </section>
  );
}
