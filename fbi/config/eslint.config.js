// http://eslint.org/docs/user-guide/configuring
module.exports = {
  // https://github.com/airbnb/javascript
  // https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base
  extends: 'eslint-config-airbnb-base',
  parser: 'babel-eslint',
  plugins: [
    'html'
  ],
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    allowImportExportEverywhere: false
  },
  rules: {
    semi: [2, 'never'],
    'no-console': [0],
    'no-param-reassign': [0], // https://github.com/airbnb/javascript#functions--mutate-params
  }
}
