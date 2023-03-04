exports.default = (context) => {
  const Zip = require('adm-zip')
  const zip = new Zip()

  const file = context.artifactPaths[0]
  zip.addLocalFile(file)

  const path = require('path')
  const { productName } = context.configuration
  zip.writeZip(path.resolve(__dirname, `../dist/${productName}.zip`))
}
