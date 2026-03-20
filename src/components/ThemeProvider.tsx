import { createContext, useContext, useEffect, useState, memo } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
        
        // Apply theme via CSS custom properties for instant switching
        root.style.setProperty('color-scheme', systemTheme);
        if (systemTheme === "dark") {
            root.style.setProperty('--color-bg', '#1a1e23');
            root.style.setProperty('--color-card', '#20242a');
            root.style.setProperty('--color-bg-secondary', '#16191d');
            root.style.setProperty('--color-white', '#ffffff');
            root.style.setProperty('--color-ink', '#e2e8f0');
            root.style.setProperty('--color-ink-light', '#cbd5e1');
            root.style.setProperty('--color-ink-muted', '#94a3b8');
            root.style.setProperty('--color-ink-faint', '#64748b');
            root.style.setProperty('--color-divider', 'rgba(255, 255, 255, 0.08)');
            root.style.setProperty('--color-cell-empty', '#2f3640');
            root.style.setProperty('--color-overlay', 'rgba(0, 0, 0, 0.7)');
            root.style.setProperty('--color-pill-bg', '#272c33');
            root.style.setProperty('--color-pill-text', '#cbd5e1');
            root.style.setProperty('--color-btn-create-bg', '#22272e');
            root.style.setProperty('--color-btn-create-text', '#e2e8f0');
            root.style.setProperty('--shadow-raised', '7px 7px 14px rgba(0, 0, 0, 0.6), -7px -7px 14px rgba(255, 255, 255, 0.04)');
            root.style.setProperty('--shadow-raised-hover', '9px 9px 18px rgba(0, 0, 0, 0.7), -9px -9px 18px rgba(255, 255, 255, 0.05)');
            root.style.setProperty('--shadow-pressed', 'inset 5px 5px 8px rgba(0, 0, 0, 0.6), inset -5px -5px 8px rgba(255, 255, 255, 0.03)');
            root.style.setProperty('--shadow-led-off', 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.06)');
            root.style.setProperty('--shadow-led-on', 'inset 2px 2px 5px rgba(255, 255, 255, 0.2), inset -2px -2px 5px rgba(0, 0, 0, 0.5), 0 0 10px #22c55e, 0 0 20px rgba(34, 197, 94, 0.3)');
            root.style.setProperty('--shadow-input', 'inset 3px 3px 6px rgba(0, 0, 0, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.03)');
        } else {
            root.style.setProperty('color-scheme', 'light');
            root.style.setProperty('--color-bg', '#e0e5ec');
            root.style.setProperty('--color-card', '#e0e5ec');
            root.style.setProperty('--color-bg-secondary', '#d1d9e6');
            root.style.setProperty('--color-white', '#ffffff');
            root.style.setProperty('--color-ink', '#2d3748');
            root.style.setProperty('--color-ink-light', '#4a5568');
            root.style.setProperty('--color-ink-muted', '#718096');
            root.style.setProperty('--color-ink-faint', '#a0aec0');
            root.style.setProperty('--color-divider', 'rgba(255, 255, 255, 0.4)');
            root.style.setProperty('--color-cell-empty', '#e0e5ec');
            root.style.setProperty('--color-overlay', 'rgba(163, 177, 198, 0.5)');
            root.style.setProperty('--color-pill-bg', '#e0e5ec');
            root.style.setProperty('--color-pill-text', '#4a5568');
            root.style.setProperty('--color-btn-create-bg', '#e0e5ec');
            root.style.setProperty('--color-btn-create-text', '#2d3748');
            root.style.setProperty('--shadow-raised', '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)');
            root.style.setProperty('--shadow-raised-hover', '12px 12px 20px rgba(163, 177, 198, 0.6), -12px -12px 20px rgba(255, 255, 255, 0.5)');
            root.style.setProperty('--shadow-pressed', 'inset 6px 6px 10px rgba(163, 177, 198, 0.6), inset -6px -6px 10px rgba(255, 255, 255, 0.5)');
            root.style.setProperty('--shadow-led-off', 'inset 3px 3px 6px rgba(163, 177, 198, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.5)');
            root.style.setProperty('--shadow-led-on', 'inset 2px 2px 5px rgba(255, 255, 255, 0.8), inset -2px -2px 5px rgba(0, 0, 0, 0.2), 0 0 12px #22c55e, 0 0 24px rgba(34, 197, 94, 0.6)');
            root.style.setProperty('--shadow-input', 'inset 4px 4px 8px rgba(163, 177, 198, 0.6), inset -4px -4px 8px rgba(255, 255, 255, 0.5)');
        }
        return;
    }

    // Apply specific theme
    if (theme === "dark") {
        root.style.setProperty('color-scheme', 'dark');
        root.style.setProperty('--color-bg', '#1a1e23');
        root.style.setProperty('--color-card', '#20242a');
        root.style.setProperty('--color-bg-secondary', '#16191d');
        root.style.setProperty('--color-white', '#ffffff');
        root.style.setProperty('--color-ink', '#e2e8f0');
        root.style.setProperty('--color-ink-light', '#cbd5e1');
        root.style.setProperty('--color-ink-muted', '#94a3b8');
        root.style.setProperty('--color-ink-faint', '#64748b');
        root.style.setProperty('--color-divider', 'rgba(255, 255, 255, 0.08)');
        root.style.setProperty('--color-cell-empty', '#2f3640');
        root.style.setProperty('--color-overlay', 'rgba(0, 0, 0, 0.7)');
        root.style.setProperty('--color-pill-bg', '#272c33');
        root.style.setProperty('--color-pill-text', '#cbd5e1');
        root.style.setProperty('--color-btn-create-bg', '#22272e');
        root.style.setProperty('--color-btn-create-text', '#e2e8f0');
        root.style.setProperty('--shadow-raised', '7px 7px 14px rgba(0, 0, 0, 0.6), -7px -7px 14px rgba(255, 255, 255, 0.04)');
        root.style.setProperty('--shadow-raised-hover', '9px 9px 18px rgba(0, 0, 0, 0.7), -9px -9px 18px rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--shadow-pressed', 'inset 5px 5px 8px rgba(0, 0, 0, 0.6), inset -5px -5px 8px rgba(255, 255, 255, 0.03)');
        root.style.setProperty('--shadow-led-off', 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.06)');
        root.style.setProperty('--shadow-led-on', 'inset 2px 2px 5px rgba(255, 255, 255, 0.2), inset -2px -2px 5px rgba(0, 0, 0, 0.5), 0 0 10px #22c55e, 0 0 20px rgba(34, 197, 94, 0.3)');
        root.style.setProperty('--shadow-input', 'inset 3px 3px 6px rgba(0, 0, 0, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.03)');
    } else {
        root.style.setProperty('color-scheme', 'light');
        root.style.setProperty('--color-bg', '#e0e5ec');
        root.style.setProperty('--color-card', '#e0e5ec');
        root.style.setProperty('--color-bg-secondary', '#d1d9e6');
        root.style.setProperty('--color-white', '#ffffff');
        root.style.setProperty('--color-ink', '#2d3748');
        root.style.setProperty('--color-ink-light', '#4a5568');
        root.style.setProperty('--color-ink-muted', '#718096');
        root.style.setProperty('--color-ink-faint', '#a0aec0');
        root.style.setProperty('--color-divider', 'rgba(255, 255, 255, 0.4)');
        root.style.setProperty('--color-cell-empty', '#e0e5ec');
        root.style.setProperty('--color-overlay', 'rgba(163, 177, 198, 0.5)');
        root.style.setProperty('--color-pill-bg', '#e0e5ec');
        root.style.setProperty('--color-pill-text', '#4a5568');
        root.style.setProperty('--color-btn-create-bg', '#e0e5ec');
        root.style.setProperty('--color-btn-create-text', '#2d3748');
        root.style.setProperty('--shadow-raised', '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)');
        root.style.setProperty('--shadow-raised-hover', '12px 12px 20px rgba(163, 177, 198, 0.6), -12px -12px 20px rgba(255, 255, 255, 0.5)');
        root.style.setProperty('--shadow-pressed', 'inset 6px 6px 10px rgba(163, 177, 198, 0.6), inset -6px -6px 10px rgba(255, 255, 255, 0.5)');
        root.style.setProperty('--shadow-led-off', 'inset 3px 3px 6px rgba(163, 177, 198, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.5)');
        root.style.setProperty('--shadow-led-on', 'inset 2px 2px 5px rgba(255, 255, 255, 0.8), inset -2px -2px 5px rgba(0, 0, 0, 0.2), 0 0 12px #22c55e, 0 0 24px rgba(34, 197, 94, 0.6)');
        root.style.setProperty('--shadow-input', 'inset 4px 4px 8px rgba(163, 177, 198, 0.6), inset -4px -4px 8px rgba(255, 255, 255, 0.5)');
    }
};

export const ThemeProvider = memo(function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== "system") return;
        
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => applyTheme("system");
        
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
});

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
}
