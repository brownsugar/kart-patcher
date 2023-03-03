module.exports = {
  root: true,
  extends: [
    '@brownsugar/vue'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-v-html': 'off',
    'vue/max-attributes-per-line': ['error', {
      singleline: 1
    }]
  }
}
