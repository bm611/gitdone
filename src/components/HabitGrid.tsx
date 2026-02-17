import { useMemo, useRef, useEffect, useSyncExternalStore } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { generateLast365Grid, getMonthLabels } from "../lib/dates";
import { GridCell } from "./GridCell";
import { HabitGridSkeleton } from "./HabitGridSkeleton";

const MOBILE_QUERY = "(max-width: 639px)";

function subscribeMobile(cb: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getIsMobile() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getIsMobileServer() {
  return false;
}

function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, getIsMobile, getIsMobileServer);
}

interface HabitGridProps {
  color: string;
  habitId?: Id<"habits">;
  completionDates?: string[];
  onToggleDate?: (date: string) => void;
  interactive?: boolean;
}

const CELL_SIZE = 10;
const GAP = 2;
const STEP = CELL_SIZE + GAP;
const MOBILE_CELL_SIZE = 10;
const MOBILE_GAP = 2;

export function HabitGrid({
  habitId,
  color,
  completionDates,
  onToggleDate,
  interactive = true,
}: HabitGridProps) {
  const isMobile = useIsMobile();
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
    if (!el) return;
    if (isMobile) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollLeft = el.scrollWidth;
    }
  }, [completedDates.size, isMobile]);

  if (habitId && !completions) {
    return <HabitGridSkeleton />;
  }

  if (isMobile) {
    return (
      <div ref={scrollRef} className="overflow-y-auto max-h-[18rem]">
        <div
          className="grid justify-center"
          style={{
            gridTemplateColumns: `repeat(7, ${MOBILE_CELL_SIZE}px)`,
            gridAutoRows: `${MOBILE_CELL_SIZE}px`,
            gap: `${MOBILE_GAP}px`,
          }}
        >
          {cells.map((cell) => (
            <GridCell
              key={cell.date}
              date={cell.date}
              isCompleted={completedDates.has(cell.date)}
              color={color}
              onClick={() => handleToggle(cell.date)}
              fill
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex mb-1.5" style={{ gap: `${GAP}px` }}>
          {monthLabels.map((m, i) => {
            const nextWeek = monthLabels[i + 1]?.weekIndex ?? maxWeek + 1;
            const span = nextWeek - m.weekIndex;
            return (
              <span
                key={m.label + m.weekIndex}
                className="text-[8px] leading-none text-[var(--color-ink-faint)] font-body tracking-[0.08em] uppercase"
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
                  return (
                    <div
                      key={dayIdx}
                      className="size-[10px] rounded-full bg-transparent"
                    />
                  );
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
