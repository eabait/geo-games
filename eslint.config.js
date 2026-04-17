import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'eslint.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      boundaries,
    },
    settings: {
      react: { version: 'detect' },
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/shared/*' },
        { type: 'module', pattern: 'src/modules/*/*' },
        { type: 'router', pattern: 'src/router/*' },
        { type: 'app', pattern: 'src/App.tsx' },
        { type: 'main', pattern: 'src/main.tsx' },
      ],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],

      // Magic numbers — use named constants or TypeScript enums instead
      '@typescript-eslint/no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1], // loop sentinels everyone recognises
          ignoreEnums: true, // enum values are self-documenting
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true, // e.g. Tuple[0]
          ignoreNumericLiteralTypes: true, // e.g. type Tier = 1 | 2 | 3
          ignoreArrayIndexes: false,
        },
      ],

      // File & function size
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'warn',
        { max: 60, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      'max-statements': ['warn', 20],
      complexity: ['warn', 10],

      // Identifier quality — single-letter names and very short names are almost always meaningless
      'id-length': [
        'warn',
        {
          min: 2,
          exceptions: ['_', 'x', 'y', 'z', 'i', 'j', 'k', 'e', 't'], // conventional loop/math/event vars
          properties: 'never', // object keys are often short by convention (e.g. { r, g, b })
        },
      ],

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['router', 'shared'] },
            { from: 'router', allow: ['module', 'shared'] },
            { from: 'module', allow: ['shared'] },
            { from: 'shared', allow: ['shared'] },
            { from: 'main', allow: ['app', 'shared'] },
          ],
        },
      ],
    },
  },
  // Pure data files — numeric literals are geographic coordinates or flag data, not magic numbers
  {
    files: ['src/modules/flag-game/data/flags.ts', 'src/modules/flag-game/data/worldShapes.ts'],
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
  // Test files — numeric literals in test assertions are expected and intentional
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      'id-length': 'off',
    },
  },
);
