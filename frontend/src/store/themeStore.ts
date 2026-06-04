import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const applyTheme = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  // 초기값: localStorage 또는 기본 dark
  const initial: Theme =
    typeof window !== 'undefined'
      ? ((localStorage.getItem('theme') as Theme) || 'dark')
      : 'dark';

  // 즉시 적용
  if (typeof document !== 'undefined') {
    applyTheme(initial);
  }

  return {
    theme: initial,
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
      set({ theme });
    },
    toggleTheme: () => {
      const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
      set({ theme: next });
    },
  };
});
