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
  const completionCount = habit.completions.length;

  return (
    <div className="habit-card">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xl font-semibold tracking-tight bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(135deg, ${habit.color}, color-mix(in srgb, ${habit.color} 60%, #000))`,
          }}
        >
          {habit.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="habit-pill">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {completionCount} {completionCount === 1 ? "day" : "days"}
          </span>

          <button
            type="button"
            onClick={() => onEdit(habit)}
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
            onClick={() => onDelete(habit)}
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

      <HabitGrid
        color={habit.color}
        completionDates={habit.completions}
        onToggleDate={(date) => onToggleDate(habit.id, date)}
      />
    </div>
  );
}
