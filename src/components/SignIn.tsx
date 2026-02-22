import { useState } from "react";
import { authClient } from "../lib/auth-client";

interface SignInProps {
  onStartDemo?: () => void;
}

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Create a habit",
    description: "Add habits you want to build — like exercise, reading, or coding every day.",
    cells: [false, false, false, false, false, false, false],
  },
  {
    step: "2",
    title: "Click the grid",
    description: "Each cell is a day. Click to mark it done — just like making a git commit.",
    cells: [true, true, false, true, true, true, false],
  },
  {
    step: "3",
    title: "Build your streak",
    description: "Watch your contribution grid fill up over time. Stay consistent, stay green.",
    cells: [true, true, true, true, true, true, true],
  },
];

function AuthForm() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signUp") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (error) {
          setError(error.message || "Sign up failed");
        }
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) {
          setError(error.message || "Sign in failed");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs mx-auto space-y-4">
      {mode === "signUp" && (
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-divider)] rounded-lg text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-cell-done)] transition-colors font-body"
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-divider)] rounded-lg text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-cell-done)] transition-colors font-body"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-divider)] rounded-lg text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-cell-done)] transition-colors font-body"
      />
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="luxury-btn-filled w-full py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? "..." : mode === "signIn" ? "Sign In" : "Sign Up"}
      </button>
      <p className="text-xs text-center text-[var(--color-ink-muted)]">
        {mode === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(""); }}
          className="text-[var(--color-cell-done)] hover:underline bg-transparent border-none p-0 cursor-pointer font-body"
        >
          {mode === "signIn" ? "Sign Up" : "Sign In"}
        </button>
      </p>
    </form>
  );
}

export function SignIn({ onStartDemo }: SignInProps) {
  const [showAuthForm, setShowAuthForm] = useState(false);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      <div className="habit-card w-full mx-auto text-center py-12">
        <div className="space-y-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-pixel tracking-tight text-[var(--color-ink)]">
            Commit to your habits
          </h1>
          <p className="text-base text-[var(--color-ink-muted)] font-body max-w-xs mx-auto leading-relaxed">
            The developer-friendly habit tracker. <br className="hidden sm:block" />
            Simple, open-source, and beautiful.
          </p>
        </div>

        {showAuthForm ? (
          <AuthForm />
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs sm:max-w-none mx-auto">
            {onStartDemo && (
              <button
                type="button"
                onClick={onStartDemo}
                className="luxury-btn-filled w-full sm:w-auto px-8 py-3 text-base shadow-lg shadow-[var(--color-primary)]/20"
              >
                Try Demo
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAuthForm(true)}
              className={onStartDemo
                ? "luxury-btn-ghost w-full sm:w-auto px-8 py-3 text-base border-2 border-transparent hover:border-[var(--color-divider)]"
                : "luxury-btn-filled text-base px-8 py-3"
              }
            >
              {onStartDemo ? "Sign In / Up" : "Get Started"}
            </button>
          </div>
        )}

        <p className="text-xs text-[var(--color-ink-faint)] mt-8">
          Free to use · No credit card required · Open Source
        </p>
      </div>

      {/* How it works cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-pixel text-center text-[var(--color-ink)]">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="habit-card flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-cell-done)] text-[#1a1a1a] text-xs font-bold font-body shrink-0">
                  {item.step}
                </span>
                <span className="text-sm font-body font-semibold text-[var(--color-ink)]">
                  {item.title}
                </span>
              </div>
              <p className="text-xs text-[var(--color-ink-muted)] font-body leading-relaxed">
                {item.description}
              </p>
              <div className="flex gap-[3px] mt-auto pt-1">
                {item.cells.map((filled, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-[3px] transition-colors"
                    style={{
                      backgroundColor: filled
                        ? "var(--color-cell-done)"
                        : "var(--color-cell-empty)",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
