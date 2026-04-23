import React from 'react';
import { Outlet } from 'react-router-dom';

import '@/modules/flag-game/styles/theme.css';
import { useSettingsStore } from '@/modules/flag-game/store/settingsStore';
import { Layout } from '@/shared/components/Layout';

export function App(): React.JSX.Element {
  const { soundOn, toggleSound } = useSettingsStore();
  return (
    <Layout soundOn={soundOn} onToggleSound={toggleSound}>
      <Outlet />
    </Layout>
  );
}
