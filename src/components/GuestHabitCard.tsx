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
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: habit.color }}
            aria-hidden="true"
          />
          <h3 className="text-base font-semibold text-slate-900 text-balance">{habit.name}</h3>

          <span className="text-xs text-slate-500 tabular-nums">
            {completionCount} day{completionCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleDate(habit.id, today)}
            className={[
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
              "border cursor-pointer transition",
              isDoneToday
                ? "text-white border-transparent"
                : "text-slate-600 border-slate-300 bg-white hover:bg-slate-50",
            ].join(" ")}
            style={
              isDoneToday
                ? { backgroundColor: habit.color, borderColor: habit.color }
                : undefined
            }
          >
            {isDoneToday ? (
              <>
                <svg
                  className="size-3"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8.5l3.5 3.5L13 4" />
                </svg>
                Done
              </>
            ) : (
              "Mark today"
            )}
          </button>

          <button
            type="button"
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.name}`}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="size-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11.5 1.5l3 3M1 11.5L11.5 1.5l3 3L4.5 15H1v-3.5z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDelete(habit)}
            aria-label={`Delete ${habit.name}`}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <svg
              className="size-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <HabitGrid
          color={habit.color}
          completionDates={habit.completions}
          onToggleDate={(date) => onToggleDate(habit.id, date)}
        />
      </div>
    </div>
  );
}
