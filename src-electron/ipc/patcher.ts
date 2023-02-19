import KartPatcher from '../lib/kart-patcher'
import type { IIpcConfig } from './types'

export const patcherHandlers: IIpcConfig[] = [
  {
    channel: 'patcher:init',
    response: false,
    listener: (_e, args) => {
      const patcher = new KartPatcher(args?.patchUrl, args?.version, args?.localPath)

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
