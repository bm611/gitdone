import { useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import { HabitCard } from "./components/HabitCard";
import { HabitForm } from "./components/HabitForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
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

const GUEST_HABITS_STORAGE_KEY = "gitdone.guest.habits.v1";

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
          <span className="text-lg font-pixel">GitDone</span>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => { setEditingHabit(null); setShowForm(true); }}
                  className="habit-btn-create"
                >
                  + create
                </button>
                <UserMenu />
              </>
            ) : (
              <SignInButton mode="redirect" forceRedirectUrl="/">
                <button type="button" className="luxury-btn-filled">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Sign in (unauthenticated) */}
        {!isAuthenticated && (
          <div className="py-8 flex justify-center">
            <SignIn />
          </div>
        )}

        {/* Authenticated habit list */}
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

        {/* Guest habit list */}
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
