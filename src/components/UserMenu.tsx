import { SignOutButton, useClerk, useUser } from "@clerk/clerk-react";

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function UserMenu() {
  const { openUserProfile } = useClerk();
  const { user } = useUser();

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";

  return (
    <details className="group relative">
      <summary className="flex list-none cursor-pointer items-center gap-2 rounded-full border border-amber-200/80 bg-white/80 px-2 py-1.5 text-sm text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md [&::-webkit-details-marker]:hidden">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-xs font-bold text-white">
          {getInitials(user?.fullName ?? user?.username)}
        </span>
        <span className="hidden max-w-[120px] truncate text-xs font-medium sm:block">
          {displayName}
        </span>
        <svg
          className="size-3 text-slate-500 transition group-open:rotate-180"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 6.5L8 11l4.5-4.5" />
        </svg>
      </summary>

      <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-56 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="block w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
        >
          Manage account
        </button>

        <SignOutButton>
          <button
            type="button"
            className="mt-1 block w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
          >
            Sign out
          </button>
        </SignOutButton>
      </div>
    </details>
  );
}
