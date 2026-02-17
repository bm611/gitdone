export function HabitGridSkeleton() {
  return (
    <div className="grid grid-cols-6 gap-3" role="status" aria-label="Loading habit data">
      {Array.from({ length: 6 }, (_, monthIdx) => (
        <div key={monthIdx} className="flex flex-col gap-1">
          <div className="h-4 w-16 bg-[var(--color-cell-empty)] rounded animate-pulse opacity-50 mb-0.5" />
          <div className="flex flex-col gap-[2px]">
            {Array.from({ length: 5 }, (_, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-7 gap-[2px]">
                {Array.from({ length: 7 }, (_, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="aspect-square rounded-[3px] bg-[var(--color-cell-empty)] animate-pulse opacity-50"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
