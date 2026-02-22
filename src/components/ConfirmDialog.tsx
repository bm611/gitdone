import { useRef } from "react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Remove",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onCancel();
  };

  return (
    <div
      ref={overlayRef}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] font-body"
      onClick={handleOverlayClick}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <div className="bg-white w-full max-w-sm mx-4 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.15)]">
        <div className="p-5 sm:p-10">
          <h3 className="luxury-heading text-xl mb-3">{title}</h3>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-8">
            {description}
          </p>

          <div className="w-full h-[1px] bg-[var(--color-divider)] mb-8" />

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="luxury-btn-ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="luxury-btn-filled"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
