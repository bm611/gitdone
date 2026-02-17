import { useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import { HabitCard } from "./components/HabitCard";
import { GuestHabitCard, type GuestHabit } from "./components/GuestHabitCard";
import { HabitForm } from "./components/HabitForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { UserMenu } from "./components/UserMenu";
import { SignIn } from "./components/SignIn";

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
    <div className="min-h-dvh bg-[var(--color-cream)] text-[var(--color-ink)] font-body">
      <header className="border-b border-[var(--color-divider)]">
        <div className="mx-auto max-w-3xl px-6 py-8 flex items-end justify-between">
          <div>
            <h1 className="luxury-heading text-4xl sm:text-5xl tracking-tight">
              Git<em className="luxury-heading-italic">Done</em>
            </h1>
            <p className="luxury-subheading mt-2">Daily Rituals</p>
          </div>
          {isAuthenticated ? (
            <UserMenu />
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6">
        {!isAuthenticated && (
          <div className="py-16 flex justify-center">
            <SignIn />
          </div>
        )}

        {isAuthenticated && (
          <section className="py-12">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="luxury-subheading">
                  {habits?.length ?? 0} {(habits?.length ?? 0) === 1 ? "Ritual" : "Rituals"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingHabit(null);
                  setShowForm(true);
                }}
                className="luxury-btn"
              >
                New Ritual
              </button>
            </div>

            {showAuthLoading ? (
              <div className="space-y-8">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="luxury-card p-8 animate-pulse">
                    <div className="h-5 w-32 bg-[var(--color-cream-dark)] mb-4" />
                    <div className="h-[80px] bg-[var(--color-cream-dark)]" />
                  </div>
                ))}
              </div>
            ) : !hasHabits ? (
              <div className="text-center py-24">
                <p className="luxury-heading-italic text-3xl text-[var(--color-ink-muted)] mb-2">
                  Nothing yet
                </p>
                <p className="text-sm text-[var(--color-ink-muted)] mb-8 font-body">
                  Begin by creating your first daily ritual.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="luxury-btn"
                >
                  Create Ritual
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {habits?.map((habit) => (
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
                ))}
              </div>
            )}
          </section>
        )}

        {!isAuthenticated && hasHabits && (
          <section className="py-12">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="luxury-subheading">
                  {sortedGuestHabits.length} {sortedGuestHabits.length === 1 ? "Ritual" : "Rituals"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingHabit(null);
                  setShowForm(true);
                }}
                className="luxury-btn"
              >
                New Ritual
              </button>
            </div>
            <div className="space-y-8">
              {sortedGuestHabits.map((habit) => (
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
          </section>
        )}
      </main>

      <footer className="border-t border-[var(--color-divider)] mt-16">
        <div className="mx-auto max-w-3xl px-6 py-8 text-center">
          <p className="luxury-subheading">GitDone</p>
        </div>
      </footer>

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
          description="This ritual and all its history will be permanently removed."
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
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-cream)]">
        <div className="text-center">
          <h1 className="luxury-heading-italic text-3xl text-[var(--color-ink-muted)]">
            GitDone
          </h1>
          <div className="mt-4 w-12 h-[1px] bg-[var(--color-gold)] mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return <Dashboard isAuthenticated={isAuthenticated} />;
}
