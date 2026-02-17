import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export function SignIn() {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <p className="luxury-heading-italic text-4xl sm:text-5xl mb-4">
        Welcome
      </p>
      <p className="text-sm text-[var(--color-ink-muted)] font-body mb-10 max-w-xs mx-auto leading-relaxed">
        Cultivate your daily rituals with intention and grace.
      </p>

      <div className="w-12 h-[1px] bg-[var(--color-gold)] mx-auto mb-10" />

      <div className="flex gap-4 justify-center">
        <SignInButton mode="redirect" forceRedirectUrl="/">
          <button type="button" className="luxury-btn-filled">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl="/">
          <button type="button" className="luxury-btn">
            Register
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}
