import { resolve } from 'path'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { inflateSync } from 'zlib'
import BufferManager from './buffer-manager'

export interface IKartPin {
  clientVersion: number
  id: string
  officialSiteUrl: string
  officialPatchUrl: string
  server: {
    name: string
    config?: {
      section: string
      data: Record<string, string>
    }
    host: string
    port: number
  }
}

export default class KartPin {
  readonly pinFile: string

  constructor (path: string, filename: string) {
    const filepath = resolve(path, filename)
    if (!existsSync(filepath)) {
      throw new Error('INVALID_PIN_FILE', {
        cause: filepath
      })
    }
    this.pinFile = filepath
  }

  async parse () {
    const buffer = await this.uncompress(this.pinFile)
    const reader = new BufferManager(buffer)
    reader.move(0x09)

    const clientVersion = reader.nextShort()
    reader.move(0x03)

    const id = reader.nextStringAuto()
    const officialSiteUrl = reader.nextStringAuto()
    const officialPatchUrl = reader.nextStringAuto()
    reader.move(0x05)

    const server: Partial<IKartPin['server']> = {}
    server.name = reader.nextStringAuto()
    if (reader.nextBool()) {
      const section = reader.nextStringAuto()
      reader.move(0x08)

      server.config = {
        section,
        data: {}
      }
      let key = ''
      while ((key = reader.nextStringAuto()) !== '')
        server.config.data[key] = reader.nextStringAuto()
    }
    reader.move(0x04)

    server.host = [
      reader.nextByte(),
      reader.nextByte(),
      reader.nextByte(),
      reader.nextByte()
    ].join('.')
    server.port = reader.nextShort(true)

    // ... Ignore anything left as they're not quite useful here

    const info: IKartPin = {
      clientVersion,
      id,
      officialSiteUrl,
      officialPatchUrl,
      server: server as IKartPin['server']
    }

    return info
  }

  private async uncompress (filepath: string) {
    const fileBuffer = await readFile(filepath)
    const fileReader = new BufferManager(fileBuffer)
    const dataLength = fileReader.nextUInt32LE()
    const dataBuffer = fileReader.nextBuffer(dataLength)

    const dataReader = new BufferManager(dataBuffer)
    const header = dataReader.nextUInt8()
    if (header !== 0x53) {
      throw new Error('INVALID_PIN_HEADER', {
        cause: filepath
      })
    }

    const flag = dataReader.nextUInt8()
    dataReader.move(0x04)
    const key = dataReader.nextUInt32LE()
    dataReader.move(0x04)

    let data = dataReader.nextBuffer(dataLength - dataReader.tell())
    if (flag & 2)
      data = this.decrypt(data, key)
    if (flag & 1)
      data = inflateSync(data)

    return data
  }

  private decrypt (buffer: Buffer, key: number) {
    const uintArray1 = new Uint32Array(17)
    const uintArray2 = new Uint8Array(68)

    uintArray1[0] = key ^ 0x8473FBC1

    for (let i = 1; i < 16; ++i)
      uintArray1[i] = uintArray1[i - 1] - 0x7B8C043F

    for (let i = 0; i <= 16; ++i) {
      const source = Buffer.alloc(4)
      source.writeUInt32LE(uintArray1[i])
      source.copy(uintArray2, i * 4)
    }

    let num = 0
    while (num + 64 <= buffer.length) {
      for (let i = 0; i < 16; ++i) {
        const offset = num + 4 * i
        const source = Buffer.alloc(4)
        source.writeUInt32LE((uintArray1[i] ^ buffer.readUInt32LE(offset)) >>> 0)
        source.copy(buffer, offset)
      }
      num += 64
    }
    for (let i = num; i < buffer.length; ++i)
      buffer[i] = buffer[i] ^ uintArray2[i - num]

    return buffer
  }
}
