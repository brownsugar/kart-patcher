import path from 'path'
import os from 'os'
import fs from 'fs'
import { app, BrowserWindow, nativeTheme } from 'electron'
import { initialize, enable } from '@electron/remote/main'

const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    fs.unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions')
    )
  }
  initialize()
} catch (_) {}

let mainWindow: BrowserWindow | undefined

function createWindow () {
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 800,
    height: 450,
    useContentSize: true,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
      sandbox: false
    }
  })

  enable(mainWindow.webContents)

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow()
  }
})