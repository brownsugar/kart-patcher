import { defineStore } from 'pinia'
import flagTw from 'assets/images/taiwan.png'
import flagKr from 'assets/images/south-korea.png'
import flagCn from 'assets/images/china.png'

export type regionCodeT = 'tw' | 'kr' | 'cn'
export type regionStatusT = keyof typeof regionStatusLabel

export interface IRegionPreset {
  flag: string
  name: string
  defaultRoot: {
    regPath: string
    regKey: string
  }
  executable: string
  patchNewsUrl: string
}
export interface IRegionState {
  status: regionStatusT
  client: {
    path: string | null
    version: number | null
  }
  server: {
    host: string
    port: number
    version: number | null
  }
}
export interface IRegion extends
  IRegionPreset, IRegionState {
  code: regionCodeT
}

const regionPresets: Record<regionCodeT, IRegionPreset> = {
  tw: {
    flag: flagTw,
    name: 'Taiwanese server',
    // name: '台服',
    defaultRoot: {
      regPath: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Gamania\\PopKart\\M01',
      regKey: 'InstallPath'
    },
    executable: 'KartRider.exe',
    patchNewsUrl: 'https://kinf.cc/BUeHl'
  },
  kr: {
    flag: flagKr,
    name: 'Korean server',
    defaultRoot: {
      regPath: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Nexon\\KartRider\\M01',
      regKey: 'RootPath'
    },
    executable: 'KartRider.exe',
    patchNewsUrl: 'https://kinf.cc/SpndE'
  },
  cn: {
    flag: flagCn,
    name: 'Chinese server',
    defaultRoot: {
      regPath: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\TianCity\\PopKart\\M01',
      regKey: 'InstallPath'
    },
    executable: 'KartRider.exe',
    patchNewsUrl: 'https://kinf.cc/t3bMn'
  }
}
const regionState = () => {
  const state: IRegionState = {
    status: 0,
    client: {
      path: null,
      version: null
    },
    server: {
      host: '',
      port: 0,
      version: null
    }
  }
  return state
}
// TODO: Move to i18n
export const regionStatusLabel = {
  0: '未知',
  100: '最新版本',
  200: '客戶端需更新',
  300: '未安裝客戶端',
  400: '伺服器維護中',
  401: '找不到伺服器'
}

const preference = window.__KART_PATCHER__.store.preference

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
            ...state[_key],
            ...value
          }
        }
      )
    }
  },
  actions: {
    initRegionState () {
      const regionCodes = Object.keys(this.$state) as regionCodeT[]
      regionCodes.forEach((code) => {
        this.$state[code].client.path = preference.get(`game.${code}.path`)
      })
    },
    updateStatus (regionCode: regionCodeT, statusCode: regionStatusT) {
      this.$state[regionCode].status = statusCode
    },
    updateClientPath (regionCode: regionCodeT, path: string) {
      preference.set(`game.${regionCode}.path`, path)
      this.$state[regionCode].client.path = path
    }
  }
})
