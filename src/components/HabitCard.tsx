import { useMemo, useState, useCallback, useRef, memo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { todayString } from "../lib/dates";
import { HabitGrid } from "./HabitGrid";
import { HabitGridSkeleton } from "./HabitGridSkeleton";

interface HabitCardProps {
  name: string;
  color: string;
  onEdit: () => void;
  onDelete: () => void;
  habitId?: Id<"habits">;
  completionDates?: string[];
  onToggleDate?: (date: string) => void;
  status?: "active" | "paused" | "archived";
  onPause?: () => void;
  onResume?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

export const HabitCard = memo(function HabitCard({
  name,
  color,
  onEdit,
  onDelete,
  habitId,
  completionDates,
  onToggleDate,
  status,
  onPause,
  onResume,
  onArchive,
  onUnarchive,
}: HabitCardProps) {
  const isActive = !status || status === "active";
  const remoteCompletions = useQuery(
    api.completions.listByHabit,
    habitId ? { habitId } : "skip",
  );
  const toggle = useMutation(api.completions.toggle);

  const completedSet = useMemo(() => {
    if (completionDates) return new Set(completionDates);
    return new Set(remoteCompletions?.map((c) => c.date) ?? []);
  }, [completionDates, remoteCompletions]);

  const today = todayString();

  const [optimisticToday, setOptimisticToday] = useState<boolean | null>(null);
  const [prevRemote, setPrevRemote] = useState(remoteCompletions);
  if (remoteCompletions !== prevRemote) {
    setPrevRemote(remoteCompletions);
    if (optimisticToday !== null) {
      setOptimisticToday(null);
    }
  }

  const isDoneToday = optimisticToday ?? completedSet.has(today);

  const [glowKey, setGlowKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [monthWindow, setMonthWindow] = useState<3 | 6>(6);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback((date: string) => {
    if (habitId) {
      void toggle({ habitId, date });
    } else {
      onToggleDate?.(date);
    }
  }, [habitId, toggle, onToggleDate]);

  const handleToggleToday = () => {
    const newState = !isDoneToday;
    setOptimisticToday(newState);
    if (newState) setGlowKey((k) => k + 1);
    handleToggle(today);
  };

  const resolvedDates = useMemo(
    () => (completionDates ?? remoteCompletions?.map((c) => c.date) ?? []),
    [completionDates, remoteCompletions],
  );

  return (
    <div className={`habit-card ${menuOpen ? "z-50 relative" : ""}`} style={status === "archived" ? { opacity: 0.6 } : undefined}>
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4">
        <h3
          className="text-xl sm:text-2xl font-semibold tracking-tight bg-clip-text text-transparent min-w-0 truncate"
          style={{
            backgroundImage: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, #000))`,
          }}
        >
          {name}
        </h3>
        {status === "paused" && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
            Paused
          </span>
        )}
        {status === "archived" && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-500 border border-gray-300 shrink-0">
            Archived
          </span>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMonthWindow((w) => (w === 6 ? 3 : 6))}
            className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold cursor-pointer transition-[box-shadow,transform] duration-150"
            style={{
              backgroundColor: "var(--color-pill-bg)",
              color: "var(--color-pill-text)",
              boxShadow: "var(--shadow-raised)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
            aria-label={`Show ${monthWindow === 6 ? 3 : 6} months`}
          >
            {monthWindow === 6 ? "6M" : "3M"}
          </button>
          {isActive && (
            <button
              key={glowKey}
              type="button"
              onClick={handleToggleToday}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold cursor-pointer transition-[background-color,color,box-shadow,transform] duration-150"
              style={{
                backgroundColor: isDoneToday ? color : "var(--color-pill-bg)",
                color: isDoneToday ? "#ffffff" : "var(--color-pill-text)",
                boxShadow: isDoneToday ? "var(--shadow-pressed)" : "var(--shadow-raised)",
                transform: isDoneToday ? "translateY(2px)" : "translateY(0)",
                border: isDoneToday ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(255,255,255,0.3)",
                textShadow: isDoneToday ? "1px 1px 0px rgba(0,0,0,0.2)" : "none",
              }}
              aria-label={isDoneToday ? "Unmark today" : "Mark today as done"}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isDoneToday ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </>
                )}
              </svg>
              <span>{isDoneToday ? "Done" : "Today"}</span>
            </button>
          )}

          {/* Overflow menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More actions"
              className="habit-icon-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-100" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-110 min-w-[140px] bg-card border border-divider rounded-xl shadow-raised py-1 animate-in fade-in zoom-in-95 duration-150">
                  {isActive && (
                    <button type="button" onClick={() => { setMenuOpen(false); onEdit(); }} className="habit-menu-item">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Edit
                    </button>
                  )}
                  {isActive && onPause && (
                    <button type="button" onClick={() => { setMenuOpen(false); onPause(); }} className="habit-menu-item">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="10" y1="4" x2="10" y2="20" />
                        <line x1="14" y1="4" x2="14" y2="20" />
                      </svg>
                      Pause
                    </button>
                  )}
                  {status === "paused" && onResume && (
                    <button type="button" onClick={() => { setMenuOpen(false); onResume(); }} className="habit-menu-item">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Resume
                    </button>
                  )}
                  {status !== "archived" && onArchive && (
                    <button type="button" onClick={() => { setMenuOpen(false); onArchive(); }} className="habit-menu-item">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="21 8 21 21 3 21 3 8" />
                        <rect x="1" y="3" width="22" height="5" />
                        <line x1="10" y1="12" x2="14" y2="12" />
                      </svg>
                      Archive
                    </button>
                  )}
                  {status === "archived" && onUnarchive && (
                    <button type="button" onClick={() => { setMenuOpen(false); onUnarchive(); }} className="habit-menu-item">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="21 8 21 21 3 21 3 8" />
                        <rect x="1" y="3" width="22" height="5" />
                        <line x1="12" y1="10" x2="12" y2="17" />
                        <polyline points="9 13 12 10 15 13" />
                      </svg>
                      Unarchive
                    </button>
                  )}
                  <div className="h-px bg-divider my-1" />
                  <button type="button" onClick={() => { setMenuOpen(false); onDelete(); }} className="habit-menu-item text-red-500">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {habitId && !remoteCompletions ? (
        <HabitGridSkeleton />
      ) : (
        <HabitGrid
          completionDates={resolvedDates}
          onToggleDate={isActive ? handleToggle : undefined}
          monthWindow={monthWindow}
        />
      )}
    </div>
  );
});
