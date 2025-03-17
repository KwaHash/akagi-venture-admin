module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/vue3-essential', '@vue/airbnb'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-alert': 0,
    'max-len': 0,
    'no-param-reassign': ['error', { props: false }],
    'no-underscore-dangle': 0,
    'no-undef': 'error',
    'import/no-unresolved': 0,
    'import/no-cycle': 0,
    'no-restricted-globals': 0,
    'prefer-destructuring': 0,
    'no-irregular-whitespace': 0,
    'linebreak-style': 0,
    'spaced-comment': 0,
    'no-trailing-spaces': 0,
    'padded-blocks': 0,
    'consistent-return': 0,
    'vue/no-use-v-if-with-v-for': 0,
    'no-multiple-empty-lines': [
      'error',
      {
        max: 2,
        maxBOF: 1,
      },
    ],
    'import/extensions': 0,
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        mocha: true,
      },
    },
  ],
};
