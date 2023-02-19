import { EventEmitter } from 'events'
import { existsSync, createReadStream, createWriteStream } from 'fs'
import { mkdir, rm } from 'fs/promises'
import { resolve, dirname } from 'path'
import { createGunzip } from 'zlib'
import { move } from 'fs-extra'
import { utimes } from 'utimes'
import EasyDl from 'easydl'
import { resolveUrl, fetch } from '../utils'
import { PatchFile, LocalFile } from './kart-files'

type patcherStartT = {
  count: number
}
type stepStartT = {
  stepIndex: number
  name:
  | 'processPatchInfo'
  | 'checkLocal'
  | 'download'
  | 'extract'
  | 'apply'
  | 'validate'
  count?: number
  indeterminate?: boolean
}
type stepUpdate = {
  stepIndex: number
  fileIndex: number
  file: string
  type?: 'file-start'
} | {
  stepIndex: number
  fileIndex: number
  type: 'file-meta'
  meta: Awaited<ReturnType<EasyDl['metadata']>>
} | {
  stepIndex: number
  fileIndex: number
  type: 'file-download'
  progress?: EasyDl['totalProgress']
} | {
  stepIndex: number
  fileIndex: number
  type: 'file-build'
  progress?: EasyDl['totalProgress']
} | {
  stepIndex: number
  fileIndex: number
  type: 'file-end'
}
type stepEndT = {
  stepIndex: number
}
interface KartPatcher {
  emit (event: 'start', data: patcherStartT): boolean
  emit (event: 'end'): boolean
  emit (event: 'step-start', data: stepStartT): boolean
  emit (event: 'step-update', data: stepUpdate): boolean
  emit (event: 'step-end', data: stepEndT): boolean
  emit (event: 'error', error: Error): boolean
}
export interface IKartPatcherEventCallback {
  on (event: 'start', listener: (data: patcherStartT) => void): void
  on (event: 'end', listener: () => void): void
  on (event: 'step-start', listener: (data: stepStartT) => void): void
  on (event: 'step-update', listener: (data: stepUpdate) => void): void
  on (event: 'step-end', listener: (data: stepEndT) => void): void
  on (event: 'error', listener: (error: Error) => void): void
}

const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

// eslint-disable-next-line no-redeclare
class KartPatcher extends EventEmitter {
  remoteUrl: string
  tempDir = 'Download'
  tempPath: string

  patchFiles: PatchFile[] = []
  downloadQueue: LocalFile[] = []

  patchFileIndexMap = new Map<string, number>()

  constructor (
    readonly patchUrl: string,
    readonly version: number,
    readonly localPath: string
  ) {
    super()
    this.remoteUrl = resolveUrl(patchUrl, version.toString())
    this.tempPath = resolve(localPath, this.tempDir)
  }

  async run () {
    const steps = [
      this.processPatchInfo,
      this.checkLocal,
      this.download,
      this.extract,
      this.apply,
      this.validate
    ]
    this.emit('start', {
      count: steps.length
    })
    for (const index in steps) {
      await steps[index].call(this, Number(index))
      await delay(300)
    }
    this.emit('end')
  }

  async processPatchInfo (stepIndex: number) {
    this.emit('step-start', {
      stepIndex,
      name: 'processPatchInfo',
      indeterminate: true
    })

    const url = resolveUrl(this.remoteUrl, 'files.nfo2')
    const response = await fetch(url)
    const data = await response.text()
    // 200 = Kart
    // 300 = CA, Kart zip
    // 400 = Combat arms
    if (!data.startsWith('NFO200')) {
      throw new Error('INVALID_PATCH_INFO_FILE', {
        cause: data
      })
    }

    this.patchFiles = data
      .trim()
      .split('\r\n')
      .slice(1)
      .map((line) => {
        const info = line
          .split(',')
          .map((text) => {
            const unquotedText = text.slice(1, -1)
            const value = isNaN(Number(unquotedText))
              ? unquotedText.replace(/\\/g, '/')
              : Number(unquotedText)
            return value
          }) as ConstructorParameters<typeof PatchFile>
        return new PatchFile(...info)
      })
      // .slice(0, 200) // FOR DEBUGGING ONLY

    this.emit('step-end', {
      stepIndex
    })
  }

  async checkLocal (stepIndex: number) {
    const fileCount = this.patchFiles.length

    this.emit('step-start', {
      stepIndex,
      name: 'checkLocal',
      count: fileCount
    })

    for (let i = 0; i < fileCount; i++) {
      const patchFile = this.patchFiles[i]
      const localFile = new LocalFile(this.localPath, patchFile.path, this.tempDir)

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        file: localFile.basename
      })

      const succeed = await localFile.loadMeta()
      if (succeed) {
        if (localFile.crc === patchFile.crc) {
          continue
        }
        if (localFile.crc === patchFile.delta1TargetCrc) {
          localFile.target = 'delta1'
        } else if (localFile.crc === patchFile.delta2TargetCrc) {
          localFile.target = 'delta2'
        }
      }

