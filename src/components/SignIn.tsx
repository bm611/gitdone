import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export function SignIn() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-pixel text-gray-900 text-balance">
          GitDone
        </h1>
        <p className="mt-2 text-sm text-gray-500 text-pretty">
          Track your habits, one day at a time.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <SignInButton mode="redirect" forceRedirectUrl="/">
          <button
            type="button"
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 cursor-pointer"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl="/">
          <button
            type="button"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Create account
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}
