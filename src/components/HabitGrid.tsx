import { useCallback, useMemo, memo } from "react";
import type { DayCell } from "../lib/dates";
import { generateCalendarMonthsGrid } from "../lib/dates";
import { GridCell } from "./GridCell";

interface HabitGridProps {
  completionDates?: string[];
  onToggleDate?: (date: string) => void;
  interactive?: boolean;
  monthWindow?: 3 | 6;
}

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface MonthGroup {
  label: string;
  shortLabel: string;
  rows: (DayCell | null)[][];
}

function groupByMonth(cells: DayCell[]): MonthGroup[] {
  if (cells.length === 0) return [];

  const groups: MonthGroup[] = [];
  let currentMonth = -1;
  let lastGlobalWeek = -1;

  for (const cell of cells) {
    if (cell.month !== currentMonth) {
      groups.push({
        label: FULL_MONTHS[cell.month],
        shortLabel: SHORT_MONTHS[cell.month],
        rows: [],
      });
      currentMonth = cell.month;
      lastGlobalWeek = -1;
    }

    const group = groups[groups.length - 1];

    if (cell.weekIndex !== lastGlobalWeek) {
      lastGlobalWeek = cell.weekIndex;
      group.rows.push(Array(7).fill(null));
    }

    const row = group.rows[group.rows.length - 1];
    row[cell.dayOfWeek] = cell;
  }

  return groups;
}

export const HabitGrid = memo(function HabitGrid({
  completionDates,
  onToggleDate,
  interactive = true,
  monthWindow = 6,
}: HabitGridProps) {
  const cells = useMemo(() => generateCalendarMonthsGrid(monthWindow), [monthWindow]);
  const monthGroups = useMemo(() => groupByMonth(cells), [cells]);

  const completedDates = useMemo(
    () => new Set(completionDates ?? []),
    [completionDates],
  );

  const isInteractive = interactive && !!onToggleDate;

  const handleToggle = useCallback((date: string) => {
    if (!isInteractive) return;
    onToggleDate?.(date);
  }, [isInteractive, onToggleDate]);

  return (
    <div className={`grid gap-2 sm:gap-3 ${monthWindow === 3 ? "grid-cols-3" : "grid-cols-6"}`}>
      {monthGroups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="text-xs font-bold text-ink mb-0.5 truncate">
            <span className="hidden sm:inline">{group.label}</span>
            <span className="sm:hidden">{group.shortLabel}</span>
          </span>
          <div className="flex flex-col gap-[2px]">
            {group.rows.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-7 gap-[2px]">
                {row.map((cell, dayIdx) => {
                  if (!cell) {
                    return (
                      <div key={dayIdx} className="aspect-square rounded-[3px] bg-transparent" />
                    );
                  }
                  return (
                    <GridCell
                      key={cell.date}
                      date={cell.date}
                      isCompleted={completedDates.has(cell.date)}
                      onToggleDate={handleToggle}
                      disabled={!isInteractive}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
