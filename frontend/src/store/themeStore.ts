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
  // 초기값: 서버와 첫 렌더링 동일하게 'dark'로 고정
  const initial: Theme = 'dark';

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
