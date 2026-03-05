import { useMemo, useState, useRef } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import type { GuestHabit } from "./lib/types";
import { HabitCard } from "./components/HabitCard";
import { HabitForm } from "./components/HabitForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { StatsPage } from "./components/StatsPage";
import { UserMenu } from "./components/UserMenu";
import { SignIn, AuthForm } from "./components/SignIn";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnalyticsIcon, GithubIcon, GitMergeIcon } from "@hugeicons/core-free-icons";
import { ThemeToggle } from "./components/ThemeToggle";
import { useDisplayName } from "./lib/useDisplayName";
type HabitDraft = { name: string; color: string; category?: string };

type EditingHabitState =
  | { type: "remote"; habit: Doc<"habits"> }
  | { type: "guest"; habit: GuestHabit }
  | null;

type DeletingHabitState =
  | { type: "remote"; habit: Doc<"habits"> }
  | { type: "guest"; habit: GuestHabit }
  | null;

function Dashboard({ isAuthenticated }: { isAuthenticated: boolean }) {
  const habits = useQuery(api.habits.list, isAuthenticated ? {} : "skip");
  const createHabit = useMutation(api.habits.create);
  const updateHabit = useMutation(api.habits.update);
  const removeHabit = useMutation(api.habits.remove);
  const setHabitStatus = useMutation(api.habits.setStatus);

  const [guestHabits, setGuestHabits] = useState<GuestHabit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<EditingHabitState>(null);
  const [deletingHabit, setDeletingHabit] = useState<DeletingHabitState>(null);
  const [view, setView] = useState<"dashboard" | "stats">("dashboard");
  const [showSignIn, setShowSignIn] = useState(false);
  const [habitTab, setHabitTab] = useState<"active" | "paused" | "archived">("active");
  const displayName = useDisplayName();

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleSubmitHabit = async (values: HabitDraft) => {
    const category = values.category || undefined;
    if (isAuthenticated) {
      if (editingHabit?.type === "remote") {
        await updateHabit({
          id: editingHabit.habit._id,
          name: values.name,
          color: values.color,
          category,
        });
      } else {
        await createHabit({ name: values.name, color: values.color, category });
      }
      return;
    }

    setGuestHabits((current) => {
      if (editingHabit?.type === "guest") {
        return current.map((habit) =>
          habit.id === editingHabit.habit.id
            ? { ...habit, name: values.name, color: values.color, category }
            : habit,
        );
      }

      return [
        {
          id: crypto.randomUUID(),
          name: values.name,
          color: values.color,
          category,
          createdAt: Date.now(),
          completions: [],
        },
        ...current,
      ];
    });
  };

  const handleToggleGuestCompletion = (habitId: string, date: string) => {
    setGuestHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId) return habit;
        const has = habit.completions.includes(date);
        return {
          ...habit,
          completions: has
            ? habit.completions.filter((entry) => entry !== date)
            : [...habit.completions, date],
        };
      }),
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingHabit) return;
    if (deletingHabit.type === "remote") {
      void removeHabit({ id: deletingHabit.habit._id });
      setDeletingHabit(null);
      return;
    }

    setGuestHabits((current) =>
      current.filter((habit) => habit.id !== deletingHabit.habit.id),
    );
    setDeletingHabit(null);
  };

  const formValues = editingHabit
    ? { name: editingHabit.habit.name, color: editingHabit.habit.color, category: editingHabit.habit.category }
    : null;

  const sortedGuestHabits = useMemo(
    () => [...guestHabits].sort((a, b) => b.createdAt - a.createdAt),
    [guestHabits],
  );

  const showAuthLoading = isAuthenticated && habits === undefined;

  const filteredHabits = useMemo(() => {
    if (!habits) return [];
    return habits.filter((h) => {
      const s = h.status ?? "active";
      return s === habitTab;
    });
  }, [habits, habitTab]);

  const tabCounts = useMemo(() => {
    if (!habits) return { active: 0, paused: 0, archived: 0 };
    const counts = { active: 0, paused: 0, archived: 0 };
    for (const h of habits) {
      const s = (h.status ?? "active") as keyof typeof counts;
      if (s in counts) counts[s]++;
    }
    return counts;
  }, [habits]);

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-ink)] font-body">
      <div className="mx-auto max-w-3xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 md:space-y-6">
        {/* Header bar */}
        <div className="habit-header-bar">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-bg)] rounded-xl shadow-[var(--shadow-pressed)] text-[var(--color-cell-done)] animated-icon-bounce">
              <HugeiconsIcon icon={GitMergeIcon} className="w-5 h-5 md:w-6 md:h-6" color="currentColor" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-pixel text-[var(--color-ink)] drop-shadow-sm">GitDone</span>
              <span className="text-[10px] md:text-xs font-bold text-[var(--color-ink-muted)]">track habits like git commits</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setView(view === "dashboard" ? "stats" : "dashboard")}
              className="inline-flex items-center text-[var(--color-ink-muted)] hover:text-[var(--color-cell-done)] transition-colors cursor-pointer bg-transparent border-none p-0 animated-icon-bounce"
              aria-label="Stats"
            >
              <HugeiconsIcon icon={AnalyticsIcon} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" color="currentColor" strokeWidth={1.5} />
            </button>
            <a
              href="https://github.com/bm611/gitdone"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors animated-icon-spin"
              aria-label="GitHub"
            >
              <HugeiconsIcon icon={GithubIcon} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" color="currentColor" strokeWidth={1.5} />
            </a>
            <ThemeToggle />
            {isAuthenticated ? <UserMenu /> : sortedGuestHabits.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSignIn(true)}
                className="luxury-btn-ghost px-3 py-1.5 text-xs font-bold"
              >
                Sign In / Up
              </button>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl md:text-2xl font-pixel text-[var(--color-ink)]">
              Welcome, {displayName}
            </h2>
            {view === "dashboard" && (
              <button
                type="button"
                onClick={() => { setEditingHabit(null); setShowForm(true); }}
                className="habit-btn-create w-full sm:w-auto"
              >
                Create Habit
              </button>
            )}
          </div>
        )}

        {view === "stats" ? (
          <StatsPage
            isAuthenticated={isAuthenticated}
            guestHabits={guestHabits}
            onBack={() => setView("dashboard")}
          />
        ) : !isAuthenticated && sortedGuestHabits.length === 0 ? (
          <div className="py-12 flex justify-center animate-in fade-in duration-500">
            <SignIn onStartDemo={() => { setEditingHabit(null); setShowForm(true); }} onSignIn={() => setShowSignIn(true)} />
          </div>
        ) : (
          <>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => { setEditingHabit(null); setShowForm(true); }}
                className="habit-btn-create w-full mb-6"
              >
                + Create Habit
              </button>
            )}

            {!isAuthenticated && (
              <div className="text-center mb-6 py-3 px-4 bg-[var(--color-card)] border border-[var(--color-divider)] rounded-lg text-sm text-[var(--color-ink-muted)] flex items-center justify-center gap-2 shadow-[var(--shadow-pressed)] animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <span className="font-semibold text-[var(--color-ink)]">Demo Mode</span> — Sign in to save your progress.
              </div>
            )}

            {isAuthenticated && (
              <>
                {showAuthLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="habit-card animate-pulse">
                        <div className="h-5 w-32 bg-[var(--color-divider)] rounded mb-4" />
                        <div className="h-[80px] bg-[var(--color-divider)] rounded" />
                      </div>
                    ))}
                  </div>
                ) : habits?.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <p className="text-sm text-[var(--color-ink-muted)]">No habits yet — create your first commit.</p>
                  </div>
                ) : (
                  <>
                    {/* Tab bar */}
                    {(tabCounts.paused > 0 || tabCounts.archived > 0) && (
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-bg)] border border-[var(--color-divider)] shadow-[var(--shadow-pressed)] mb-2">
                        {(["active", "paused", "archived"] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setHabitTab(tab)}
                            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer border-none"
                            style={{
                              background: habitTab === tab ? "var(--color-card)" : "transparent",
                              color: habitTab === tab ? "var(--color-ink)" : "var(--color-ink-muted)",
                              boxShadow: habitTab === tab ? "var(--shadow-raised)" : "none",
                            }}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tabCounts[tab] > 0 && (
                              <span className="ml-1.5 text-[10px] opacity-60">{tabCounts[tab]}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredHabits.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-12 text-center">
                        <p className="text-sm text-[var(--color-ink-muted)]">
                          {habitTab === "active" && "No active habits."}
                          {habitTab === "paused" && "No paused habits."}
                          {habitTab === "archived" && "No archived habits."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredHabits.map((habit) => (
                          <HabitCard
                            key={habit._id}
                            habitId={habit._id}
                            name={habit.name}
                            color={habit.color}
                            status={(habit.status as "active" | "paused" | "archived" | undefined) ?? "active"}
                            onEdit={() => {
                              setEditingHabit({ type: "remote", habit });
                              setShowForm(true);
                            }}
                            onDelete={() =>
                              setDeletingHabit({ type: "remote", habit })
                            }
                            onPause={() => void setHabitStatus({ id: habit._id, status: "paused" })}
                            onResume={() => { void setHabitStatus({ id: habit._id, status: "active" }); setHabitTab("active"); }}
                            onArchive={() => void setHabitStatus({ id: habit._id, status: "archived" })}
                            onUnarchive={() => { void setHabitStatus({ id: habit._id, status: "active" }); setHabitTab("active"); }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {!isAuthenticated && sortedGuestHabits.length > 0 && (
              <div className="space-y-4">
                {sortedGuestHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    name={habit.name}
                    color={habit.color}
                    completionDates={habit.completions}
                    onToggleDate={(date) => handleToggleGuestCompletion(habit.id, date)}
                    onEdit={() => {
                      setEditingHabit({ type: "guest", habit });
                      setShowForm(true);
                    }}
                    onDelete={() =>
                      setDeletingHabit({ type: "guest", habit })
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <HabitForm
          editingHabit={formValues}
          onSubmitHabit={handleSubmitHabit}
          guestMode={!isAuthenticated}
          onClose={handleCloseForm}
        />
      )}

      {deletingHabit && (
        <ConfirmDialog
          title={`Remove "${deletingHabit.habit.name}"?`}
          description="This habit and all its history will be permanently removed."
          confirmLabel="Remove"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingHabit(null)}
        />
      )}

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </div>
  );
}

function SignInModal({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Sign In"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] font-body"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="bg-[var(--color-card)] border border-[var(--color-divider)] w-full max-w-sm mx-4 rounded-2xl shadow-[var(--shadow-raised)] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="luxury-heading text-[var(--color-ink)] text-lg">Sign In / Sign Up</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors bg-transparent border-none cursor-pointer p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <h1 className="text-3xl font-pixel text-[var(--color-ink)] drop-shadow-[2px_2px_4px_rgba(163,177,198,0.8)]">
            GitDone
          </h1>
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-[var(--color-ink-faint)] shadow-[var(--shadow-pressed)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard isAuthenticated={isAuthenticated} />;
}
