"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Generic destructive/state-change confirmation dialog. Used for approve,
 * reject, suspend, delete, and archive flows across every module.
 *
 * When `reasonRequired` is set, the confirm button stays disabled until
 * the admin types a non-empty reason (used for reject/suspend, which the
 * spec requires a reason for).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  reasonRequired = false,
  reasonLabel = "Reason",
  extraField,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  reasonRequired?: boolean;
  reasonLabel?: string;
  /** Optional extra control rendered under the reason field (e.g. a suspension-period select). */
  extraField?: React.ReactNode;
  onConfirm: (reason?: string) => void | Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm(reasonRequired ? reason : undefined);
      onOpenChange(false);
      setReason("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {reasonRequired && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-reason">{reasonLabel}</Label>
            <Textarea
              id="confirm-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason..."
              rows={3}
            />
          </div>
        )}

        {extraField}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={submitting || (reasonRequired && reason.trim().length === 0)}
          >
            {submitting ? "Please wait..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
