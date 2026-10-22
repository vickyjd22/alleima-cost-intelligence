module.exports = {
  extends: ['expo'],
  ignorePatterns: ['/dist/*', '/web-build/*', '/firebase/functions/*'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
