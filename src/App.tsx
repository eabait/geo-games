import { Outlet } from 'react-router-dom';

import { useSettingsStore } from '@/modules/flag-game/store/settingsStore';
import { Layout } from '@/shared/components/Layout';

export function App(): JSX.Element {
  const { soundOn, toggleSound } = useSettingsStore();
  return (
    <Layout soundOn={soundOn} onToggleSound={toggleSound}>
      <Outlet />
    </Layout>
  );
}
