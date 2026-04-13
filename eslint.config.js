import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
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
        { type: 'shared',  pattern: 'src/shared/*'   },
        { type: 'module',  pattern: 'src/modules/*/*' },
        { type: 'router',  pattern: 'src/router/*'   },
        { type: 'app',     pattern: 'src/App.tsx'     },
        { type: 'main',    pattern: 'src/main.tsx'    },
      ],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      }],
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'app',    allow: ['router', 'shared'] },
          { from: 'router', allow: ['module', 'shared'] },
          { from: 'module', allow: ['shared'] },
          { from: 'shared', allow: ['shared'] },
          { from: 'main',   allow: ['app', 'shared'] },
        ],
      }],
    },
  },
);
