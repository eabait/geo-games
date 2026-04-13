import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  soundOn: boolean;
  continent: string;
  toggleSound: () => void;
  setContinent: (continent: string) => void;
  reset: () => void;
}

const initialState = { soundOn: true, continent: 'Todos' };

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      setContinent: (continent) => set({ continent }),
      reset: () => set(initialState),
    }),
    { name: 'geo-games-settings' },
  ),
);
