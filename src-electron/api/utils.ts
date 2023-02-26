import fs from 'fs'
import path from 'path'

declare global {
  interface Window {
    __KP_UTILS__: IApiUtils
  }
}
interface IApiUtils {
  fs: {
    existsSync: typeof fs.existsSync
  }
  path: {
    normalize: typeof path.normalize
    resolve: typeof path.resolve
  }
}

const api: IApiUtils = {
  fs: {
    existsSync: fs.existsSync
  },
  path: {
    normalize: path.normalize,
    resolve: path.resolve
  }
}

export default {
  key: '__KP_UTILS__',
  api
}
