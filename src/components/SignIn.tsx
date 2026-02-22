import { useState } from "react";
import { authClient } from "../lib/auth-client";

interface SignInProps {
  onStartDemo?: () => void;
  onSignIn?: () => void;
}

export function AuthForm() {
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
          className="habit-input mb-4"
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="habit-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        className="habit-input"
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

export function SignIn({ onStartDemo, onSignIn }: SignInProps) {
  // Use a stable pseudo-random array for the grid decorative pattern
  const gridPattern = [
    true, false, true, true, false, true, false,
    false, true, true, false, true, true, true,
    true, true, false, true, false, true, false,
    false, false, true, true, true, false, true
  ];

  return (
    <div className="w-full space-y-24 animate-in fade-in duration-700 pb-16">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 py-8 md:py-16">
        <div className="flex-1 space-y-8 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-pixel tracking-tight text-[var(--color-ink)] leading-[1.1] md:leading-tight drop-shadow-sm">
            Commit to<br className="hidden md:block" /> your habits
          </h1>
          <p className="text-lg text-[var(--color-ink-muted)] font-body max-w-md mx-auto md:mx-0 leading-relaxed">
            The developer-friendly habit tracker. Simple, open-source, and beautifully designed.
          </p>

          <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 justify-center md:justify-start pt-2">
            {onStartDemo && (
              <button
                type="button"
                onClick={onStartDemo}
                className="habit-btn-create w-full sm:w-auto px-8 py-3.5 text-base shadow-[var(--shadow-raised)]"
              >
                Try Demo
              </button>
            )}

            <button
              type="button"
              onClick={onSignIn}
              className={onStartDemo
                ? "px-8 py-3.5 rounded-2xl font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-bg-secondary)] transition-all cursor-pointer border-none"
                : "habit-btn-create w-full sm:w-auto px-8 py-3.5 text-base"
              }
            >
              {onStartDemo ? "Sign In / Up" : "Get Started"}
            </button>
          </div>


        </div>

        {/* Right side asymmetric visual element */}
        <div className="flex-1 relative hidden md:block w-full min-h-[250px] md:min-h-[350px] mt-8 md:mt-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-72 h-64 md:h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>

          {/* Card 1 - Back */}
          <div className="absolute top-4 md:top-10 left-4 md:left-10 w-48 md:w-64 h-24 md:h-32 bg-[var(--color-card)] rounded-[20px] shadow-[var(--shadow-raised)] -rotate-6 border border-[var(--color-divider)] p-4 flex items-end opacity-70">
             <div className="w-1/2 h-3 md:h-4 bg-[var(--color-bg-secondary)] rounded-full"></div>
          </div>

          {/* Card 2 - Front/Main */}
          <div className="absolute top-12 md:top-20 right-4 lg:right-10 w-56 md:w-72 bg-[var(--color-bg)] rounded-[24px] shadow-[var(--shadow-raised-hover)] rotate-3 border-2 border-[var(--color-divider)] p-4 md:p-5 z-10">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-400 shadow-[var(--shadow-led-on)] border border-emerald-200"></div>
              <div className="w-16 md:w-24 h-3 md:h-4 bg-[var(--color-card)] rounded-full shadow-[var(--shadow-pressed)]"></div>
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-1.5">
              {gridPattern.map((isDone, i) => (
                <div
                  key={i}
                  className="w-full aspect-square rounded-[3px] md:rounded-[4px]"
                  style={{
                    backgroundColor: isDone ? "var(--color-cell-done)" : "var(--color-cell-empty)",
                    boxShadow: isDone ? "var(--shadow-led-on)" : "var(--shadow-led-off)",
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Decorative floating badge */}
          <div className="absolute bottom-4 md:bottom-16 left-8 md:left-16 px-3 md:px-4 py-1.5 md:py-2 bg-[var(--color-card)] rounded-full shadow-[var(--shadow-raised)] rotate-12 border border-[var(--color-divider)] flex items-center gap-1.5 md:gap-2 z-20">
             <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
             <span className="text-[10px] md:text-xs font-bold text-[var(--color-ink)] font-pixel whitespace-nowrap">14 Day Streak!</span>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="relative">
        <h2 className="text-3xl md:text-4xl font-pixel text-[var(--color-ink)] mb-10 md:mb-16 md:ml-4 text-center md:text-left drop-shadow-sm">
          How it works
        </h2>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-8 items-start relative z-10">
          {/* Card 1: Create */}
          <div className="habit-card flex flex-col gap-4 relative overflow-hidden group w-full md:w-auto -rotate-1 md:rotate-0 transform-gpu">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-sky-400/10 rounded-full blur-2xl group-hover:bg-sky-400/20 transition-all"></div>
            <div className="flex items-center gap-3 relative z-10">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--color-bg-secondary)] shadow-[var(--shadow-pressed)] text-[var(--color-ink)] text-sm font-bold font-pixel shrink-0">
                1
              </span>
              <span className="text-lg font-bold text-[var(--color-ink)] tracking-tight">
                Create a habit
              </span>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed relative z-10">
              Add habits you want to build — like exercise, reading, or coding every day. Give it a name and a custom color.
            </p>
            <div className="mt-4 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-divider)] shadow-[var(--shadow-pressed)] flex items-center gap-2 relative z-10 w-fit">
               <div className="w-5 h-5 rounded-full bg-sky-400 shadow-sm border border-sky-200"></div>
               <div className="h-2 w-16 bg-[var(--color-ink-faint)] rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Card 2: Click - Offset downwards on desktop, indented on mobile */}
          <div className="habit-card flex flex-col gap-4 md:mt-12 ml-4 md:ml-0 mr-[-1rem] md:mr-0 relative overflow-hidden group w-[calc(100%-1rem)] md:w-auto rotate-2 md:rotate-0 transform-gpu">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all"></div>
            <div className="flex items-center gap-3 relative z-10">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--color-bg-secondary)] shadow-[var(--shadow-pressed)] text-[var(--color-ink)] text-sm font-bold font-pixel shrink-0">
                2
              </span>
              <span className="text-lg font-bold text-[var(--color-ink)] tracking-tight">
                Click the grid
              </span>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed relative z-10">
              Each cell is a day. Click to mark it done — just like making a git commit. The UI is satisfying and instantaneous.
            </p>
            <div className="mt-4 flex gap-1.5 justify-center md:justify-start relative z-10">
              {[true, true, false, true, false].map((filled, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-[4px] transition-all duration-300 ${i === 3 ? 'scale-110 -translate-y-1' : ''}`}
                  style={{
                    backgroundColor: filled ? "var(--color-cell-done)" : "var(--color-cell-empty)",
                    boxShadow: filled ? "var(--shadow-led-on)" : "var(--shadow-led-off)",
                    border: filled ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(0,0,0,0.1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Card 3: Streak - Different background treatment, rotated on mobile */}
          <div className="habit-card flex flex-col gap-4 bg-gradient-to-br from-[var(--color-card)] to-[var(--color-bg-secondary)] border-[var(--color-divider)] relative overflow-hidden group w-full md:w-auto -rotate-1 md:rotate-0 transform-gpu">
             <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all"></div>
            <div className="flex items-center gap-3 relative z-10">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--color-bg-secondary)] shadow-[var(--shadow-pressed)] text-[var(--color-ink)] text-sm font-bold font-pixel shrink-0">
                3
              </span>
              <span className="text-lg font-bold text-[var(--color-ink)] tracking-tight">
                Build your streak
              </span>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed relative z-10">
              Watch your contribution grid fill up over time. Stay consistent, stay green. Visual progress is the best motivation.
            </p>
            <div className="mt-4 flex gap-1 items-end h-10 relative z-10 opacity-80">
               {[20, 40, 60, 40, 80, 100, 80].map((h, i) => (
                 <div key={i} className="flex-1 rounded-t-sm bg-emerald-400" style={{ height: `${h}%`, boxShadow: '0 0 8px rgba(52, 211, 153, 0.4)' }}></div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
