module.exports = {
  root: true,
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'i18next'],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    // Zero tolerance
    'no-console': ['error', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Import rules
    'import/no-relative-packages': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['./*', '../../*'],
            message:
              'Use @/ path alias for imports that escape the current directory (within-feature ../ is allowed)',
          },
        ],
      },
    ],
    '@typescript-eslint/no-empty-object-type': [
      'error',
      { allowInterfaces: 'always' },
    ],
    'no-empty-pattern': 'off',

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-literals': 'warn',

    // i18n
    'i18next/no-literal-string': [
      'warn',
      {
        mode: 'jsx-text-only',
        'jsx-attributes': { include: ['aria-label', 'placeholder', 'accessibilityLabel'] },
      },
    ],
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.*'],
      rules: {
        'no-console': 'off',
        'i18next/no-literal-string': 'off',
        'react/jsx-no-literals': 'off',
      },
    },
  ],
};
