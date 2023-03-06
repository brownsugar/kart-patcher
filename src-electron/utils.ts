import http from 'http'

export const resolveUrl = (baseUrl: string, relativeUrl: string) => {
  return relativeUrl
    ? baseUrl.replace(/\/+$/, '') + '/' + relativeUrl.replace(/^\/+/, '')
    : baseUrl
}

export const fetch = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        return reject(new Error(res.statusMessage, {
          cause: res
        }))
      }

      const body: Buffer[] = []
      res.on('data', (chunk) => {
        body.push(chunk)
      })
      res.on('end', () => {
        resolve(Buffer.concat(body).toString())
      })
    })
    req.on('error', (e) => {
      reject(e)
    })
    req.end()
  })
}
