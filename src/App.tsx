import { useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import type { GuestHabit } from "./lib/types";
import { HabitCard } from "./components/HabitCard";
import { HabitForm } from "./components/HabitForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { StatsPage } from "./components/StatsPage";
import { UserMenu } from "./components/UserMenu";
import { SignInButton } from "@clerk/clerk-react";
import { SignIn } from "./components/SignIn";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnalyticsIcon, GithubIcon } from "@hugeicons/core-free-icons";
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

  const [guestHabits, setGuestHabits] = useState<GuestHabit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<EditingHabitState>(null);
  const [deletingHabit, setDeletingHabit] = useState<DeletingHabitState>(null);
  const [view, setView] = useState<"dashboard" | "stats">("dashboard");
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

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-ink)] font-body">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {/* Header bar */}
        <div className="habit-header-bar">
          <div className="flex flex-col">
            <span className="text-lg font-pixel">GitDone</span>
            <span className="text-xs text-[var(--color-ink-muted)]">track habits like git commits</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setView(view === "dashboard" ? "stats" : "dashboard")}
              className="inline-flex items-center text-[var(--color-ink-muted)] hover:text-[var(--color-cell-done)] transition-colors cursor-pointer bg-transparent border-none p-0"
              aria-label="Stats"
            >
              <span className="md:hidden"><HugeiconsIcon icon={AnalyticsIcon} size={18} color="currentColor" strokeWidth={1.5} /></span>
              <span className="hidden md:inline"><HugeiconsIcon icon={AnalyticsIcon} size={22} color="currentColor" strokeWidth={1.5} /></span>
            </button>
            <a
              href="https://github.com/bm611/gitdone"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[var(--color-ink-muted)] hover:text-[var(--color-cell-done)] transition-colors"
              aria-label="GitHub"
            >
              <span className="md:hidden"><HugeiconsIcon icon={GithubIcon} size={18} color="currentColor" strokeWidth={1.5} /></span>
              <span className="hidden md:inline"><HugeiconsIcon icon={GithubIcon} size={22} color="currentColor" strokeWidth={1.5} /></span>
            </a>
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <SignInButton mode="redirect" forceRedirectUrl="/">
                <button type="button" className="luxury-btn-filled">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <h2 className="text-xl font-pixel text-[var(--color-ink)]">
            Welcome, {displayName}
          </h2>
        )}

        {view === "stats" ? (
          <StatsPage
            isAuthenticated={isAuthenticated}
            guestHabits={guestHabits}
            onBack={() => setView("dashboard")}
          />
        ) : !isAuthenticated && sortedGuestHabits.length === 0 ? (
          <div className="py-12 flex justify-center animate-in fade-in duration-500">
            <SignIn onStartDemo={() => { setEditingHabit(null); setShowForm(true); }} />
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { setEditingHabit(null); setShowForm(true); }}
              className="habit-btn-create w-full mb-6"
            >
              + Create New Habit
            </button>

            {!isAuthenticated && (
              <div className="text-center mb-6 py-3 px-4 bg-[var(--color-bg-secondary)] border border-[var(--color-divider)] rounded-lg text-sm text-[var(--color-ink-muted)] flex items-center justify-center gap-2 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Demo Mode — Sign in to save your progress.</span>
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
                  <div className="space-y-4">
                    {habits?.map((habit) => (
                      <HabitCard
                        key={habit._id}
                        habitId={habit._id}
                        name={habit.name}
                        color={habit.color}
                        onEdit={() => {
                          setEditingHabit({ type: "remote", habit });
                          setShowForm(true);
                        }}
                        onDelete={() =>
                          setDeletingHabit({ type: "remote", habit })
                        }
                      />
                    ))}
                  </div>
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
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <h1 className="text-2xl font-pixel text-[var(--color-ink-muted)]">
            GitDone
          </h1>
          <div className="mt-4 w-8 h-1 bg-[var(--color-divider)] mx-auto rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return <Dashboard isAuthenticated={isAuthenticated} />;
}
