module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin', "@deel-core/eslint-plugin"],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', "plugin:@deel-core/recommended"],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js', 'migrations/_dummy'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  },
  overrides: [
    {
      // Disable no-unused-vars for dummy migration files
      files: ['migrations/dummy.ts', 'post_deployment_migrations/dummy.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ]
};
