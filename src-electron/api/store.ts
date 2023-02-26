import Store from 'electron-store'

declare global {
  interface Window {
    __KP_STORE__: IApiStore
  }
}
interface IApiStore {
  preference: Pick<typeof preferenceStore, 'get' | 'set' | 'reset'>
}
interface IStorePreference {
  game: {
    tw: {
      path: string
    }
    kr: {
      path: string
    }
    cn: {
      path: string
    }
  }
  download: {
    connections: number
    deltaMode: boolean
  }
}

export const preferenceStore = new Store<IStorePreference>({
  schema: {
    game: {
      type: 'object',
      patternProperties: {
        '(tw|kr|cn)': {
          type: 'object',
          properties: {
            path: {
              type: 'string'
            }
          }
        }
      },
      additionalProperties: false
    },
    download: {
      type: 'object',
      properties: {
        connections: {
          type: 'number'
        },
        deltaMode: {
          type: 'boolean'
        }
      },
      default: {
        connections: 8,
        deltaMode: true
      },
      additionalProperties: false
    }
  }
})

const buildStoreApi = (store: Store<any>) => {
  return {
    get: store.get.bind(store),
    set: store.set.bind(store),
    reset: store.reset.bind(store)
  }
}
const api: IApiStore = {
  preference: buildStoreApi(preferenceStore)
}

export default {
  key: '__KP_STORE__',
  api
}
