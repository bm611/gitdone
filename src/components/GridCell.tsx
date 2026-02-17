import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/cn";

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
  color: string;
  date: string;
  onClick: () => void;
  fill?: boolean;
  tiny?: boolean;
}

export function GridCell({ isCompleted, color, date, onClick, fill, tiny }: GridCellProps) {
  const display = formatDisplayDate(date);
  const [, setShowTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePointerDown = () => {
    setShowTooltip(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowTooltip(false), 1200);
  };

  return (
    <div className="relative group/cell">
      <button
        type="button"
        aria-label={`${display}${isCompleted ? ", completed" : ""}`}
        onClick={onClick}
        onPointerDown={handlePointerDown}
        title={display}
        className={cn(
          "cursor-pointer rounded-full transition-colors duration-150 border border-[var(--color-divider)]",
          tiny ? "w-2 h-2" : fill ? "w-full h-full" : "w-2.5 h-2.5",
          !isCompleted && "hover:bg-[var(--color-ink-faint)]/35"
        )}
        style={{
          backgroundColor: isCompleted ? color : "var(--color-cream-dark)",
          borderColor: isCompleted ? "var(--color-ink-light)" : "var(--color-divider)",
        }}
      />

      <div className="hidden group-hover/cell:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
        <div className="bg-[var(--color-ink)] text-white text-[10px] font-body tracking-wide px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
          {display}
        </div>
      </div>
    </div>
  );
}
