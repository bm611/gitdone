import { useMemo } from "react";
import { todayString } from "../lib/dates";
import { HabitGrid } from "./HabitGrid";

export interface GuestHabit {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  completions: string[];
}

interface GuestHabitCardProps {
  habit: GuestHabit;
  onEdit: (habit: GuestHabit) => void;
  onDelete: (habit: GuestHabit) => void;
  onToggleDate: (habitId: string, date: string) => void;
}

export function GuestHabitCard({
  habit,
  onEdit,
  onDelete,
  onToggleDate,
}: GuestHabitCardProps) {
  const today = todayString();
  const isDoneToday = useMemo(
    () => habit.completions.includes(today),
    [habit.completions, today],
  );
  const completionCount = habit.completions.length;

  return (
    <div className="luxury-card p-6 sm:p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onToggleDate(habit.id, today)}
            className="group relative w-6 h-6 border border-[var(--color-ink-faint)] flex items-center justify-center transition-all duration-300 hover:border-[var(--color-ink)]"
            aria-label={isDoneToday ? "Unmark today" : "Mark today as done"}
          >
            {isDoneToday && (
              <svg className="w-3.5 h-3.5 text-[var(--color-ink)]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8.5L6.5 12L13 4" />
              </svg>
            )}
          </button>
          <div>
            <h3 className="font-serif text-xl font-light tracking-tight">{habit.name}</h3>
            <p className="luxury-subheading mt-0.5">
              {completionCount} {completionCount === 1 ? "day" : "days"} &middot; {isDoneToday ? "Complete" : "Pending"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            aria-label="Edit"
            className="luxury-btn-ghost"
          >
            Edit
          </button>
          <span className="text-[var(--color-ink-faint)]">/</span>
          <button
            type="button"
            onClick={() => onDelete(habit)}
            aria-label="Delete"
            className="luxury-btn-ghost"
          >
            Remove
          </button>
        </div>
      </div>

      <HabitGrid
        color={habit.color}
        completionDates={habit.completions}
        onToggleDate={(date) => onToggleDate(habit.id, date)}
      />
    </div>
  );
}
