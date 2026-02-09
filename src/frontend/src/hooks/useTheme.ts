import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('theme');
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        console.error('Failed to save theme preference:', e);
      }
      return newTheme;
    });
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
