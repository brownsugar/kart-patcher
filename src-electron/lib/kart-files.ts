import { open } from 'fs/promises'
import { existsSync, statSync } from 'fs'
import { resolve, basename } from 'path'
import { Buffer } from 'buffer'

class KartCrc {
  constructor (
    readonly path: string
  ) {}

  async generateCrc () {
    const file = await open(this.path, 'r')
    const stat = await file.stat()
    let filesize = stat.size
    let result = 0

    if (filesize) {
      while (true) {
        let bytesToRead
        if (filesize >= 0x10000)
          bytesToRead = 0x10000
        else
          bytesToRead = filesize

        const buffer = Buffer.alloc(bytesToRead)
        const { bytesRead } = await file.read(buffer, 0, bytesToRead)
        if (bytesRead !== bytesToRead) {
          throw new Error('CRC_CALCULATION_ERROR', {
            cause: this.path
          })
        }

        result = this.calculateChunk(result, buffer, bytesRead)
        filesize -= bytesRead
        if (!filesize)
          break
      }
    }

    file.close()
    return result
  }

  private calculateChunk (prevResult: number, buffer: Buffer, bufferLength: number) {
    const v3 = buffer
    let v4 = prevResult & 0xFFFF // convert int to int16
    let v5 = prevResult >>> 16

    if (!buffer)
      return 1

    let index = 0
    for (let i = bufferLength; i; v5 %= 0xFFF1) {
      let v8 = i
      if (i >= 0x15B0)
        v8 = 0x15B0

      i -= v8
      if (v8 >= 16) {
        let v9 = v8 >>> 4
        v8 += -16 * (v8 >>> 4)
        while (v9) {
          const v10 = v3[index + 0] + v4
          const v11 = v10 + v5
          const v12 = v3[index + 1] + v10
          const v13 = v12 + v11
          const v14 = v3[index + 2] + v12
          const v15 = v14 + v13
          const v16 = v3[index + 3] + v14
          const v17 = v16 + v15
          const v18 = v3[index + 4] + v16
          const v19 = v18 + v17
          const v20 = v3[index + 5] + v18
          const v21 = v20 + v19
          const v22 = v3[index + 6] + v20
          const v23 = v22 + v21
          const v24 = v3[index + 7] + v22
          const v25 = v24 + v23
          const v26 = v3[index + 8] + v24
          const v27 = v26 + v25
          const v28 = v3[index + 9] + v26
          const v29 = v28 + v27
          const v30 = v3[index + 10] + v28
          const v31 = v30 + v29
          const v32 = v3[index + 11] + v30
          const v33 = v32 + v31
          const v34 = v3[index + 12] + v32
          const v35 = v34 + v33
          const v36 = v3[index + 13] + v34
          const v37 = v36 + v35
          const v38 = v3[index + 14] + v36
          const v39 = v38 + v37
          v4 = v3[index + 15] + v38
          v5 = v4 + v39
          index += 16
          --v9
        }
      }

      for (; v8 > 0; --v8) {
        v4 += v3[index++]
        v5 += v4
      }

      v4 %= 0xFFF1
    }

    return v4 | (v5 << 16)
  }
}

export class PatchFile {
  constructor (
    readonly path: string,
    readonly unknownValue: string,
    readonly crc: number,
    readonly size: number,
    readonly sizeGzipped: number,
    readonly dwHighDateTime: number,
    readonly dwLowDateTime: number,
    readonly delta1TargetCrc: number,
    readonly delta1Size: number,
    readonly delta2TargetCrc: number,
    readonly delta2Size: number,
    readonly alwaysZero: 0
  ) {}
}

export class LocalFile extends KartCrc {
  size = 0
  mtimeMs = 0
  crc = 0

  basename: string
  target: 'full' | 'delta1' | 'delta2' = 'full'
  extracted = false

  constructor (
    readonly basePath: string,
    readonly filePath: string,
    readonly tempDir: string
  ) {
    const fullPath = resolve(basePath, filePath)
    super(fullPath)
    this.basename = basename(filePath)
  }

  async loadMeta () {
    if (!existsSync(this.path))
      return false

    const stat = statSync(this.path)
    this.size = stat.size
    this.mtimeMs = stat.mtimeMs
    this.crc = await this.generateCrc()
    return true
  }

  getDownloadPath () {
    return resolve(this.basePath, this.tempDir, this.getRawFilePath())
  }

  getRawFilePath () {
    return this.filePath + this.getRawFileExt()
  }

  private getRawFileExt () {
    return this.target === 'full'
      ? this.extracted ? '' : '.gz'
      : `.${this.target}`
  }
}
