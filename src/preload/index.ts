import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import type {
  AppSettings,
  ClaspCheckResult,
  ClaspExitEvent,
  ClaspLogEvent,
  ClaspRunRequest,
  ClaspRunResult,
  ProjectInfo
} from '../shared/types'

const api = {
  checkClasp: (): Promise<ClaspCheckResult> => ipcRenderer.invoke('clasp:check'),
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:selectFolder'),
  readProject: (folder: string): Promise<ProjectInfo> => ipcRenderer.invoke('project:read', folder),
  openFolder: (folder: string): Promise<boolean> => ipcRenderer.invoke('shell:openFolder', folder),
  openInCursor: (
    folder: string
  ): Promise<{ ok: true } | { ok: false; error: string }> =>
    ipcRenderer.invoke('shell:openInCursor', folder),
  openInVSCode: (
    folder: string
  ): Promise<{ ok: true } | { ok: false; error: string }> =>
    ipcRenderer.invoke('shell:openInVSCode', folder),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  setSettings: (partial: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:set', partial),
  rememberFolder: (folder: string): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:rememberFolder', folder),
  rememberScriptId: (scriptId: string): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:rememberScriptId', scriptId),
  runClasp: (request: ClaspRunRequest): Promise<ClaspRunResult> =>
    ipcRenderer.invoke('clasp:run', request),
  cancelClasp: (): Promise<boolean> => ipcRenderer.invoke('clasp:cancel'),
  isClaspRunning: (): Promise<boolean> => ipcRenderer.invoke('clasp:isRunning'),
  onClaspLog: (callback: (event: ClaspLogEvent) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, payload: ClaspLogEvent): void => {
      callback(payload)
    }
    ipcRenderer.on('clasp:log', listener)
    return () => ipcRenderer.removeListener('clasp:log', listener)
  },
  onClaspExit: (callback: (event: ClaspExitEvent) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, payload: ClaspExitEvent): void => {
      callback(payload)
    }
    ipcRenderer.on('clasp:exit', listener)
    return () => ipcRenderer.removeListener('clasp:exit', listener)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ClaspToolApi = typeof api
