import { contextBridge } from 'electron'
import { BrowserWindow } from '@electron/remote'

declare global {
  interface Window {
    __KART_PATCHER__: {
      app: {
        minimize: () => void
        close: () => void
      }
    }
  }
}

contextBridge.exposeInMainWorld('__KART_PATCHER__', {
  app: {
    minimize () {
      BrowserWindow.getFocusedWindow()?.minimize()
    },
    close () {
      BrowserWindow.getFocusedWindow()?.close()
    }
  }
})
