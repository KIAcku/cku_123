import { create } from 'zustand';

interface LangState {
  lang: string;
  setLang: (lang: string) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: 'ko',
  setLang: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
    set({ lang });
  },
}));
