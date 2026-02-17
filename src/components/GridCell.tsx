import { cn } from "../lib/cn";

interface GridCellProps {
  isCompleted: boolean;
  color: string;
  date: string;
  onClick: () => void;
}

export function GridCell({ isCompleted, color, date, onClick }: GridCellProps) {
  return (
    <button
      type="button"
      aria-label={`${date}${isCompleted ? ", completed" : ""}`}
      className={cn(
        "size-[10px] rounded-sm cursor-pointer transition-transform duration-150 hover:scale-110",
        !isCompleted && "bg-gray-100 hover:bg-gray-200",
      )}
      style={isCompleted ? { backgroundColor: color } : undefined}
      title={date}
      onClick={onClick}
    />
  );
}
