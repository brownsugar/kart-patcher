import { EventEmitter } from 'events'
import { existsSync, createReadStream, createWriteStream } from 'fs'
import { mkdir, rm } from 'fs/promises'
import { resolve, dirname } from 'path'
import { promisify } from 'util'
import { execFile } from 'child_process'
import { createGunzip } from 'zlib'
import { move } from 'fs-extra'
import EasyDl from 'easydl'
import checkDiskSpace from 'check-disk-space'
import log from 'electron-log'
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
  | 'checkDisk'
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
  size?: number
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
} | {
  stepIndex: number
  type: 'step-meta'
  indeterminate: boolean
}
type stepEndT = {
  stepIndex: number
}
type stepErrorT = {
  code: 'INVALID_PATCH_INFO_FILE'
} | {
  code: 'INSUFFICIENT_DISK_SPACE'
  detail: {
    free: number
    estimated: number
  }
} | {
  code: 'DOWNLOAD_ERROR'
  detail: Error
} | {
  code: 'FILE_NOT_EXIST'
  detail: {
    file: string
  }
} | {
  code: 'FILE_CRC_MISMATCH'
  detail: {
    file: string
  }
}
interface KartPatcher {
  emit (event: 'start', data: patcherStartT): boolean
  emit (event: 'end'): boolean
  emit (event: 'step-start', data: stepStartT): boolean
  emit (event: 'step-update', data: stepUpdate): boolean
  emit (event: 'step-end', data: stepEndT): boolean
  emit (event: 'error', error: stepErrorT): boolean
}
interface IKartPatcherOptions {
  mode?: 'install' | 'update' | 'repair'
  deltaMode?: boolean
}
export interface IKartPatcherEventCallback {
  on (event: 'start', listener: (data: patcherStartT) => void): void
  on (event: 'end', listener: () => void): void
  on (event: 'step-start', listener: (data: stepStartT) => void): void
  on (event: 'step-update', listener: (data: stepUpdate) => void): void
  on (event: 'step-end', listener: (data: stepEndT) => void): void
  on (event: 'error', listener: (error: stepErrorT) => void): void
}

const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

class PatchError extends Error {
  cause: stepErrorT

  constructor (error: stepErrorT) {
    super(error.code)
    this.name = 'PatchError'
    this.cause = error
  }
}

class KartPatcher extends EventEmitter {
  remoteUrl: string
  tempDir = 'Download'
  tempPath: string

  patchFiles: PatchFile[] = []
  downloadQueue: {
    localFile: LocalFile
    patchFile: PatchFile
  }[] = []

  constructor (
    readonly patchUrl: string,
    readonly version: number,
    readonly localPath: string,
    readonly options: IKartPatcherOptions & ConstructorParameters<typeof EasyDl>[2] = {}
  ) {
    super()
    this.remoteUrl = resolveUrl(patchUrl, version.toString())
    this.tempPath = resolve(localPath, this.tempDir)
  }

