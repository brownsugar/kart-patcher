import { ipcRenderer } from 'electron'
import KartPin from '../lib/kart-pin'
import KartPatchSocket from '../lib/kart-patch-socket'
import KartPatcher from '../lib/kart-patcher'
import type { IKartPin } from '../lib/kart-pin'
import type { IKartPatchServerInfo } from '../lib/kart-patch-socket'
import type { IKartPatcherEventCallback } from '../lib/kart-patcher'
import { preferenceStore } from './store'

declare global {
  interface Window {
    __KP_CORE__: IApiCore
  }
}
interface IApiCore {
  parsePin (...args: ConstructorParameters<typeof KartPin>): Promise<IKartPin>
  connectPatchSocket (...args: ConstructorParameters<typeof KartPatchSocket>): Promise<IKartPatchServerInfo>
  patcher: {
    init (...args: ConstructorParameters<typeof KartPatcher>): void
    off (): void
  } & IKartPatcherEventCallback
}

const api: IApiCore = {
  parsePin: (...args) => {
    const pin = new KartPin(...args)
    return pin.parse()
  },
  connectPatchSocket: (...args) => {
    const socket = new KartPatchSocket(...args)
    return socket.connect()
  },
  patcher: {
    init: (...args) => {
      const pref = preferenceStore.get('download')
      ipcRenderer
        .send('patcher:init', {
          patchUrl: args[0],
          version: args[1],
          localPath: args[2],
          connections: pref.connections,
          deltaMode: pref.deltaMode
        })
    },
    on: (event, listener) => {
      const cbFn: Parameters<typeof ipcRenderer.on>[1] = (_event, data) => {
        if (data.event === event)
          listener(data.payload)
      }
      ipcRenderer.on('patcher:event', cbFn)
    },
    off: () => {
      ipcRenderer.removeAllListeners('patcher:event')
    }
  }
}

export default {
  key: '__KP_CORE__',
  api
}
