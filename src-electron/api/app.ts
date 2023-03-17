import { ipcRenderer } from 'electron'
import { BrowserWindow, app } from '@electron/remote'
import type { OpenDialogOptions } from 'electron'
import type { RegistryItem } from 'winreg'

declare global {
  interface Window {
    __KP_APP__: IApiApp
  }
}
interface IApiApp {
  version: string
  minimize (): void
  close (): void
  readRegistry (path: string | string[]): Promise<RegistryItem[] | null>
  writeRegistry (path: string, name: string, value: string): Promise<boolean>
  checkProcessRunning (name: string): Promise<boolean>
  selectDirectory (options?: OpenDialogOptions): Promise<any>
  openDirectory (path: string): void
  setProgressBar (progress: boolean | number): void
}

const api: IApiApp = {
  version: process.env.npm_package_version ??
    app.getVersion() ??
    '',
  minimize: () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  },
  close: () => {
    BrowserWindow.getFocusedWindow()?.close()
  },
  readRegistry: async (path) => {
    try {
      return await ipcRenderer.invoke('app:readRegistry', { path })
    } catch (e) {
      return null
    }
  },
  writeRegistry: async (path, name, value) => {
    try {
      await ipcRenderer.invoke('app:writeRegistry', { path, name, value })
      return true
    } catch (e) {
      return false
    }
  },
  checkProcessRunning: async (name) => {
    return await ipcRenderer.invoke('app:checkProcessRunning', { name })
  },
  selectDirectory: options =>
    ipcRenderer.invoke('app:selectDirectory', { options }),
  openDirectory: path =>
    ipcRenderer.send('app:openDirectory', { path }),
  setProgressBar: (progress) => {
    const value = typeof progress === 'number'
      ? progress
      : (progress === true ? 2 : -1)
    ipcRenderer.send('app:setProgressBar', { progress: value })
  }
}

export default {
  key: '__KP_APP__',
  api
}
