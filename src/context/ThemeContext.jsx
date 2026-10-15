import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rt_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      // Default to dark mode for RT 09 Portal signature look
      return 'dark';
    }
    return 'dark';
  });

  const isDark = theme === 'dark';

  const applyTheme = (targetTheme) => {
    const root = document.documentElement;
    // Add transition class for smooth theme switch
    root.classList.add('theme-transition');

    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Remove transition class after animation finishes so it doesn't slow down normal UI interactions
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('rt_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
