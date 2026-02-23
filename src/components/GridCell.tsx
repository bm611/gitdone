import { memo } from "react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDisplayDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

interface GridCellProps {
  isCompleted: boolean;
  date: string;
  onToggleDate: (date: string) => void;
  disabled?: boolean;
}

export const GridCell = memo(function GridCell({ isCompleted, date, onToggleDate, disabled }: GridCellProps) {
  const display = formatDisplayDate(date);

  return (
    <div className="relative group/cell leading-none">
      <button
        type="button"
        aria-label={`${display}${isCompleted ? ", completed" : ""}`}
        onClick={() => !disabled && onToggleDate(date)}
        title={display}
        className={`block w-full aspect-square p-0 m-0 rounded-[4px] transition-[background-color] duration-200 ${disabled ? "cursor-default" : "cursor-pointer hover:brightness-110"}`}
        style={{
          backgroundColor: isCompleted ? "currentColor" : "var(--color-cell-empty)",
          color: isCompleted ? "var(--color-cell-done)" : "transparent",
          boxShadow: isCompleted ? "var(--shadow-led-on)" : "var(--shadow-led-off)",
          border: isCompleted ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
        }}
      />

      <div className="hidden group-hover/cell:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
        <div className="bg-[var(--color-card)] text-[var(--color-ink)] text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-lg whitespace-nowrap shadow-[var(--shadow-raised)] border border-[var(--color-divider)]">
          {display}
        </div>
      </div>
    </div>
  );
});
