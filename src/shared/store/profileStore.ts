import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface GameScore {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  scores: Record<string, GameScore>;
}

interface ProfileStore {
  profiles: PlayerProfile[];
  activeProfileId: string | null;
  addProfile: (name: string, avatar: string) => void;
  setActiveProfile: (id: string) => void;
  recordScore: (gameKey: string, score: number) => void;
}

const MAX_PROFILES = 5;
const RANDOM_ID_RADIX = 36;
const RANDOM_ID_PREFIX_LENGTH = 2;

function createProfileId(): string {
  return `${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).slice(RANDOM_ID_PREFIX_LENGTH)}`;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    immer((set) => ({
      profiles: [],
      activeProfileId: null,

      addProfile: (name, avatar) =>
        set((state) => {
          if (state.profiles.length >= MAX_PROFILES) {
            return;
          }

          const id = createProfileId();
          state.profiles.push({ id, name, avatar, scores: {} });
          state.activeProfileId = id;
        }),

      setActiveProfile: (id) =>
        set((state) => {
          state.activeProfileId = id;
        }),

      recordScore: (gameKey, score) =>
        set((state) => {
          const profile = state.profiles.find((item) => item.id === state.activeProfileId);

          if (!profile) {
            return;
          }

          const gameScore = profile.scores[gameKey] ?? {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
          };

          profile.scores[gameKey] = {
            gamesPlayed: gameScore.gamesPlayed + 1,
            totalScore: gameScore.totalScore + score,
            bestScore: Math.max(gameScore.bestScore, score),
          };
        }),
    })),
    { name: 'geo-games-profiles' },
  ),
);
