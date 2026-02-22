import { Sun03Icon, Moon02Icon, ComputerIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "./ThemeProvider";
import { useState, useRef, useEffect } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-flex items-center text-left" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer bg-transparent border-none p-0"
                aria-label="Toggle theme"
            >
                {theme === "light" && <HugeiconsIcon icon={Sun03Icon} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" color="currentColor" strokeWidth={1.5} />}
                {theme === "dark" && <HugeiconsIcon icon={Moon02Icon} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" color="currentColor" strokeWidth={1.5} />}
                {theme === "system" && <HugeiconsIcon icon={ComputerIcon} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" color="currentColor" strokeWidth={1.5} />}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl bg-[var(--color-card)] shadow-[var(--shadow-raised)] border border-[var(--color-divider)] focus:outline-none z-50 p-1">
                    <button
                        type="button"
                        className={`habit-menu-item rounded-lg ${theme === "light" ? "bg-[rgba(163,177,198,0.15)]" : ""}`}
                        onClick={() => { setTheme("light"); setIsOpen(false); }}
                    >
                        <HugeiconsIcon icon={Sun03Icon} className="w-4 h-4" /> Light
                    </button>
                    <button
                        type="button"
                        className={`habit-menu-item rounded-lg ${theme === "dark" ? "bg-[rgba(163,177,198,0.15)]" : ""}`}
                        onClick={() => { setTheme("dark"); setIsOpen(false); }}
                    >
                        <HugeiconsIcon icon={Moon02Icon} className="w-4 h-4" /> Dark
                    </button>
                    <button
                        type="button"
                        className={`habit-menu-item rounded-lg ${theme === "system" ? "bg-[rgba(163,177,198,0.15)]" : ""}`}
                        onClick={() => { setTheme("system"); setIsOpen(false); }}
                    >
                        <HugeiconsIcon icon={ComputerIcon} className="w-4 h-4" /> System
                    </button>
                </div>
            )}
        </div>
    );
}
