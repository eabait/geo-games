import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Continent } from '../types';

type ContinentFilter = Continent | 'Todos';

interface SettingsStore {
  soundOn: boolean;
  continent: ContinentFilter;
  toggleSound: () => void;
  setContinent: (continent: ContinentFilter) => void;
  reset: () => void;
}

const initialState: { soundOn: boolean; continent: ContinentFilter } = {
  soundOn: true,
  continent: 'Todos',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,
      toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),
      setContinent: (continent) => set({ continent }),
      reset: () => set(initialState),
    }),
    { name: 'geo-games-settings' },
  ),
);
