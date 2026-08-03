module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended'],
  rules: {
    'declaration-no-important': true,
    'color-no-hex': [
      true,
      {
        message: 'Use theme tokens via useTheme() instead of raw hex values',
      },
    ],
    'unit-allowed-list': ['%', 'deg', 's', 'ms', 'dpi'],
    'declaration-property-value-no-unknown': true,
    'selector-max-id': 0,
    'selector-max-type': 2,
    'max-nesting-depth': 3,
  },
  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      customSyntax: 'postcss-styled-syntax',
    },
  ],
};
