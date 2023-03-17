module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: [
        'last 4 Chrome versions'
      ]
    })
  ]
}
