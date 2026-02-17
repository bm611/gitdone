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
  color?: string;
  date: string;
  onClick: () => void;
}

export function GridCell({ isCompleted, date, onClick }: GridCellProps) {
  const display = formatDisplayDate(date);

  return (
    <div className="relative group/cell leading-none">
      <button
        type="button"
        aria-label={`${display}${isCompleted ? ", completed" : ""}`}
        onClick={onClick}
        title={display}
        className="block w-full aspect-square p-0 m-0 cursor-pointer rounded-[3px] border-none transition-colors duration-100 hover:opacity-80"
        style={{
          backgroundColor: isCompleted ? "var(--color-cell-done)" : "var(--color-cell-empty)",
        }}
      />

      <div className="hidden group-hover/cell:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
        <div className="bg-[var(--color-ink)] text-white text-[9px] font-body tracking-wide px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
          {display}
        </div>
      </div>
    </div>
  );
}
