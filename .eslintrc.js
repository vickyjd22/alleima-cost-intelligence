module.exports = {
  extends: ['expo'],
  ignorePatterns: ['/dist/*', '/web-build/*'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
