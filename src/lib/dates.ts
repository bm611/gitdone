export interface DayCell {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sun, 6=Sat
  weekIndex: number;
  month: number;
}

export function generateCalendarMonthsGrid(
  monthCount: number,
  endDate: Date = new Date(),
): DayCell[] {
  if (monthCount < 1) return [];

  const cells: DayCell[] = [];
  const today = new Date(endDate);
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(
    today.getFullYear(),
    today.getMonth() - (monthCount - 1),
    1,
  );
  startDate.setHours(0, 0, 0, 0);

  let weekIndex = 0;
  const current = new Date(startDate);

  while (current <= today) {
    const dayOfWeek = current.getDay();
    if (current > startDate && dayOfWeek === 0) {
      weekIndex++;
    }

    cells.push({
      date: formatDate(current),
      dayOfWeek,
      weekIndex,
      month: current.getMonth(),
    });

    current.setDate(current.getDate() + 1);
  }

  return cells;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthLabels(cells: DayCell[]): { label: string; weekIndex: number }[] {
  if (cells.length === 0) return [];

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const labels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  for (const cell of cells) {
    if (cell.month !== lastMonth && cell.dayOfWeek === 0) {
      labels.push({ label: months[cell.month], weekIndex: cell.weekIndex });
      lastMonth = cell.month;
    }
  }

  if (labels.length === 0 || labels[0].weekIndex !== 0) {
    labels.unshift({ label: months[cells[0].month], weekIndex: 0 });
  }

  return labels;
}

export function todayString(): string {
  return formatDate(new Date());
}