      this.patchFileIndexMap.set(patchFile.path, i)
      this.downloadQueue.push(localFile)
    }

    this.emit('step-end', {
      stepIndex
    })
  }

  async download (stepIndex: number) {
    const fileCount = this.downloadQueue.length

    this.emit('step-start', {
      stepIndex,
      name: 'download',
      count: fileCount
    })

    await rm(this.tempPath, {
      recursive: true,
      force: true
    })

    for (let i = 0; i < fileCount; i++) {
      const file = this.downloadQueue[i]

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        file: file.basename,
        type: 'file-start'
      })

      const localPath = file.getDownloadPath()
      await this.createDirectory(localPath)

      const downloader =
        new EasyDl(
          resolveUrl(this.remoteUrl, file.getRawFilePath()),
          localPath,
          {
            connections: 8,
            maxRetry: 5
          }
        )
          .on('metadata', (meta) => {
            this.emit('step-update', {
              stepIndex,
              fileIndex: i,
              type: 'file-meta',
              meta
            })
          })
          .on('progress', (data) => {
            this.emit('step-update', {
              stepIndex,
              fileIndex: i,
              type: 'file-download',
              progress: data.total
            })
          })
          .on('build', (progress) => {
            this.emit('step-update', {
              stepIndex,
              fileIndex: i,
              type: 'file-build',
              progress
            })
          })
          .on('end', () => {
            this.emit('step-update', {
              stepIndex,
              fileIndex: i,
              type: 'file-build',
              progress: {
                percentage: 100
              }
            })
          })
          .on('error', (error) => {
            this.emit('error', error)
          })
      await downloader.wait()

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        type: 'file-end'
      })
    }

    this.emit('step-end', {
      stepIndex
    })
  }

  async extract (stepIndex: number) {
    const fileCount = this.downloadQueue.length

    this.emit('step-start', {
      stepIndex,
      name: 'extract',
      count: fileCount
    })

    for (let i = 0; i < fileCount; i++) {
      const file = this.downloadQueue[i]

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        file: file.basename
      })

      if (file.target === 'full') {
        const downloaded = file.getDownloadPath()
        await this.ungzip(downloaded)
        await rm(downloaded)
        file.extracted = true
      }
    }

    this.emit('step-end', {
      stepIndex
    })
  }

  async apply (stepIndex: number) {
    const fileCount = this.downloadQueue.length

    this.emit('step-start', {
      stepIndex,
      name: 'apply',
      count: fileCount
    })

    for (let i = 0; i < fileCount; i++) {
      const file = this.downloadQueue[i]

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        file: file.basename
      })

      await move(file.getDownloadPath(), file.path, {
        overwrite: true
      })
      await file.loadMeta()
    }

    this.emit('step-end', {
      stepIndex
    })
  }

  async validate (stepIndex: number) {
    const fileCount = this.downloadQueue.length

    this.emit('step-start', {
      stepIndex,
      name: 'validate',
      count: fileCount
    })

    for (let i = 0; i < fileCount; i++) {
      const file = this.downloadQueue[i]

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        file: file.basename
      })

      const patchIndex = this.patchFileIndexMap.get(file.filePath)
      if (patchIndex === undefined) {
        continue
      }

      const patchFile = this.patchFiles[patchIndex]
      if (!existsSync(file.path)) {
        throw new Error('FILE_NOT_EXIST', {
          cause: file.filePath
        })
      }
      if (file.target !== 'full') {
        continue
      }
      // Check file CRC
      if (file.crc !== patchFile.crc) {
        throw new Error('FILE_CRC_MISMATCH', {
          cause: file.filePath
        })
      }
      // Restore file modification time
      await utimes(file.path, {
        mtime: this.filetimeToUnix(patchFile.dwHighDateTime, patchFile.dwLowDateTime)
      })
    }

    this.emit('step-end', {
      stepIndex
    })
  }

  private async createDirectory (path: string) {
    const dir = dirname(path)
    return await mkdir(dir, {
      recursive: true
    })
  }

  private ungzip (filePath: string) {
    return new Promise((resolve) => {
      const src = createReadStream(filePath)
      const destination = createWriteStream(filePath.replace('.gz', ''))

      src
        .pipe(createGunzip())
        .pipe(destination)

      destination.on('close', resolve)
    })
  }

  private filetimeToUnix (high: number, low: number) {
    // Diff between Windows epoch 1601-01-01 00:00:00 & Unix epoch 1970-01-01 00:00:00
    const diff = BigInt(11644473600000)
    const filetime = BigInt(high * Math.pow(2, 32) - low) / BigInt(10000)
    const timestamp = filetime - diff
    return Number(timestamp)
  }
}

export default KartPatcher
