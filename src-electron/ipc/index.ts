import { execSync } from 'child_process'
import { dialog, shell } from 'electron'
import Registry from 'winreg'
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

const initRegistry = (path: string) => {
  const [hive, ...key] = path.split('\\')
  return new Registry({
    hive,
    key: `\\${key.join('\\')}`
  })
}

const handlers: IIpcConfig[] = [
  {
    channel: 'app:readRegistry',
    listener: (_e, args) => {
      const reg = initRegistry(args?.path)
      return new Promise((resolve, reject) => {
        reg.values((error, items) => {
          if (error)
            reject(error)
          else
            resolve(items)
        })
      })
    }
  },
  {
    channel: 'app:writeRegistry',
    listener: (_e, args) => {
      const reg = initRegistry(args?.path)
      return new Promise<void>((resolve, reject) => {
        reg.set(args?.name, Registry.REG_SZ, args?.value, (error) => {
          if (error)
            reject(error)
        })
        resolve()
      })
    }
  },
  {
    channel: 'app:checkProcessRunning',
    listener: (_e, args) => {
      return new Promise((resolve) => {
        try {
          const result = execSync('tasklist')
          resolve(result.toString().toLowerCase().includes(args?.name.toLowerCase()))
        } catch (e) {
          resolve(false)
        }
      })
    }
  },
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
    channel: 'app:openDirectory',
    response: false,
    listener: async (_e, args) => {
      if (!args?.path)
        return

      await shell.openPath(args.path)
    }
  },
  {
    channel: 'app:setProgressBar',
    response: false,
    listener: (_e, args) => {
      if (!args?.browserWindow)
        return

      args.browserWindow.setProgressBar(args?.progress ?? 2) // default to indeterminate state
    }
  },
  {
    channel: 'patcher:init',
    response: false,
    listener: async (_e, args) => {
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

      await patcher.run()
    }
  }
]

export default handlers
