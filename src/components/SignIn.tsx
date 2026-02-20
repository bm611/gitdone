import { SignUpButton } from "@clerk/clerk-react";

interface SignInProps {
  onStartDemo?: () => void;
}

export function SignIn({ onStartDemo }: SignInProps) {
  return (
    <div className="habit-card w-full mx-auto text-center py-12 animate-in fade-in duration-700">
      
      <div className="space-y-4 mb-10">
        <h1 className="text-3xl sm:text-4xl font-pixel tracking-tight text-[var(--color-ink)]">
          Commit to your habits
        </h1>
        <p className="text-base text-[var(--color-ink-muted)] font-body max-w-xs mx-auto leading-relaxed">
          The developer-friendly habit tracker. <br className="hidden sm:block" />
          Simple, open-source, and beautiful.
        </p>
      </div>

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

        <SignUpButton mode="redirect" forceRedirectUrl="/">
          <button 
            type="button" 
            className={onStartDemo 
              ? "luxury-btn-ghost w-full sm:w-auto px-8 py-3 text-base border-2 border-transparent hover:border-[var(--color-divider)]" 
              : "luxury-btn-filled text-base px-8 py-3"
            }
          >
            {onStartDemo ? "Sign In / Up" : "Get Started"}
          </button>
        </SignUpButton>
      </div>

      <p className="text-xs text-[var(--color-ink-faint)] mt-8">
        Free to use · No credit card required · Open Source
      </p>
    </div>
  );
}
