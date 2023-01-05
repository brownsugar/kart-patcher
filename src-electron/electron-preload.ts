import fs from 'fs'
import path from 'path'
import { contextBridge, ipcRenderer } from 'electron'
import { BrowserWindow } from '@electron/remote'
import Store from 'electron-store'
import type { OpenDialogOptions } from 'electron'

declare global {
  interface Window {
    __KART_PATCHER__: IKartPatcher
  }
}
interface IKartPatcher {
  app: {
    minimize: () => void
    close: () => void
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

const api: IKartPatcher = {
  app: {
    minimize () {
      BrowserWindow.getFocusedWindow()?.minimize()
    },
    close () {
      BrowserWindow.getFocusedWindow()?.close()
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
