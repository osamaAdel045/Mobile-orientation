const path = require('path');

module.exports = {
  description: 'Generate a shared UI component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Component name (PascalCase, e.g., Badge):',
      validate: (value) => (value.length > 0 ? true : 'Name is required'),
    },
  ],
  actions: [
    {
      type: 'add',
      path: 'src/core/ui/{{name}}.tsx',
      templateFile: path.join(__dirname, 'templates/component.tsx.hbs'),
    },
    {
      type: 'add',
      path: '__tests__/core/ui/{{name}}.test.tsx',
      templateFile: path.join(__dirname, 'templates/component.test.tsx.hbs'),
    },
  ],
};
