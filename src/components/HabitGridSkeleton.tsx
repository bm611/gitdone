export function HabitGridSkeleton() {
  return (
    <div className="flex gap-[3px]" role="status" aria-label="Loading habit data">
      {Array.from({ length: 20 }, (_, weekIdx) => (
        <div key={weekIdx} className="flex flex-col gap-[3px]">
          {Array.from({ length: 7 }, (_, dayIdx) => (
            <div
              key={dayIdx}
              className="size-[10px] rounded-sm bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
