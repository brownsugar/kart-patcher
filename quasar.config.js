const path = require('path')
const { configure } = require('quasar/wrappers')

module.exports = configure((/* ctx */) => {
  return {
    eslint: {
      warnings: true,
      errors: true
    },
    // app boot file (/src/boot)
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      'i18n'
    ],
    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: [
      'app.scss'
    ],
    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'fontawesome-v6'
    ],
    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        browser: ['chrome110'],
        node: 'node16'
      },
      vueRouterMode: 'hash',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},
      vitePlugins: [
        ['@intlify/vite-plugin-vue-i18n', {
          include: path.resolve(__dirname, './src/i18n/**')
        }]
      ]
    },
    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      open: true
    },
    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
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
    // https://v2.quasar.dev/options/animations
    animations: [],
    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      prodPort: 3000,
      middlewares: [
        'render' // keep this as last one
      ]
    },
    // https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
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
