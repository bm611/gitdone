import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { todayString } from "../lib/dates";
import { HabitGrid } from "./HabitGrid";
import { HabitGridSkeleton } from "./HabitGridSkeleton";

interface HabitCardProps {
  name: string;
  color: string;
  onEdit: () => void;
  onDelete: () => void;
  habitId?: Id<"habits">;
  completionDates?: string[];
  onToggleDate?: (date: string) => void;
}

export function HabitCard({
  name,
  color,
  onEdit,
  onDelete,
  habitId,
  completionDates,
  onToggleDate,
}: HabitCardProps) {
  const remoteCompletions = useQuery(
    api.completions.listByHabit,
    habitId ? { habitId } : "skip",
  );
  const toggle = useMutation(api.completions.toggle);

  const completedSet = useMemo(() => {
    if (completionDates) return new Set(completionDates);
    return new Set(remoteCompletions?.map((c) => c.date) ?? []);
  }, [completionDates, remoteCompletions]);

  const today = todayString();
  const isDoneToday = completedSet.has(today);

  const [glowKey, setGlowKey] = useState(0);

  const handleToggle = (date: string) => {
    if (habitId) {
      void toggle({ habitId, date });
    } else {
      onToggleDate?.(date);
    }
  };

  const handleToggleToday = () => {
    if (!isDoneToday) setGlowKey((k) => k + 1);
    handleToggle(today);
  };

  const resolvedDates = useMemo(
    () => (completionDates ?? remoteCompletions?.map((c) => c.date) ?? []),
    [completionDates, remoteCompletions],
  );

  return (
    <div className="habit-card">
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4">
        <h3
          className="text-base sm:text-xl font-semibold tracking-tight bg-clip-text text-transparent min-w-0 truncate"
          style={{
            backgroundImage: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, #000))`,
          }}
        >
          {name}
        </h3>

        <div className="flex items-center gap-2 shrink-0">
          <button
            key={glowKey}
            type="button"
            onClick={handleToggleToday}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold cursor-pointer border-none transition-all duration-150${isDoneToday ? " habit-today-done" : ""}`}
            style={{
              background: isDoneToday ? `color-mix(in srgb, ${color} 60%, #000)` : "var(--color-pill-bg)",
              color: isDoneToday ? "#fff" : "var(--color-pill-text)",
            }}
            aria-label={isDoneToday ? "Unmark today" : "Mark today as done"}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isDoneToday ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </>
              )}
            </svg>
            {isDoneToday ? "Done" : "Today"}
          </button>

          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            className="habit-icon-btn"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="habit-icon-btn"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {habitId && !remoteCompletions ? (
        <HabitGridSkeleton />
      ) : (
        <HabitGrid
          completionDates={resolvedDates}
          onToggleDate={handleToggle}
        />
      )}
    </div>
  );
}
