import { useClerk, useUser } from "@clerk/clerk-react";
import { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";

export function useDisplayName() {
  const { user } = useUser();
  return user?.username || user?.firstName || "Guest";
}

export function UserMenu() {
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative inline-flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center text-[var(--color-ink-muted)] hover:text-[var(--color-cell-done)] transition-colors cursor-pointer bg-transparent border-none p-0"
        aria-label="User menu"
      >
        <span className="md:hidden"><HugeiconsIcon icon={UserIcon} size={18} color="currentColor" strokeWidth={1.5} /></span>
        <span className="hidden md:inline"><HugeiconsIcon icon={UserIcon} size={22} color="currentColor" strokeWidth={1.5} /></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-card)] backdrop-blur-xl border border-[var(--color-divider)] rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] z-50">
          <div className="py-2">
            <button
              onClick={() => { openUserProfile(); setIsOpen(false); }}
              className="w-full text-left px-5 py-2.5 text-sm font-body text-[var(--color-ink-light)] hover:text-[var(--color-ink)] hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-200"
            >
              Profile
            </button>
            <div className="luxury-divider mx-5 my-1" />
            <button
              onClick={() => signOut()}
              className="w-full text-left px-5 py-2.5 text-sm font-body text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
