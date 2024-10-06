import globals from 'globals';
import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tslint from 'typescript-eslint';

export default tslint.config(
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        project: [
          './packages/services/*/tsconfig.json',
          './packages/lambdas/*/tsconfig.json',
          './packages/*/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      }
    },
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      'eol-last': ['error', 'always'],
      'max-len': ['error', { code: 120 }],
      'linebreak-style': ['error', 'unix'],
      'no-trailing-spaces': 'error',
      'indent': ['error', 2],
    },
  },
  {
    ignores: [ 'node_modules', '**/dist', 'eslint.config.js' ]
  }
);
