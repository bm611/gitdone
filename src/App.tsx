import { useMemo, useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import { HabitCard } from "./components/HabitCard";
import { GuestHabitCard, type GuestHabit } from "./components/GuestHabitCard";
import { HabitForm } from "./components/HabitForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { UserMenu } from "./components/UserMenu";

const GUEST_HABITS_STORAGE_KEY = "gitdone.guest.habits.v1";

type HabitDraft = { name: string; color: string };

type EditingHabitState =
  | { type: "remote"; habit: Doc<"habits"> }
  | { type: "guest"; habit: GuestHabit }
  | null;

type DeletingHabitState =
  | { type: "remote"; habit: Doc<"habits"> }
  | { type: "guest"; habit: GuestHabit }
  | null;

function readGuestHabits() {
  if (typeof window === "undefined") return [] as GuestHabit[];
  try {
    const raw = window.localStorage.getItem(GUEST_HABITS_STORAGE_KEY);
    if (!raw) return [] as GuestHabit[];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [] as GuestHabit[];

    return parsed
      .filter((habit): habit is GuestHabit => {
        return (
          typeof habit === "object" &&
          habit !== null &&
          typeof (habit as GuestHabit).id === "string" &&
          typeof (habit as GuestHabit).name === "string" &&
          typeof (habit as GuestHabit).color === "string" &&
          typeof (habit as GuestHabit).createdAt === "number" &&
          Array.isArray((habit as GuestHabit).completions)
        );
      })
      .map((habit) => ({
        ...habit,
        completions: habit.completions.filter((value) => typeof value === "string"),
      }));
  } catch {
    return [] as GuestHabit[];
  }
}

function writeGuestHabits(habits: GuestHabit[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_HABITS_STORAGE_KEY, JSON.stringify(habits));
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

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleSaveGuestHabits = (updater: (current: GuestHabit[]) => GuestHabit[]) => {
    setGuestHabits((current) => {
      const next = updater(current);
      writeGuestHabits(next);
      return next;
    });
  };

  const handleSubmitHabit = async (values: HabitDraft) => {
    if (isAuthenticated) {
      if (editingHabit?.type === "remote") {
        await updateHabit({
          id: editingHabit.habit._id,
          name: values.name,
          color: values.color,
        });
      } else {
        await createHabit(values);
      }
      return;
    }

    handleSaveGuestHabits((current) => {
      if (editingHabit?.type === "guest") {
        return current.map((habit) =>
          habit.id === editingHabit.habit.id
            ? { ...habit, name: values.name, color: values.color }
            : habit,
        );
      }

      return [
        {
          id: createGuestHabitId(),
          name: values.name,
          color: values.color,
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
    ? { name: editingHabit.habit.name, color: editingHabit.habit.color }
    : null;

  const sortedGuestHabits = useMemo(
    () => [...guestHabits].sort((a, b) => b.createdAt - a.createdAt),
    [guestHabits],
  );

  const showAuthLoading = isAuthenticated && habits === undefined;
  const hasHabits = isAuthenticated
    ? (habits?.length ?? 0) > 0
    : sortedGuestHabits.length > 0;

  return (
    <div className="min-h-dvh bg-[var(--app-bg)] text-slate-900">
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Daily Momentum
            </p>
            <h1 className="mt-1 text-2xl font-pixel text-slate-900">GitDone</h1>
          </div>

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="redirect" forceRedirectUrl="/">
                <button
                  type="button"
                  className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="redirect" forceRedirectUrl="/">
                <button
                  type="button"
                  className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Create account
                </button>
              </SignUpButton>
            </div>
          )}
        </header>

        <section
          id="habits"
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Habit Board</h2>
              <p className="mt-1 text-sm text-slate-600">
                {isAuthenticated
                  ? "Your habits are synced to your account."
                  : "Guest mode is active. Login to save habits permanently."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingHabit(null);
                setShowForm(true);
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <svg
                className="size-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M8 3v10M3 8h10" />
              </svg>
              New Habit
            </button>
          </div>

          {showAuthLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 w-28 rounded bg-slate-200 animate-pulse" />
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="h-[94px] rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasHabits ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="size-6 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                No habits yet
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-600">
                Add your first habit and start building momentum.
                {!isAuthenticated && " Login to save habits permanently."}
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M8 3v10M3 8h10" />
                </svg>
                New Habit
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {isAuthenticated
                ? habits?.map((habit) => (
                    <HabitCard
                      key={habit._id}
                      habit={habit}
                      onEdit={(current) => {
                        setEditingHabit({ type: "remote", habit: current });
                        setShowForm(true);
                      }}
                      onDelete={(current) =>
                        setDeletingHabit({ type: "remote", habit: current })
                      }
                    />
                  ))
                : sortedGuestHabits.map((habit) => (
                    <GuestHabitCard
                      key={habit.id}
                      habit={habit}
                      onEdit={(current) => {
                        setEditingHabit({ type: "guest", habit: current });
                        setShowForm(true);
                      }}
                      onDelete={(current) =>
                        setDeletingHabit({ type: "guest", habit: current })
                      }
                      onToggleDate={handleToggleGuestCompletion}
                    />
                  ))}
            </div>
          )}
        </section>
      </main>

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
          title={`Delete "${deletingHabit.habit.name}"?`}
          description="This will permanently remove the habit and all its completion data."
          confirmLabel="Delete"
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
      <div className="min-h-dvh flex items-center justify-center bg-[var(--app-bg)]">
        <div className="size-7 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  return <Dashboard isAuthenticated={isAuthenticated} />;
}
