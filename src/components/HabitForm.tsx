import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../lib/cn";

const COLORS = [
  { name: "Charcoal", value: "#111111" },
  { name: "Graphite", value: "#262626" },
  { name: "Slate", value: "#404040" },
  { name: "Stone", value: "#525252" },
  { name: "Silver", value: "#737373" },
  { name: "Mist", value: "#a3a3a3" },
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
      aria-label={editingHabit ? "Edit ritual" : "New ritual"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] font-body"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white w-full max-w-md mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.15)]">
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="luxury-heading text-2xl">
              {editingHabit ? "Edit Ritual" : "New Ritual"}
            </h2>
            <button
              onClick={onClose}
              className="luxury-btn-ghost text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="habit-name"
                className="luxury-subheading block mb-3"
              >
                Name
              </label>
              <input
                ref={inputRef}
                id="habit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Morning meditation..."
                className="luxury-input"
              />
            </div>

            <div>
              <span className="luxury-subheading block mb-4">Shade</span>
              <div className="flex gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    aria-label={c.name}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all duration-300",
                      color === c.value
                        ? "ring-1 ring-offset-4 ring-[var(--color-ink)]"
                        : "hover:scale-110"
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            {guestMode && (
              <p className="text-xs text-[var(--color-ink-muted)] italic border-l-2 border-[var(--color-divider)] pl-4">
                Guest mode — data is stored locally in your browser.
              </p>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
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