  async run () {
    try {
      const steps = [
        this.processPatchInfo,
        this.checkLocal,
        this.checkDisk,
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
    } catch (e) {
      if (e instanceof PatchError) {
        this.emit('error', e.cause)
        log.debug('[KartPatcher][PatchError]', e)
      } else
        log.debug('[KartPatcher][UnhandledError]', e)
    }
  }

  async processPatchInfo (stepIndex: number) {
    this.emit('step-start', {
      stepIndex,
      name: 'processPatchInfo',
      indeterminate: true
    })

    const url = resolveUrl(this.remoteUrl, 'files.nfo2')
    const data = await fetch(url)
    // 200 = Kart
    // 300 = CA, Kart zip
    // 400 = Combat arms
    if (!data.startsWith('NFO200')) {
      throw new PatchError({
        code: 'INVALID_PATCH_INFO_FILE'
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
        if (localFile.crc === patchFile.crc)
          continue

        if (this.options.deltaMode) {
          if (localFile.crc === patchFile.delta1TargetCrc)
            localFile.target = 'delta1'
          else if (localFile.crc === patchFile.delta2TargetCrc)
            localFile.target = 'delta2'
        }
      }

      this.downloadQueue.push({
        localFile,
        patchFile
      })
    }

    this.emit('step-end', {
      stepIndex
    })
  }

  async checkDisk (stepIndex: number) {
    this.emit('step-start', {
      stepIndex,
      name: 'checkDisk',
      indeterminate: true
    })

    const estimatedSize = this.downloadQueue.reduce((sum, { localFile, patchFile }) => {
      if (localFile.target === 'full')
        sum += patchFile.sizeGzipped + patchFile.size
      else if (localFile.target === 'delta1')
        sum += patchFile.delta1Size
      else if (localFile.target === 'delta2')
        sum += patchFile.delta2Size
      return sum
    }, 0)
    const diskSpace = await checkDiskSpace(this.localPath)
    if (diskSpace.free < estimatedSize) {
      throw new PatchError({
        code: 'INSUFFICIENT_DISK_SPACE',
        detail: {
          free: diskSpace.free,
          estimated: estimatedSize
        }
      })
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
      const { localFile, patchFile } = this.downloadQueue[i]

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        file: localFile.basename,
        type: 'file-start',
        size: localFile.target === 'full'
          ? patchFile.sizeGzipped
          : (
            localFile.target === 'delta1'
              ? patchFile.delta1Size
              : patchFile.delta2Size
          )
      })

      const localPath = localFile.getDownloadPath()
      await this.createDirectory(localPath)

      const downloader =
        new EasyDl(
          resolveUrl(this.remoteUrl, localFile.getRawFilePath()),
          localPath,
          {
            connections: this.options.connections,
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
            throw new PatchError({
              code: 'DOWNLOAD_ERROR',
              detail: error
            })
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
      const { localFile } = this.downloadQueue[i]

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        file: localFile.basename
      })

      if (localFile.target !== 'full')
        continue

      const downloaded = localFile.getDownloadPath()
      await this.ungzip(downloaded)
      await rm(downloaded)
      localFile.extracted = true
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

    let nativePatchNeeded = false
    for (let i = 0; i < fileCount; i++) {
      const { localFile } = this.downloadQueue[i]

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        file: localFile.basename
      })

      await move(localFile.getDownloadPath(), localFile.getDestinationPath(), {
        overwrite: true
      })

      if (localFile.target !== 'full')
        nativePatchNeeded = true
    }

    await rm(this.tempPath, {
      recursive: true,
      force: true
    })

    this.emit('step-update', {
      stepIndex,
      type: 'step-meta',
      indeterminate: true
    })

    if (nativePatchNeeded && this.options.mode !== 'install' && this.options.deltaMode) {
      const patcherExecutable = resolve(this.localPath, 'Patcher.exe')
      if (existsSync(patcherExecutable)) {
        const pathArg = `'${this.localPath}'`
        const execFileAsync = promisify(execFile)
        await execFileAsync(patcherExecutable, [
          '\'1\'',
          '\'0\'',
          `'${this.remoteUrl}'`,
          pathArg,
          pathArg
        ])
      }
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
      const { localFile, patchFile } = this.downloadQueue[i]

      this.emit('step-update', {
        stepIndex,
        fileIndex: i,
        file: localFile.basename
      })

      if (!existsSync(localFile.path)) {
        throw new PatchError({
          code: 'FILE_NOT_EXIST',
          detail: {
            file: localFile.filePath
          }
        })
      }

      // Check file CRC
      await localFile.loadMeta()
      if (localFile.crc !== patchFile.crc) {
        throw new PatchError({
          code: 'FILE_CRC_MISMATCH',
          detail: {
            file: localFile.filePath
          }
        })
      }
      // Restore file modification time
      const { utimes } = require('utimes')
      await utimes(localFile.path, {
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
