import { dialog } from 'electron'
import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import KartPatcher from '../lib/kart-patcher'

export interface IListenerArg {
  browserWindow?: BrowserWindow
  [key: string]: any
}

export interface IIpcConfig {
  channel: string
  listener: (event: IpcMainInvokeEvent, args?: IListenerArg) => any
  response?: boolean
}

const handlers: IIpcConfig[] = [
  {
    channel: 'app:selectDirectory',
    listener: async (_e, args) => {
      if (!args?.browserWindow)
        return ''

      const { filePaths } = await dialog.showOpenDialog(args.browserWindow, {
        properties: ['openDirectory'],
        ...args?.options
      })
      return filePaths[0]
    }
  },
  {
    channel: 'patcher:init',
    response: false,
    listener: (_e, args) => {
      const patcher = new KartPatcher(args?.patchUrl, args?.version, args?.localPath, {
        deltaMode: args?.deltaMode,
        connections: args?.connections
      })

      const events = [
        'start',
        'end',
        'step-start',
        'step-update',
        'step-end',
        'error'
      ]
      events.forEach((event) => {
        patcher.on(event, (payload) => {
          args?.browserWindow?.webContents.send('patcher:event', {
            event,
            payload
          })
        })
      })

      patcher.run()
    }
  }
]

export default handlers
