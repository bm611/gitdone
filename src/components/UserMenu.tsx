import { useState, useRef, useEffect, memo, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import { authClient } from "../lib/auth-client";

export const UserMenu = memo(function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  const handleSignOut = useCallback(() => {
    authClient.signOut();
    setIsOpen(false);
  }, []);

  return (
    <div ref={menuRef} className="relative inline-flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center text-ink-muted hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0 animated-icon-bounce"
        aria-label="User menu"
      >
        <HugeiconsIcon icon={UserIcon} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" color="currentColor" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-divider rounded-xl shadow-raised z-50 overflow-hidden">
          <div className="py-2">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-5 py-2.5 text-sm font-body text-ink-muted hover:text-ink hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
