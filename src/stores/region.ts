import { defineStore } from 'pinia'
import log from 'electron-log'
import { i18n } from 'boot/i18n'
import flagTw from 'assets/images/taiwan.png'
import flagKr from 'assets/images/south-korea.png'
import flagCn from 'assets/images/china.png'

export type regionCodeT = 'tw' | 'kr' | 'cn'
export type regionStatusT = keyof typeof regionStatusPreset

export interface IRegionPreset {
  flag: string
  pinFile: string
  defaultServer: {
    host: string
    port: number
  }
  registry: {
    path: string
    rootPathKey: string
    executableKey: string
  }
  patchNewsUrl: string
}
export interface IRegionState {
  status: regionStatusT
  refreshing: boolean
  client: {
    path: string | null
    version: number | null
  }
  server: {
    host: string
    port: number
    version: number | null
    patchUrl: string
  }
}
export interface IRegion extends
  IRegionPreset, IRegionState {
  code: regionCodeT
  name: string
}

export const regionPresets: Record<regionCodeT, IRegionPreset> = {
  tw: {
    flag: flagTw,
    pinFile: 'KartRider.pin',
    defaultServer: {
      host: '210.208.95.160',
      port: 39311
    },
    registry: {
      path: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Gamania\\PopKart\\M01',
      rootPathKey: 'InstallPath',
      executableKey: 'Executable'
    },
    patchNewsUrl: 'https://kinf.cc/BUeHl'
  },
  kr: {
    flag: flagKr,
    pinFile: 'KartRider.pin',
    defaultServer: {
      host: '218.153.7.16',
      port: 39311
    },
    registry: {
      path: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Nexon\\KartRider\\M01',
      rootPathKey: 'RootPath',
      executableKey: 'Executable'
    },
    patchNewsUrl: 'https://kinf.cc/SpndE'
  },
  cn: {
    flag: flagCn,
    pinFile: 'KartRider.pin',
    defaultServer: {
      host: '61.164.61.66',
      port: 39311
    },
    registry: {
      path: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\TianCity\\PopKart\\M01',
      rootPathKey: 'InstallPath',
      executableKey: 'Executable'
    },
    patchNewsUrl: 'https://kinf.cc/t3bMn'
  }
}
const regionState = () => {
  const state: IRegionState = {
    status: 0,
    refreshing: false,
    client: {
      path: '',
      version: null
    },
    server: {
      host: '',
      port: 0,
      version: null,
      patchUrl: ''
    }
  }
  return state
}
const regionStatusPreset = {
  0: 'UNKNOWN',
  100: 'LATEST_VERSION',
  200: 'CLIENT_OUTDATED',
  300: 'CLIENT_NOT_FOUND',
  400: 'SERVER_UNREACHABLE',
  401: 'SERVER_NOT_FOUND'
}

const preference = window.__KP_STORE__.preference

export const useRegionStore = defineStore('region', {
  state: () => {
    const state: Record<regionCodeT, IRegionState> = {
      tw: regionState(),
      kr: regionState(),
      cn: regionState()
    }
    return state
  },
  getters: {
    regions: (state) => {
      return Object.entries(regionPresets).map<IRegion>(
        ([key, value]) => {
          const _key = key as regionCodeT
          return {
            code: _key,
            name: i18n.global.t(`region.${_key}`),
            ...state[_key],
            ...value
          }
        }
      )
    }
  },
  actions: {
    initState () {
      const regionCodes = Object.keys(this.$state) as regionCodeT[]
      regionCodes.forEach((code) => {
        const path = preference.get(`game.${code}.path`) as string
        if (path) {
          this[code].client.path = path
          this.checkStatus(code)
        }
      })
    },
    async checkStatus (regionCode: regionCodeT) {
      this[regionCode].refreshing = true
      const path = this[regionCode].client.path
      const { existsSync } = window.__KP_UTILS__.fs
      if (!path || !existsSync(path))
        return

      const { resolve } = window.__KP_UTILS__.path
      const pinFile = regionPresets[regionCode].pinFile
      const installed = existsSync(resolve(path, pinFile))
      try {
        if (installed) {
          const pin = await window.__KP_CORE__.parsePin(path, pinFile)
          this[regionCode].client.version = pin.clientVersion

          const host = pin.server.host
          const port = pin.server.port
          this[regionCode].server.host = host
          this[regionCode].server.port = port

          const patchServer = await window.__KP_CORE__.connectPatchSocket(host, port)
          this[regionCode].server.version = patchServer.version
          this[regionCode].server.patchUrl = patchServer.endpoint
          if (patchServer.version === pin.clientVersion)
            this.updateStatus(regionCode, 100)
          else
            this.updateStatus(regionCode, 200)
        } else
          this.updateStatus(regionCode, 300)
      } catch (e: any) {
        if (e.message === 'timeout')
          this.updateStatus(regionCode, 400)
        else
          this.updateStatus(regionCode, 401)
        log.error('[Store][Region][checkStatus]', e)
      } finally {
        this[regionCode].refreshing = false
      }
    },
    updateStatus (regionCode: regionCodeT, statusCode: regionStatusT) {
      this[regionCode].status = statusCode
    },
    updateClientPath (regionCode: regionCodeT, path: string) {
      preference.set(`game.${regionCode}.path`, path)
      this[regionCode].client.path = path
    }
  }
})
