import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { todayString, formatDate } from "../lib/dates";

interface GuestHabit {
  id: string;
  name: string;
  color: string;
  category?: string;
  createdAt: number;
  completions: string[];
}

interface StatsPageProps {
  isAuthenticated: boolean;
  guestHabits: GuestHabit[];
  onBack: () => void;
}

interface HabitStats {
  name: string;
  color: string;
  category?: string;
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  last30: number;
  last7: number;
  completionRate: number;
}

function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

function calcStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };
  const sorted = [...dates].sort();
  const today = todayString();

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Current streak: count backwards from today/yesterday
  let current = 0;
  const dateSet = new Set(sorted);
  const check = new Date(today);
  if (!dateSet.has(formatDate(check))) {
    check.setDate(check.getDate() - 1);
  }
  while (dateSet.has(formatDate(check))) {
    current++;
    check.setDate(check.getDate() - 1);
  }

  return { current, longest };
}

function computeHabitStats(
  name: string,
  color: string,
  category: string | undefined,
  completionDates: string[],
  createdAt: number,
): HabitStats {
  const { current, longest } = calcStreak(completionDates);
  const last30Cutoff = getDaysAgo(30);
  const last7Cutoff = getDaysAgo(7);
  const last30 = completionDates.filter((d) => d >= last30Cutoff).length;
  const last7 = completionDates.filter((d) => d >= last7Cutoff).length;

  const daysSinceCreated = Math.max(
    1,
    Math.ceil((Date.now() - createdAt) / 86400000),
  );
  const completionRate = Math.min(
    100,
    Math.round((completionDates.length / daysSinceCreated) * 100),
  );

  return {
    name,
    color,
    category,
    totalDays: completionDates.length,
    currentStreak: current,
    longestStreak: longest,
    last30,
    last7,
    completionRate,
  };
}

