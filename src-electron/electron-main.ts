import path from 'path'
import os from 'os'
import fs from 'fs'
import { app, BrowserWindow, nativeTheme, shell, ipcMain } from 'electron'
import { initialize, enable } from '@electron/remote/main'
import Store from 'electron-store'
import log from 'electron-log'
import ipcHandlers from './ipc'

const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    fs.unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions')
    )
  }
  initialize()
  Store.initRenderer()
  log.initialize({ preload: true })
} catch (_) {}

let mainWindow: BrowserWindow | undefined
const createWindow = () => {
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'),
    width: 800,
    height: 450,
    useContentSize: true,
    frame: false,
    resizable: false,
    webPreferences: {
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      sandbox: false
    }
  })
  mainWindow.loadURL(process.env.APP_URL)

  enable(mainWindow.webContents)
  if (process.env.DEBUGGING)
    mainWindow.webContents.openDevTools()

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return {
      action: 'deny'
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = undefined
  })
}

ipcHandlers.forEach(({ channel, response, listener }) => {
  if (response !== false) {
    ipcMain.handle(channel, (e, args = {}) => {
      args.browserWindow = mainWindow
      return listener(e, args)
    })
  } else {
    ipcMain.on(channel, (e, args = {}) => {
      args.browserWindow = mainWindow
      return listener(e, args)
    })
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin')
    app.quit()
})

app.on('activate', () => {
  if (mainWindow === undefined)
    createWindow()
})
