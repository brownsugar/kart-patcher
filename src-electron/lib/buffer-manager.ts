import BufferReader from 'buffer-reader'

class BufferManager extends BufferReader {
  nextBool () {
    return this.nextByte() === 1
  }

  nextByte () {
    return this.nextBuffer(1)[0]
  }

  nextShort (direct = false) {
    const length = this.nextUInt16LE()
    if (direct) {
      return length // The length is the value
    }
    const buffer = this.nextBuffer(length * 2)
    return buffer.readUInt16LE()
  }

  nextStringAuto (ascii = false) {
    const length = this.nextUInt32LE()
    if (!length) {
      return ''
    }
    if (ascii) {
      return this.nextBuffer(length).toString('ascii')
    }
    return this.nextBuffer(length * 2).toString('utf16le')
  }
}

export default BufferManager
