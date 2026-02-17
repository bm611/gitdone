import { useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { generateLast365Grid, getMonthLabels } from "../lib/dates";
import { GridCell } from "./GridCell";
import { HabitGridSkeleton } from "./HabitGridSkeleton";

interface HabitGridProps {
  color: string;
  habitId?: Id<"habits">;
  completionDates?: string[];
  onToggleDate?: (date: string) => void;
  interactive?: boolean;
}

const CELL_SIZE = 10;
const GAP = 3;
const STEP = CELL_SIZE + GAP;

export function HabitGrid({
  habitId,
  color,
  completionDates,
  onToggleDate,
  interactive = true,
}: HabitGridProps) {
  const completions = useQuery(
    api.completions.listByHabit,
    habitId ? { habitId } : "skip",
  );
  const toggle = useMutation(api.completions.toggle);

  const cells = useMemo(() => generateLast365Grid(), []);
  const monthLabels = useMemo(() => getMonthLabels(cells), [cells]);

  const completedDates = useMemo(() => {
    if (completionDates) return new Set(completionDates);
    if (!completions) return new Set<string>();
    return new Set(completions.map((c) => c.date));
  }, [completionDates, completions]);

  const maxWeek = cells[cells.length - 1]?.weekIndex ?? 52;

  const grid: (typeof cells[number] | null)[][] = Array.from(
    { length: 7 },
    () => Array(maxWeek + 1).fill(null),
  );

  for (const cell of cells) {
    grid[cell.dayOfWeek][cell.weekIndex] = cell;
  }

  const handleToggle = (date: string) => {
    if (!interactive) return;
    if (habitId) {
      void toggle({ habitId, date });
      return;
    }
    onToggleDate?.(date);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [completedDates.size]);

  if (habitId && !completions) {
    return <HabitGridSkeleton />;
  }

  return (
    <div ref={scrollRef} className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex mb-1" style={{ gap: `${GAP}px` }}>
          {monthLabels.map((m, i) => {
            const nextWeek = monthLabels[i + 1]?.weekIndex ?? maxWeek + 1;
            const span = nextWeek - m.weekIndex;
            return (
              <span
                key={m.label + m.weekIndex}
                className="text-[10px] leading-none text-gray-400 tabular-nums"
                style={{ width: `${span * STEP - GAP}px` }}
              >
                {m.label}
              </span>
            );
          })}
        </div>

        <div className="flex" style={{ gap: `${GAP}px` }}>
          {Array.from({ length: maxWeek + 1 }, (_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col" style={{ gap: `${GAP}px` }}>
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const cell = grid[dayIdx][weekIdx];
                if (!cell) {
                  return <div key={dayIdx} className="size-[10px]" />;
                }
                return (
                  <GridCell
                    key={cell.date}
                    date={cell.date}
                    isCompleted={completedDates.has(cell.date)}
                    color={color}
                    onClick={() => handleToggle(cell.date)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
