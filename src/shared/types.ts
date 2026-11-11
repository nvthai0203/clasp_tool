export interface AppSettings {
  lastFolder: string
  recentFolders: string[]
  recentScriptIds: string[]
  userName: string
}

export interface ProjectInfo {
  exists: boolean
  scriptId?: string
  rootDir?: string
  projectId?: string
  raw?: Record<string, unknown>
}

export interface ClaspCheckResult {
  ok: boolean
  version?: string
  error?: string
}

export interface ClaspRunRequest {
  args: string[]
  cwd: string
  userName?: string
}

export interface ClaspRunResult {
  started: boolean
  error?: string
}

export type LogStream = 'stdout' | 'stderr' | 'system'

export interface ClaspLogEvent {
  stream: LogStream
  text: string
}

export interface ClaspExitEvent {
  code: number | null
  signal: string | null
  cancelled: boolean
}
