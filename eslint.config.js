const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: ['node_modules/**']
  },
  {
    files: ['**/*.ts', '**/*.tsx'], // Ensure TypeScript files are targeted
    languageOptions: {
      parser: tsParser, // Use TypeScript parser
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      semi: [2, 'always'],
      'space-before-function-paren': [0, { anonymous: 'always', named: 'always' }],
      camelcase: 0,
      'no-return-assign': 0,
      quotes: ['error', 'single'],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
];
