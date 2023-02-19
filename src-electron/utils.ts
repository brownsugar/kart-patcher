import type { Request } from 'node-fetch'

export const resolveUrl = (baseUrl: string, relativeUrl: string) => {
  return relativeUrl
    ? baseUrl.replace(/\/+$/, '') + '/' + relativeUrl.replace(/^\/+/, '')
    : baseUrl
}

export const fetch = (...args: ConstructorParameters<typeof Request>) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))
