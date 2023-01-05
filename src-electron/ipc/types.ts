import type { IpcMainInvokeEvent } from 'electron'

export interface IIpcConfig {
  channel: string
  listener: (event: IpcMainInvokeEvent, args?: Record<string, any>) => any
}
