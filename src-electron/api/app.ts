import { ipcRenderer } from 'electron'
import { BrowserWindow } from '@electron/remote'
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
  selectDirectory (options?: OpenDialogOptions): Promise<any>
  openDirectory (path: string): void
}

const api: IApiApp = {
  version: process.env.npm_package_version ?? '',
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
  selectDirectory: options =>
    ipcRenderer.invoke('app:selectDirectory', { options }),
  openDirectory: path =>
    ipcRenderer.send('app:openDirectory', { path })
}

export default {
  key: '__KP_APP__',
  api
}
