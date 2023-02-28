import { ipcRenderer } from 'electron'
import { BrowserWindow } from '@electron/remote'
import type { OpenDialogOptions } from 'electron'

declare global {
  interface Window {
    __KP_APP__: IApiApp
  }
}
interface IApiApp {
  version: string
  minimize (): void
  close (): void
  selectDirectory (options?: OpenDialogOptions): Promise<any>
}

const api: IApiApp = {
  version: process.env.npm_package_version ?? '',
  minimize: () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  },
  close: () => {
    BrowserWindow.getFocusedWindow()?.close()
  },
  selectDirectory: options =>
    ipcRenderer.invoke('app:selectDirectory', { options })
}

export default {
  key: '__KP_APP__',
  api
}
