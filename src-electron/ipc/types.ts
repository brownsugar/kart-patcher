import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'

export interface IListenerArg {
  browserWindow?: BrowserWindow
  [key: string]: any
}

export interface IIpcConfig {
  channel: string
  listener: (event: IpcMainInvokeEvent, args?: IListenerArg) => any
  response?: boolean
}
