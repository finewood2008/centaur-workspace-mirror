import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "dark" | "light" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType>({ theme: "dark", setTheme: () => {}, resolved: "dark" });

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("app-theme") as Theme) || "dark";
  });

  const resolved = theme === "auto" ? getSystemTheme() : theme;

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("app-theme", t);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (resolved === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [resolved]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => setThemeState((prev) => prev); // force re-render
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}
