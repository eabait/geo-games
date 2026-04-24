import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const screenFiles = [
  {
    path: './SoloPlayingScreen.tsx',
    cssImport: "import styles from './SoloPlayingScreen.module.css';",
  },
  {
    path: './ExplorerPlayingScreen.tsx',
    cssImport: "import styles from './ExplorerPlayingScreen.module.css';",
  },
  {
    path: './FamilyPlayingScreen.tsx',
    cssImport: "import styles from './FamilyPlayingScreen.module.css';",
  },
  {
    path: './DuelPlayingScreen.tsx',
    cssImport: "import styles from './DuelPlayingScreen.module.css';",
  },
] as const;

describe('playing screen styling architecture', () => {
  it.each(screenFiles)(
    '$path uses a colocated CSS module for layout styles',
    ({ path, cssImport }) => {
      const source = readFileSync(new URL(path, import.meta.url), 'utf8');

      expect(source).toContain(cssImport);
      expect(source).not.toContain('const WRAPPER_STYLE');
      expect(source).not.toContain('const OPTIONS_STYLE');
      expect(source).not.toContain("display: 'flex'");
      expect(source).not.toContain("minHeight: '100vh'");
      expect(source).not.toContain('fontFamily:');
    },
  );
});
