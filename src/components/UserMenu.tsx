import { useClerk, useUser } from "@clerk/clerk-react";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.username || user?.firstName || "Guest";

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
    <div ref={menuRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="luxury-btn-ghost flex items-center gap-2"
      >
        <span>{displayName}</span>
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M3 5L6 8L9 5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[var(--color-divider)] shadow-[0_8px_40px_rgba(0,0,0,0.08)] z-50">
          <div className="py-2">
            <button
              onClick={() => { openUserProfile(); setIsOpen(false); }}
              className="w-full text-left px-5 py-2.5 text-sm font-body text-[var(--color-ink-light)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors duration-200"
            >
              Profile
            </button>
            <div className="luxury-divider mx-5 my-1" />
            <button
              onClick={() => signOut()}
              className="w-full text-left px-5 py-2.5 text-sm font-body text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
