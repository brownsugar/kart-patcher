module.exports = {
  root: true,
  extends: [
    '@brownsugar/vue'
  ],
  globals: {
    ga: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    process: 'readonly',
    chrome: 'readonly'
  },
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'vue/no-v-html': 'off',
    'vue/max-attributes-per-line': ['error', {
      singleline: 1
    }]
  }
}
