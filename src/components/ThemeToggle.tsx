import { Sun03Icon, Moon02Icon, ComputerIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "./ThemeProvider";
import { useState, useRef, useEffect, memo, useCallback } from "react";

export const ThemeToggle = memo(function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);

    const handleThemeChange = useCallback((newTheme: "light" | "dark" | "system") => {
        setTheme(newTheme);
        setIsOpen(false);
    }, [setTheme]);

    return (
        <div className="relative inline-flex items-center text-left" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center text-ink-muted hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0"
                aria-label="Toggle theme"
            >
                {theme === "light" && <HugeiconsIcon icon={Sun03Icon} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" color="currentColor" strokeWidth={1.5} />}
                {theme === "dark" && <HugeiconsIcon icon={Moon02Icon} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" color="currentColor" strokeWidth={1.5} />}
                {theme === "system" && <HugeiconsIcon icon={ComputerIcon} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" color="currentColor" strokeWidth={1.5} />}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl bg-card shadow-raised border border-divider focus:outline-none z-50 p-1">
                    <button
                        type="button"
                        className={`habit-menu-item rounded-lg ${theme === "light" ? "bg-[rgba(163,177,198,0.15)]" : ""}`}
                        onClick={() => handleThemeChange("light")}
                    >
                        <HugeiconsIcon icon={Sun03Icon} className="w-4 h-4" /> Light
                    </button>
                    <button
                        type="button"
                        className={`habit-menu-item rounded-lg ${theme === "dark" ? "bg-[rgba(163,177,198,0.15)]" : ""}`}
                        onClick={() => handleThemeChange("dark")}
                    >
                        <HugeiconsIcon icon={Moon02Icon} className="w-4 h-4" /> Dark
                    </button>
                    <button
                        type="button"
                        className={`habit-menu-item rounded-lg ${theme === "system" ? "bg-[rgba(163,177,198,0.15)]" : ""}`}
                        onClick={() => handleThemeChange("system")}
                    >
                        <HugeiconsIcon icon={ComputerIcon} className="w-4 h-4" /> System
                    </button>
                </div>
            )}
        </div>
    );
});
