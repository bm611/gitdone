export function HabitGridSkeleton() {
  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex gap-[2px]" role="status" aria-label="Loading habit data">
        {Array.from({ length: 20 }, (_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-[2px]">
            {Array.from({ length: 7 }, (_, dayIdx) => (
              <div
                key={dayIdx}
                className="size-[10px] rounded-full bg-[var(--color-cream-dark)] animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div
        className="sm:hidden grid grid-cols-7 gap-[2px] w-max mx-auto"
        role="status"
        aria-label="Loading habit data"
      >
        {Array.from({ length: 7 * 12 }, (_, i) => (
          <div
            key={i}
            className="size-[10px] rounded-full bg-[var(--color-cream-dark)] animate-pulse"
          />
        ))}
      </div>
    </>
  );
}
