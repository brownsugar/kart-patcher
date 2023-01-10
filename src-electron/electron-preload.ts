import fs from 'fs'
import path from 'path'
import { contextBridge, ipcRenderer } from 'electron'
import { BrowserWindow } from '@electron/remote'
import Store from 'electron-store'
import type { OpenDialogOptions } from 'electron'
import KartPin from './lib/kart-pin'
import KartPatchSocket from './lib/kart-patch-socket'
import type { IKartPin } from './lib/kart-pin'
import type { IKartPatchServerInfo } from './lib/kart-patch-socket'

declare global {
  interface Window {
    __KART_PATCHER__: IKartPatcherApi
  }
}
interface IKartPatcherApi {
  minimize: () => void
  close: () => void
  app: {
    parsePin: (path: string, filename: string) => Promise<IKartPin>
    connectPatchSocket: (host: string, port: number) => Promise<IKartPatchServerInfo>
  }
  dialog: {
    selectDirectory: (options?: OpenDialogOptions) => Promise<any>
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
    parsePin: (path: string, filename: string) => {
      const pin = new KartPin(path, filename)
      return pin.parse()
    },
    connectPatchSocket: (host: string, port: number) => {
      const socket = new KartPatchSocket(host, port)
      return socket.connect()
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