function BarChart({
  data,
  maxVal,
  color,
}: {
  data: { label: string; value: number }[];
  maxVal: number;
  color: string;
}) {
  return (
    <div className="flex items-end gap-[3px] h-20">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div className="hidden group-hover:block absolute bottom-full mb-2 z-10">
            <div className="bg-[var(--color-ink)] text-white text-[9px] font-body px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
              {d.label}: {d.value}
            </div>
          </div>
          <div
            className="w-full rounded-t-[3px] transition-all duration-300 min-h-[2px]"
            style={{
              height: maxVal > 0 ? `${Math.max(3, (d.value / maxVal) * 100)}%` : "3%",
              backgroundColor: d.value > 0 ? color : "var(--color-cell-empty)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function StatNumber({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-2xl font-bold tabular-nums"
        style={color ? { color } : undefined}
      >
        {value}
      </span>
      <span className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function HabitStatsCard({ stats }: { stats: HabitStats }) {
  return (
    <div className="habit-card">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: stats.color }}
        />
        <h3 className="text-base font-semibold truncate">{stats.name}</h3>
        {stats.category && (
          <span className="habit-pill text-[10px]">{stats.category}</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatNumber label="Total" value={stats.totalDays} color={stats.color} />
        <StatNumber label="Streak" value={stats.currentStreak} />
        <StatNumber label="Best" value={stats.longestStreak} />
        <StatNumber label="Rate" value={`${stats.completionRate}%`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3">
          <span className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">Last 7 days</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold tabular-nums" style={{ color: stats.color }}>{stats.last7}</span>
            <span className="text-xs text-[var(--color-ink-muted)]">/ 7</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--color-cell-empty)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(stats.last7 / 7) * 100}%`,
                backgroundColor: stats.color,
              }}
            />
          </div>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3">
          <span className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">Last 30 days</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold tabular-nums" style={{ color: stats.color }}>{stats.last30}</span>
            <span className="text-xs text-[var(--color-ink-muted)]">/ 30</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--color-cell-empty)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(stats.last30 / 30) * 100}%`,
                backgroundColor: stats.color,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OverallCard({
  allStats,
  allCompletions,
}: {
  allStats: HabitStats[];
  allCompletions: string[];
}) {
  const totalCompletions = allStats.reduce((s, h) => s + h.totalDays, 0);
  const totalHabits = allStats.length;
  const bestStreak = Math.max(0, ...allStats.map((h) => h.longestStreak));
  const avgRate = totalHabits > 0
    ? Math.round(allStats.reduce((s, h) => s + h.completionRate, 0) / totalHabits)
    : 0;

  // Activity heatmap: last 30 days — how many habits completed each day
  const dailyActivity = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of allCompletions) {
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const days: { label: string; value: number }[] = [];
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 29; i >= 0; i--) {
      const date = getDaysAgo(i);
      const d = new Date(date);
      const label = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
      days.push({ label, value: counts.get(date) ?? 0 });
    }
    return days;
  }, [allCompletions]);

  const maxDaily = Math.max(1, ...dailyActivity.map((d) => d.value));

  // Most active day of week
  const dayOfWeekCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const d of allCompletions) {
      const date = new Date(d);
      counts[date.getDay()]++;
    }
    return counts;
  }, [allCompletions]);

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const mostActiveDay = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
  const maxDow = Math.max(1, ...dayOfWeekCounts);

  return (
    <div className="habit-card space-y-6">
      <h3 className="text-base font-semibold">Overall Stats</h3>

      <div className="grid grid-cols-4 gap-4">
        <StatNumber label="Habits" value={totalHabits} color="#818cf8" />
        <StatNumber label="Completions" value={totalCompletions} color="#4ade80" />
        <StatNumber label="Best Streak" value={bestStreak} color="#f59e0b" />
        <StatNumber label="Avg Rate" value={`${avgRate}%`} color="#38bdf8" />
      </div>

      {/* 30-day activity chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
            Daily activity — last 30 days
          </span>
        </div>
        <BarChart data={dailyActivity} maxVal={maxDaily} color="#4ade80" />
      </div>

      {/* Day of week breakdown */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
            By day of week
          </span>
          {totalCompletions > 0 && (
            <span className="text-[10px] text-[var(--color-ink-faint)]">
              Most active: {DAYS[mostActiveDay]}
            </span>
          )}
        </div>
        <div className="flex items-end gap-2 h-16">
          {dayOfWeekCounts.map((count, i) => (
            <div key={DAYS[i]} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-[3px] transition-all duration-300 min-h-[2px]"
                style={{
                  height: maxDow > 0 ? `${Math.max(5, (count / maxDow) * 100)}%` : "5%",
                  backgroundColor: count > 0 ? "#818cf8" : "var(--color-cell-empty)",
                }}
              />
              <span className="text-[9px] text-[var(--color-ink-faint)]">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsPage({ isAuthenticated, guestHabits, onBack }: StatsPageProps) {
  const habits = useQuery(api.habits.list);
  const allCompletionsRaw = useQuery(
    api.completions.listAll,
    isAuthenticated ? {} : "skip",
  );

  const remoteStats = useMemo(() => {
    if (!habits || !allCompletionsRaw) return null;

    const byHabit = new Map<string, string[]>();
    for (const c of allCompletionsRaw) {
      const list = byHabit.get(c.habitId) ?? [];
      list.push(c.date);
      byHabit.set(c.habitId, list);
    }

    return habits.map((h) =>
      computeHabitStats(
        h.name,
        h.color,
        h.category,
        byHabit.get(h._id) ?? [],
        h.createdAt,
      ),
    );
  }, [habits, allCompletionsRaw]);

  const guestStats = useMemo(() => {
    return guestHabits.map((h) =>
      computeHabitStats(h.name, h.color, h.category, h.completions, h.createdAt),
    );
  }, [guestHabits]);

  const stats = isAuthenticated ? remoteStats : guestStats;
  const allCompletionDates = useMemo(() => {
    if (isAuthenticated) {
      return allCompletionsRaw?.map((c) => c.date) ?? [];
    }
    return guestHabits.flatMap((h) => h.completions);
  }, [isAuthenticated, allCompletionsRaw, guestHabits]);

  const loading = isAuthenticated && (!habits || !allCompletionsRaw);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="luxury-btn-ghost flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="habit-card animate-pulse">
              <div className="h-5 w-32 bg-[var(--color-divider)] rounded mb-4" />
              <div className="h-20 bg-[var(--color-divider)] rounded" />
            </div>
          ))}
        </div>
      ) : stats && stats.length > 0 ? (
        <>
          <OverallCard allStats={stats} allCompletions={allCompletionDates} />
          {stats.map((s) => (
            <HabitStatsCard key={s.name + s.color} stats={s} />
          ))}
        </>
      ) : (
        <div className="habit-card text-center py-12">
          <p className="text-sm text-[var(--color-ink-muted)]">
            No habits to show stats for yet.
          </p>
        </div>
      )}
    </div>
  );
}
