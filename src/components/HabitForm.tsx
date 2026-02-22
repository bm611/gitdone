import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../lib/cn";
import { MagicWand01Icon, PencilEdit01Icon, Tick01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm font-body animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-[var(--color-card)] border border-[var(--color-divider)] w-full max-w-md mx-4 rounded-[24px] shadow-[var(--shadow-raised)] p-6 sm:p-8 animate-modal-bounce">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--color-bg)] rounded-xl shadow-[var(--shadow-pressed)] text-amber-500 animated-icon-bounce">
                <HugeiconsIcon icon={editingHabit ? PencilEdit01Icon : MagicWand01Icon} className="w-5 h-5" color="currentColor" strokeWidth={2} />
              </div>
              <h2 className="font-pixel text-[var(--color-ink)] drop-shadow-sm text-xl sm:text-2xl mt-1">
                {editingHabit ? "Edit Habit" : "New Habit"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="habit-icon-btn rounded-xl"
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" color="currentColor" strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="habit-name" className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider block mb-2">
                Habit Name
              </label>
              <input
                ref={inputRef}
                id="habit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Morning meditation..."
                className="habit-input rounded-2xl p-4 text-base focus:-translate-y-0.5 focus:shadow-[var(--shadow-raised)]"
              />
            </div>

            <div>
              <label htmlFor="habit-category" className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider block mb-2">
                Category <span className="text-[var(--color-ink-faint)] lowercase normal-case ml-1">(optional)</span>
              </label>
              <select
                id="habit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="habit-input rounded-2xl p-4 text-base focus:-translate-y-0.5 focus:shadow-[var(--shadow-raised)] cursor-pointer"
              >
                <option value="">Choose a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider block mb-3">Color</span>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    aria-label={c.name}
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center",
                      color === c.value
                        ? "shadow-[var(--shadow-pressed)] scale-95 border-[3px] border-[var(--color-bg)] outline outline-2 outline-offset-1"
                        : "shadow-[var(--shadow-raised)] hover:scale-110 hover:-translate-y-0.5"
                    )}
                    style={{ backgroundColor: c.value, outlineColor: color === c.value ? c.value : 'transparent' }}
                  >
                    {color === c.value && (
                       <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {guestMode && (
              <div className="flex items-center gap-2 p-3 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-divider)] shadow-[var(--shadow-pressed)] animate-in fade-in zoom-in-95 duration-300">
                 <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                 <p className="text-xs font-bold text-[var(--color-ink-muted)]">
                   Demo mode — this habit will not be saved permanently.
                 </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl font-bold text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-bg-secondary)] transition-all cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="habit-btn-create py-3 px-6 text-sm"
              >
                {editingHabit ? "Save Changes" : "Let's Go!"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
