import { describe, it, expect, beforeEach } from 'vitest';

import { useSettingsStore } from './settingsStore';

beforeEach(() => useSettingsStore.getState().reset());

describe('settingsStore', () => {
  it('defaults to sound on and all continents', () => {
    const { soundOn, continent } = useSettingsStore.getState();
    expect(soundOn).toBe(true);
    expect(continent).toBe('Todos');
  });

  it('toggles sound', () => {
    useSettingsStore.getState().toggleSound();
    expect(useSettingsStore.getState().soundOn).toBe(false);
    useSettingsStore.getState().toggleSound();
    expect(useSettingsStore.getState().soundOn).toBe(true);
  });

  it('sets continent filter', () => {
    useSettingsStore.getState().setContinent('Europa');
    expect(useSettingsStore.getState().continent).toBe('Europa');
  });
});
