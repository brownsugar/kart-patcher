const path = require('path')
const { configure } = require('quasar/wrappers')

module.exports = configure(() => {
  return {
    eslint: {
      warnings: true,
      errors: true
    },
    boot: [
      'i18n'
    ],
    css: [
      'app.scss'
    ],
    extras: [
      'fontawesome-v6'
    ],
    build: {
      target: {
        browser: ['chrome110'],
        node: 'node16'
      },
      vueRouterMode: 'hash',
      env: {
        GITHUB_REPO: 'brownsugar/kart-patcher'
      },
      vitePlugins: [
        ['@intlify/vite-plugin-vue-i18n', {
          include: path.resolve(__dirname, './src/i18n/**')
        }]
      ]
    },
    devServer: {
      open: true
    },
    framework: {
      config: {
        ripple: {
          early: true
        }
      },
      iconSet: 'fontawesome-v6',
      plugins: [
        'Notify'
      ]
    },
    animations: [],
    electron: {
      inspectPort: 5858,
      bundler: 'builder',
      builder: {
        appId: 'com.brownsugar.kartpatcher',
        win: {
          target: 'portable'
        },
        portable: {
          // eslint-disable-next-line no-template-curly-in-string
          artifactName: '${productName}.${ext}'
        },
        afterAllArtifactBuild: './scripts/after-build.js'
      }
    }
  }
})
