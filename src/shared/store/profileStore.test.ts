import { beforeEach, describe, expect, it } from 'vitest';

import { useProfileStore } from './profileStore';

beforeEach(() => {
  localStorage.clear();
  useProfileStore.persist.clearStorage();
  useProfileStore.setState({
    profiles: [],
    activeProfileId: null,
  });
});

describe('profileStore — reset state', () => {
  it('beforeEach resets profiles and activeProfileId', () => {
    const state = useProfileStore.getState();

    expect(state.profiles).toEqual([]);
    expect(state.activeProfileId).toBeNull();
  });
});

describe('profileStore — addProfile', () => {
  it('adds a profile and sets it as active', () => {
    useProfileStore.getState().addProfile('Ana', 'fox');

    const state = useProfileStore.getState();

    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0].name).toBe('Ana');
    expect(state.profiles[0].avatar).toBe('fox');
    expect(state.profiles[0].scores).toEqual({});
    expect(state.activeProfileId).toBe(state.profiles[0].id);
  });

  it('does not exceed 5 profiles', () => {
    for (let index = 0; index < 6; index += 1) {
      useProfileStore.getState().addProfile(`Player ${index}`, 'frog');
    }

    expect(useProfileStore.getState().profiles).toHaveLength(5);
  });
});

describe('profileStore — setActiveProfile', () => {
  it('switches the active profile', () => {
    useProfileStore.getState().addProfile('Ana', 'fox');
    useProfileStore.getState().addProfile('Bob', 'penguin');

    const [, bob] = useProfileStore.getState().profiles;
    useProfileStore.getState().setActiveProfile(bob.id);

    expect(useProfileStore.getState().activeProfileId).toBe(bob.id);
  });
});

describe('profileStore — recordScore', () => {
  it('records gamesPlayed, bestScore, and totalScore for active profile', () => {
    useProfileStore.getState().addProfile('Ana', 'fox');

    useProfileStore.getState().recordScore('flag-game', 150);

    const profile = useProfileStore.getState().profiles[0];
    expect(profile.scores['flag-game']).toEqual({
      gamesPlayed: 1,
      bestScore: 150,
      totalScore: 150,
    });
  });

  it('does not lower bestScore', () => {
    useProfileStore.getState().addProfile('Ana', 'fox');

    useProfileStore.getState().recordScore('flag-game', 150);
    useProfileStore.getState().recordScore('flag-game', 80);

    const profile = useProfileStore.getState().profiles[0];
    expect(profile.scores['flag-game']).toEqual({
      gamesPlayed: 2,
      bestScore: 150,
      totalScore: 230,
    });
  });

  it('does nothing and does not throw with no active profile', () => {
    expect(() => useProfileStore.getState().recordScore('flag-game', 100)).not.toThrow();
    expect(useProfileStore.getState().profiles).toEqual([]);
    expect(useProfileStore.getState().activeProfileId).toBeNull();
  });
});
