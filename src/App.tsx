import { useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import { HabitCard } from "./components/HabitCard";
import { HabitForm } from "./components/HabitForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { StatsPage } from "./components/StatsPage";
import { UserMenu } from "./components/UserMenu";
import { SignInButton } from "@clerk/clerk-react";
import { SignIn } from "./components/SignIn";

interface GuestHabit {
  id: string;
  name: string;
  color: string;
  category?: string;
  createdAt: number;
  completions: string[];
}

type HabitDraft = { name: string; color: string; category?: string };

type EditingHabitState =
  | { type: "remote"; habit: Doc<"habits"> }
  | { type: "guest"; habit: GuestHabit }
  | null;

type DeletingHabitState =
  | { type: "remote"; habit: Doc<"habits"> }
  | { type: "guest"; habit: GuestHabit }
  | null;

function readGuestHabits() {
  return [] as GuestHabit[];
}

function createGuestHabitId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function Dashboard({ isAuthenticated }: { isAuthenticated: boolean }) {
  const habits = useQuery(api.habits.list);
  const createHabit = useMutation(api.habits.create);
  const updateHabit = useMutation(api.habits.update);
  const removeHabit = useMutation(api.habits.remove);

  const [guestHabits, setGuestHabits] = useState<GuestHabit[]>(() => readGuestHabits());
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<EditingHabitState>(null);
  const [deletingHabit, setDeletingHabit] = useState<DeletingHabitState>(null);
  const [view, setView] = useState<"dashboard" | "stats">("dashboard");

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleSaveGuestHabits = (updater: (current: GuestHabit[]) => GuestHabit[]) => {
    setGuestHabits((current) => {
      const next = updater(current);
      // Demo mode: no persistence
      return next;
    });
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

    handleSaveGuestHabits((current) => {
      if (editingHabit?.type === "guest") {
        return current.map((habit) =>
          habit.id === editingHabit.habit.id
            ? { ...habit, name: values.name, color: values.color, category }
            : habit,
        );
      }

      return [
        {
          id: createGuestHabitId(),
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
    handleSaveGuestHabits((current) =>
      current.map((habit) => {
        if (habit.id !== habitId) return habit;
        const isCompleted = habit.completions.includes(date);
        return {
          ...habit,
          completions: isCompleted
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

    handleSaveGuestHabits((current) =>
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
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer bg-transparent border-none p-0"
              aria-label="Stats"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>
            <a
              href="https://github.com/bm611/gitdone"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
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
