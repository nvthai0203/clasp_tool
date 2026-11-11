import Store from 'electron-store'
import type { AppSettings } from '../shared/types'

const defaults: AppSettings = {
  lastFolder: '',
  recentFolders: [],
  recentScriptIds: [],
  userName: 'default'
}

export const store = new Store<AppSettings>({
  name: 'settings',
  defaults
})

export function getSettings(): AppSettings {
  return {
    lastFolder: store.get('lastFolder'),
    recentFolders: store.get('recentFolders'),
    recentScriptIds: store.get('recentScriptIds'),
    userName: store.get('userName')
  }
}

export function setSettings(partial: Partial<AppSettings>): AppSettings {
  if (partial.lastFolder !== undefined) {
    store.set('lastFolder', partial.lastFolder)
  }
  if (partial.recentFolders !== undefined) {
    store.set('recentFolders', partial.recentFolders.slice(0, 10))
  }
  if (partial.recentScriptIds !== undefined) {
    store.set('recentScriptIds', partial.recentScriptIds.slice(0, 10))
  }
  if (partial.userName !== undefined) {
    store.set('userName', partial.userName)
  }
  return getSettings()
}

export function rememberFolder(folder: string): AppSettings {
  const recent = [folder, ...store.get('recentFolders').filter((f) => f !== folder)].slice(0, 10)
  return setSettings({ lastFolder: folder, recentFolders: recent })
}

export function rememberScriptId(scriptId: string): AppSettings {
  const recent = [scriptId, ...store.get('recentScriptIds').filter((id) => id !== scriptId)].slice(
    0,
    10
  )
  return setSettings({ recentScriptIds: recent })
}
