import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../lib/cn";

const COLORS = [
  { name: "Rose", value: "#fbb4b4" },
  { name: "Peach", value: "#fcd5b4" },
  { name: "Banana", value: "#fef3b4" },
  { name: "Mint", value: "#b4fcd5" },
  { name: "Sage", value: "#b4f0e0" },
  { name: "Sky", value: "#b4d8fc" },
  { name: "Periwinkle", value: "#b4b8fc" },
  { name: "Lavender", value: "#d5b4fc" },
  { name: "Mauve", value: "#f0b4e0" },
  { name: "Blush", value: "#fcb4d8" },
];

interface HabitFormProps {
  editingHabit?: { name: string; color: string } | null;
  onSubmitHabit: (values: { name: string; color: string }) => Promise<void> | void;
  guestMode?: boolean;
  onClose: () => void;
}

export function HabitForm({
  editingHabit,
  onSubmitHabit,
  guestMode = false,
  onClose,
}: HabitFormProps) {
  const [name, setName] = useState(editingHabit?.name ?? "");
  const [color, setColor] = useState(editingHabit?.color ?? COLORS[0].value);

  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmitHabit({ name: name.trim(), color });
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={editingHabit ? "Edit habit" : "New habit"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] font-body"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-[var(--color-card)] w-full max-w-md mx-4 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="luxury-heading text-xl">
              {editingHabit ? "Edit habit" : "New habit"}
            </h2>
            <button
              onClick={onClose}
              className="habit-icon-btn"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="habit-name" className="luxury-subheading block mb-2">
                Name
              </label>
              <input
                ref={inputRef}
                id="habit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Morning meditation..."
                className="habit-input"
              />
            </div>

            <div>
              <span className="luxury-subheading block mb-3">Color</span>
              <div className="flex gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    aria-label={c.name}
                    className={cn(
                      "w-7 h-7 rounded-full transition-all duration-200",
                      color === c.value
                        ? "ring-2 ring-offset-3 ring-[var(--color-ink-muted)]"
                        : "hover:scale-110"
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            {guestMode && (
              <p className="text-xs text-[var(--color-ink-muted)] bg-[var(--color-pill-bg)] rounded-lg px-3 py-2">
                Guest mode — data is stored locally in your browser.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="luxury-btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="luxury-btn-filled disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {editingHabit ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
