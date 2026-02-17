import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../lib/cn";

const COLORS = [
  { name: "Green", value: "#39d353" },
  { name: "Blue", value: "#1e90ff" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-md mx-4 rounded-2xl border border-amber-100/80 bg-white/95 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold text-slate-900 text-balance">
          {editingHabit ? "Edit Habit" : "New Habit"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="habit-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              ref={inputRef}
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Exercise, Read, Meditate..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">
              Color
            </legend>
            <div className="flex gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  aria-label={c.name}
                  className={cn(
                    "size-8 cursor-pointer rounded-full transition hover:scale-105",
                    "ring-offset-2 ring-offset-white",
                    color === c.value ? "ring-2" : "ring-0 hover:ring-1",
                  )}
                  style={{
                    backgroundColor: c.value,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ["--tw-ring-color" as any]: c.value,
                  }}
                />
              ))}
            </div>
          </fieldset>

          {guestMode && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Log in to save habits to your account.
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {editingHabit ? "Save" : "Add Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
