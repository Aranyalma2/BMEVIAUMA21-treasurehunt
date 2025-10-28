module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Type-aware linting for all local tsconfigs
    project: ['./apps/backend/tsconfig.json', './apps/frontend/tsconfig.json', './apps/admin/tsconfig.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Enables Prettier rules as ESLint errors
  ],
  ignorePatterns: [
    '**/dist',
    '**/node_modules',
    '.eslintrc.js',
  ],
  rules: {
    // Prettier alignment
    'prettier/prettier': [
      'error',
      {
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
        printWidth: 120,
        jsxSingleQuote: true,
        bracketSameLine: false,
        endOfLine: 'lf',
        arrowParens: 'always',
        tabWidth: 2,
      },
    ],

    // Relaxed TS rules for monorepo flexibility
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
