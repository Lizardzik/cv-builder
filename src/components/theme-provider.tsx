import { createContext, useContext, useEffect, useState } from "react";

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

// localStorage.getItem/setItem potrafi rzucić wyjątek (np. tryb
// prywatny Safari z zablokowanym storage, restrykcyjne ustawienia
// przeglądarki firmowej). Bez zabezpieczenia całą aplikację wywalał
// błąd już przy pierwszym renderze, jeszcze zanim cokolwiek się
// wyświetliło.
function safeGetStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Brak dostępu do storage — motyw po prostu nie przetrwa
    // odświeżenia strony, ale aplikacja dalej działa.
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (safeGetStorage(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const applySystemTheme = () => {
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      };

      applySystemTheme();

      // Wcześniej motyw systemowy był odczytywany tylko raz, przy
      // montowaniu. Jeśli użytkownik przełączył ciemny/jasny tryb
      // w systemie operacyjnym bez odświeżania strony, aplikacja tego
      // nie zauważała aż do reloadu. Ten listener aktualizuje motyw
      // na żywo, tak długo jak wybrany jest tryb "system".
      mediaQuery.addEventListener("change", applySystemTheme);
      return () => mediaQuery.removeEventListener("change", applySystemTheme);
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      safeSetStorage(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme musi być użyty wewnątrz ThemeProvider");
  return context;
};
