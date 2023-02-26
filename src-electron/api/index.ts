import { contextBridge } from 'electron'
import core from './core'
import store from './store'
import app from './app'
import utils from './utils'

export const initApi = () => {
  const modules = [core, store, app, utils]
  modules.forEach((module) => {
    contextBridge.exposeInMainWorld(module.key, module.api)
  })
}
