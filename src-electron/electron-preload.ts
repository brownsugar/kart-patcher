import fs from 'fs'
import path from 'path'
import { contextBridge, ipcRenderer } from 'electron'
import { BrowserWindow } from '@electron/remote'
import Store from 'electron-store'
import type { OpenDialogOptions } from 'electron'
import KartPin from './lib/kart-pin'
import KartPatchSocket from './lib/kart-patch-socket'
import KartPatcher from './lib/kart-patcher'
import type { IKartPin } from './lib/kart-pin'
import type { IKartPatchServerInfo } from './lib/kart-patch-socket'
import type { IKartPatcherEventCallback } from './lib/kart-patcher'

declare global {
  interface Window {
    __KART_PATCHER__: IKartPatcherApi
  }
}
interface IKartPatcherApi {
  minimize (): void
  close (): void
  app: {
    parsePin (...args: ConstructorParameters<typeof KartPin>): Promise<IKartPin>
    connectPatchSocket (...args: ConstructorParameters<typeof KartPatchSocket>): Promise<IKartPatchServerInfo>
    patcher: {
      init (...args: ConstructorParameters<typeof KartPatcher>): void
      off (): void
    } & IKartPatcherEventCallback
  }
  dialog: {
    selectDirectory (options?: OpenDialogOptions): Promise<any>
  }
  store: {
    preference: {
      get: (typeof preferenceStore)['get']
      set: (typeof preferenceStore)['set']
      reset: (typeof preferenceStore)['reset']
    }
  }
  node: {
    fs: typeof fs
    path: typeof path
  }
}

const preferenceStore = new Store({
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
    }
  }
})

const api: IKartPatcherApi = {
  minimize: () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  },
  close: () => {
    BrowserWindow.getFocusedWindow()?.close()
  },
  app: {
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
        ipcRenderer
          .send('patcher:init', {
            patchUrl: args[0],
            version: args[1],
            localPath: args[2]
          })
      },
      on: (event, listener) => {
        const cbFn: Parameters<typeof ipcRenderer.on>[1] = (_event, data) => {
          if (data.event === event) {
            listener(data.payload)
          }
        }
        ipcRenderer.on('patcher:event', cbFn)
      },
      off: () => {
        ipcRenderer.removeAllListeners('patcher:event')
      }
    }
  },
  dialog: {
    selectDirectory: options => ipcRenderer.invoke('dialog:selectDirectory', { options })
  },
  store: {
    preference: {
      get: preferenceStore.get.bind(preferenceStore),
      set: preferenceStore.set.bind(preferenceStore),
      reset: preferenceStore.reset.bind(preferenceStore)
    }
  },
  node: {
    fs,
    path
  }
}
contextBridge.exposeInMainWorld('__KART_PATCHER__', api)
