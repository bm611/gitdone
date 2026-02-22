import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../lib/cn";

const COLORS = [
  { name: "Coral", value: "#f87171" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Lime", value: "#84cc16" },
  { name: "Emerald", value: "#34d399" },
  { name: "Teal", value: "#2dd4bf" },
  { name: "Sky", value: "#38bdf8" },
  { name: "Indigo", value: "#818cf8" },
  { name: "Violet", value: "#a78bfa" },
  { name: "Fuchsia", value: "#e879f9" },
  { name: "Rose", value: "#fb7185" },
];

const CATEGORIES = [
  "Health",
  "Fitness",
  "Mindfulness",
  "Productivity",
  "Learning",
  "Creative",
  "Social",
  "Finance",
  "Self-care",
];

interface HabitFormProps {
  editingHabit?: { name: string; color: string; category?: string } | null;
  onSubmitHabit: (values: { name: string; color: string; category?: string }) => Promise<void> | void;
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
  const [category, setCategory] = useState(editingHabit?.category ?? "");

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
    await onSubmitHabit({ name: name.trim(), color, category: category || undefined });
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
        <div className="p-4 sm:p-8">
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
              <label htmlFor="habit-category" className="luxury-subheading block mb-2">
                Category <span className="text-[var(--color-ink-faint)]">(optional)</span>
              </label>
              <select
                id="habit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="habit-input"
              >
                <option value="">No category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="luxury-subheading block mb-3">Color</span>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    aria-label={c.name}
                    className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all duration-200",
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
                Demo mode — habits will not be saved.
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
