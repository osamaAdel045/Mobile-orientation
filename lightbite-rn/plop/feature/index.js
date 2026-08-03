const path = require('path');

module.exports = {
  description: 'Generate a new feature with full folder structure',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'Feature path (e.g., customer/checkout or auth):',
      validate: (value) => (value.length > 0 ? true : 'Feature path is required'),
    },
  ],
  actions: (data) => {
    const parts = data.name.split('/');
    const featureName = parts[parts.length - 1];
    const folderPath = data.name;

    const pascalName = parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('');

    data.featureName = featureName;
    data.pascalName = pascalName;
    data.folderPath = folderPath;

    return [
      {
        type: 'add',
        path: `src/features/{{folderPath}}/types.ts`,
        templateFile: path.join(__dirname, 'templates/types.ts.hbs'),
      },
      {
        type: 'add',
        path: `src/features/{{folderPath}}/schemas/{{featureName}}.schema.ts`,
        templateFile: path.join(__dirname, 'templates/schema.ts.hbs'),
      },
      {
        type: 'add',
        path: `src/features/{{folderPath}}/api/{{featureName}}.api.ts`,
        templateFile: path.join(__dirname, 'templates/api.ts.hbs'),
      },
      {
        type: 'add',
        path: `src/features/{{folderPath}}/store/{{featureName}}.store.ts`,
        templateFile: path.join(__dirname, 'templates/store.ts.hbs'),
      },
      {
        type: 'add',
        path: `src/features/{{folderPath}}/hooks/use{{pascalName}}.ts`,
        templateFile: path.join(__dirname, 'templates/hook.ts.hbs'),
      },
      {
        type: 'add',
        path: `src/features/{{folderPath}}/screens/{{pascalName}}Screen.tsx`,
        templateFile: path.join(__dirname, 'templates/screen.tsx.hbs'),
      },
      {
        type: 'add',
        path: `app/{{folderPath}}/_layout.tsx`,
        templateFile: path.join(__dirname, 'templates/route-layout.tsx.hbs'),
        skip: () => (parts.length > 1 ? 'route-layout skipped for nested features' : undefined),
      },
      {
        type: 'add',
        path: `__tests__/features/{{folderPath}}/{{featureName}}.store.test.ts`,
        templateFile: path.join(__dirname, 'templates/store.test.ts.hbs'),
      },
      {
        type: 'add',
        path: `__tests__/features/{{folderPath}}/{{featureName}}.schema.test.ts`,
        templateFile: path.join(__dirname, 'templates/schema.test.ts.hbs'),
      },
    ];
  },
};
