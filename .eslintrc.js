module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2024: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: [
      './apps/backend/tsconfig.json',
      './apps/admin/tsconfig.app.json',
      './apps/admin/tsconfig.node.json',
      './apps/frontend/tsconfig.app.json',
      './apps/frontend/tsconfig.node.json',
    ],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 2024,
    extraFileExtensions: ['.vue'],
  },
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  extends: [
    'plugin:vue/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: [
    '**/dist',
    '**/node_modules',
    '**/*.d.ts',
    '**/.vite',
    '**/coverage',
    '.eslintrc.cjs',
  ],
  overrides: [
    {
      files: ['*.js', '*.cjs'],
      parserOptions: {
        project: null,
      },
    },
    {
      files: ['**/vite.config.ts', '**/vitest.config.ts'],
      parserOptions: {
        project: null,
      },
    },
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'vue/multi-word-component-names': 'off',
  },
};
