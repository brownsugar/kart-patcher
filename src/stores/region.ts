import { defineStore } from 'pinia'
import flagTw from 'assets/images/taiwan.png'
import flagKr from 'assets/images/south-korea.png'
import flagCn from 'assets/images/china.png'

export const regionStatusLabel = {
  100: '最新版本',
  200: '客戶端需更新',
  300: '未安裝客戶端',
  400: '伺服器維護中',
  401: '找不到伺服器'
}

export type regionCodeT = 'tw' | 'kr' | 'cn'
export type regionStatusT = keyof typeof regionStatusLabel

export interface regionT {
  code: regionCodeT
  flag: string
  name: string
  status: regionStatusT
  patchNewsUrl: string
}

export const useRegionStore = defineStore('region', {
  state: () => {
    const regionsRaw: regionT[] = [
      {
        code: 'tw',
        flag: flagTw,
        name: 'Taiwanese server',
        // name: '台服',
        status: 100,
        patchNewsUrl: 'https://kartinfo.me/forum.php?mod=forumdisplay&fid=37&filter=author&orderby=dateline&typeid=5'
      },
      {
        code: 'kr',
        flag: flagKr,
        name: 'Korean server',
        status: 200,
        patchNewsUrl: 'https://kartinfo.me/forum.php?mod=forumdisplay&fid=54&filter=author&orderby=dateline&typeid=74'
      },
      {
        code: 'cn',
        flag: flagCn,
        name: 'Chinese server',
        status: 300,
        patchNewsUrl: 'https://kartinfo.me/forum.php?mod=forumdisplay&fid=59&filter=typeid&typeid=80&orderby=dateline'
      }
    ]

    return {
      regionsRaw
    }
  },
  getters: {
    regions: (state) => {
      return state.regionsRaw
    }
  },
  actions: {
  }
})
