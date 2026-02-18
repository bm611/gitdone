import { SignUpButton } from "@clerk/clerk-react";
import { AsciiLogo } from "./AsciiLogo";

export function SignIn() {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="flex justify-center mb-6">
        <AsciiLogo />
      </div>
      <p className="text-sm text-[var(--color-ink-muted)] font-body mb-10 max-w-xs mx-auto leading-relaxed">
        Cultivate your daily rituals with intention and grace.
      </p>

      <SignUpButton mode="redirect" forceRedirectUrl="/">
        <button type="button" className="luxury-btn-filled text-base px-8 py-3">
          Get Started
        </button>
      </SignUpButton>

      <p className="text-xs text-[var(--color-ink-faint)] mt-4">
        Free to use · No credit card required
      </p>
    </div>
  );
}
