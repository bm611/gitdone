import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { todayString } from "../lib/dates";
import { HabitGrid } from "./HabitGrid";

interface HabitCardProps {
  habit: Doc<"habits">;
  onEdit: (habit: Doc<"habits">) => void;
  onDelete: (habit: Doc<"habits">) => void;
}

export function HabitCard({ habit, onEdit, onDelete }: HabitCardProps) {
  const toggle = useMutation(api.completions.toggle);
  const completions = useQuery(api.completions.listByHabit, {
    habitId: habit._id,
  });

  const today = todayString();
  const isDoneToday = useMemo(() => {
    if (!completions) return false;
    return completions.some((c) => c.date === today);
  }, [completions, today]);

  const completionCount = completions?.length ?? 0;

  const handleToggleToday = () => {
    void toggle({ habitId: habit._id, date: today });
  };

  return (
    <div className="luxury-card p-6 sm:p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleToggleToday}
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

      <HabitGrid habitId={habit._id} color={habit.color} />
    </div>
  );
}
