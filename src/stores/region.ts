import { defineStore } from 'pinia'
import log from 'electron-log'
import { i18n } from 'boot/i18n'
import flagTw from 'assets/images/taiwan.png'
import flagKr from 'assets/images/south-korea.png'
import flagCn from 'assets/images/china.png'

export type regionCodeT = 'tw' | 'kr' | 'cn'
export enum regionStatus {
  'UNKNOWN' = 0,
  'LATEST_VERSION' = 100,
  'CLIENT_OUTDATED' = 200,
  'CLIENT_DAMAGED' = 201,
  'CLIENT_NOT_FOUND' = 300,
  'CLIENT_PATH_NOT_SET' = 301,
  'SERVER_UNREACHABLE' = 400,
  'SERVER_NOT_FOUND' = 401
}

export interface IRegionPreset {
  flag: string
  pinFile: string
  exeFile: string
  defaultServer: {
    host: string
    port: number
  }
  registry: {
    path: string
    rootPathName: string
    executableName: string
  }
  patchNewsUrl: string
}
export interface IRegionState {
  status: regionStatus
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
    exeFile: 'KartRider.exe',
    defaultServer: {
      host: '210.208.95.160',
      port: 39311
    },
    registry: {
      path: 'HKLM\\SOFTWARE\\WOW6432Node\\Gamania\\PopKart\\M01',
      rootPathName: 'InstallPath',
      executableName: 'Executable'
    },
    patchNewsUrl: 'https://kinf.cc/BUeHl'
  },
  kr: {
    flag: flagKr,
    pinFile: 'KartRider.pin',
    exeFile: 'KartRider.exe',
    defaultServer: {
      host: '218.153.7.16',
      port: 39311
    },
    registry: {
      path: 'HKLM\\SOFTWARE\\WOW6432Node\\Nexon\\KartRider\\M01',
      rootPathName: 'RootPath',
      executableName: 'Executable'
    },
    patchNewsUrl: 'https://kinf.cc/SpndE'
  },
  cn: {
    flag: flagCn,
    pinFile: 'KartRider.pin',
    exeFile: 'KartRider.exe',
    defaultServer: {
      host: '61.164.61.66',
      port: 39311
    },
    registry: {
      path: 'HKLM\\SOFTWARE\\WOW6432Node\\TianCity\\PopKart\\M01',
      rootPathName: 'InstallPath',
      executableName: 'Executable'
    },
    patchNewsUrl: 'https://kinf.cc/t3bMn'
  }
}
const regionState = () => {
  const state: IRegionState = {
    status: regionStatus.UNKNOWN,
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
        if (path)
          this[code].client.path = path

        this.checkStatus(code)
      })
    },
    async checkStatus (regionCode: regionCodeT) {
      this[regionCode].refreshing = true

      const path = this[regionCode].client.path
      if (!path) {
        this.updateStatus(regionCode, regionStatus.CLIENT_PATH_NOT_SET)
        this[regionCode].refreshing = false
        return
      }

      const { existsSync } = window.__KP_UTILS__.fs
      const { resolve } = window.__KP_UTILS__.path
      const pinFile = regionPresets[regionCode].pinFile
      const installed = existsSync(resolve(path, pinFile))
      let host = ''
      let port = 0
      let damaged = false

      if (installed) {
        try {
          const pin = await window.__KP_CORE__.parsePin(path, pinFile)
          this[regionCode].client.version = pin.clientVersion
          host = pin.server.host
          port = pin.server.port
        } catch (e: any) {
          damaged = true
          log.error('[Store][Region][checkStatus]', e)
        }
      }

      if (!host || !port) {
        host = regionPresets[regionCode].defaultServer.host
        port = regionPresets[regionCode].defaultServer.port
      }

      try {
        this[regionCode].server.host = host
        this[regionCode].server.port = port

        const patchServer = await window.__KP_CORE__.connectPatchSocket(host, port)
        this[regionCode].server.version = patchServer.version
        this[regionCode].server.patchUrl = patchServer.endpoint

        if (damaged)
          this.updateStatus(regionCode, regionStatus.CLIENT_DAMAGED)
        else if (installed) {
          if (patchServer.version === this[regionCode].client.version)
            this.updateStatus(regionCode, regionStatus.LATEST_VERSION)
          else
            this.updateStatus(regionCode, regionStatus.CLIENT_OUTDATED)
        } else
          this.updateStatus(regionCode, regionStatus.CLIENT_NOT_FOUND)
      } catch (e: any) {
        if (e.message === 'timeout')
          this.updateStatus(regionCode, regionStatus.SERVER_UNREACHABLE)
        else
          this.updateStatus(regionCode, regionStatus.SERVER_NOT_FOUND)
        log.error('[Store][Region][checkStatus]', e)
      } finally {
        this[regionCode].refreshing = false
      }
    },
    updateStatus (regionCode: regionCodeT, statusCode: regionStatus) {
      this[regionCode].status = statusCode
    },
    updateClientPath (regionCode: regionCodeT, path: string) {
      preference.set(`game.${regionCode}.path`, path)
      this[regionCode].client.path = path
    }
  }
})
