import { create } from 'zustand';

interface LangState {
  lang: string;
  setLang: (lang: string) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: typeof window !== 'undefined' ? (localStorage.getItem('lang') || 'ko') : 'ko',
  setLang: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
    set({ lang });
  },
}));
