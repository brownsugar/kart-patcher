import { Socket } from 'net'
import log from 'electron-log'
import BufferManager from './buffer-manager'

export interface IKartPatchServerInfo {
  endpoint: string
  version: number
}

class KartPatchSocket {
  host: string
  port: number
  socket: Socket | null = null

  constructor (host: string, port: number) {
    this.host = host
    this.port = port
  }

  connect () {
    return new Promise<IKartPatchServerInfo>((resolve, reject) => {
      this.socket = new Socket()
      this.socket.setTimeout(10000)
      this.socket.on('data', (data) => {
        const buffer = Buffer.from(data)
        const reader = new BufferManager(buffer)
        reader.move(0x0A)

        const version = reader.nextShort()
        const endpoint = reader.nextStringAuto()
        this.socket?.destroy()
        resolve({
          endpoint,
          version
        })
      })
      this.socket.on('timeout', () => {
        log.debug('[KartPatchSocket][connect] Connection timeout')
        reject(new Error('timeout'))
        this.socket?.destroy()
      })
      this.socket.on('error', (e) => {
        log.debug('[KartPatchSocket][connect] Connection error', e)
        reject(new Error('error'))
        this.socket?.destroy()
      })
      this.socket.on('close', () => {
        log.debug('[KartPatchSocket][connect] Connection closed')
        this.socket = null
      })
      this.socket.connect(this.port, this.host, () => {
        log.debug(`[KartPatchSocket][connect] Connected to ${this.host}:${this.port}`)
      })
    })
  }
}

export default KartPatchSocket
