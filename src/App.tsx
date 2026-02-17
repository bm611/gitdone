import { useMemo, useState, useRef, useEffect } from "react";
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

const PASTEL_COLORS = [
  { name: "Rose", value: "#fbb4b4" },
  { name: "Peach", value: "#fcd5b4" },
  { name: "Banana", value: "#fef3b4" },
  { name: "Mint", value: "#b4fcd5" },
  { name: "Sage", value: "#b4f0e0" },
  { name: "Sky", value: "#b4d8fc" },
  { name: "Periwinkle", value: "#b4b8fc" },
  { name: "Lavender", value: "#d5b4fc" },
  { name: "Mauve", value: "#f0b4e0" },
  { name: "Blush", value: "#fcb4d8" },
];

const DEFAULT_COLOR = PASTEL_COLORS[3].value;

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
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitColor, setNewHabitColor] = useState(DEFAULT_COLOR);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerOpen(false);
      }
    }
    if (colorPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [colorPickerOpen]);

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

  const handleInlineCreate = async () => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;
    await handleSubmitHabit({ name: trimmed, color: newHabitColor });
    setNewHabitName("");
    setNewHabitColor(DEFAULT_COLOR);
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleInlineCreate();
    }
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

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-ink)] font-body">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {/* Header bar */}
        <div className="habit-header-bar">
          <span className="text-lg font-pixel">GitDone</span>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <span className="text-sm font-medium text-[var(--color-ink-muted)]">sync</span>
          )}
        </div>

        {/* Sign in (unauthenticated) */}
        {!isAuthenticated && (
          <div className="py-8 flex justify-center">
            <SignIn />
          </div>
        )}

        {/* Inline create form */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={handleInlineKeyDown}
            placeholder="New habit name..."
            className="habit-input flex-1"
          />
          <div ref={colorPickerRef} className="relative">
            <button
              type="button"
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="w-9 h-9 rounded-xl border-2 border-[var(--color-divider)] shrink-0 cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: newHabitColor }}
              aria-label="Pick color"
              title="Pick color"
            />
            {colorPickerOpen && (
              <div className="absolute right-0 top-full mt-2 z-30 bg-white rounded-xl shadow-lg border border-[var(--color-divider)] p-2 grid grid-cols-5 gap-1.5 w-max">
                {PASTEL_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setNewHabitColor(c.value);
                      setColorPickerOpen(false);
                    }}
                    aria-label={c.name}
                    title={c.name}
                    className="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c.value,
                      outline: newHabitColor === c.value ? "2px solid var(--color-ink)" : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void handleInlineCreate()}
            disabled={!newHabitName.trim()}
            className="habit-btn-create disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + create
          </button>
        </div>

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
          </>
        )}

        {/* Guest habit list */}
        {!isAuthenticated && sortedGuestHabits.length > 0 && (
          <div className="space-y-4">
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
