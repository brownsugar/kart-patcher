import { dialog } from 'electron'
import type { IIpcConfig } from './types'

export const dialogHandlers: IIpcConfig[] = [
  {
    channel: 'dialog:selectDirectory',
    listener: async (_e, args) => {
      if (!args?.browserWindow)
        return ''

      const { filePaths } = await dialog.showOpenDialog(args.browserWindow, {
        properties: ['openDirectory'],
        ...args?.options
      })
      return filePaths[0]
    }
  }
]
