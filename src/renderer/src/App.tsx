import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ContextBar } from './components/ContextBar'
import { CommandPanel, type CommandOptions } from './components/CommandPanel'
import { LogConsole, type LogLine } from './components/LogConsole'
import { extractScriptId } from './utils/scriptId'
import type {
  AppSettings,
  ClaspAuthUserResult,
  ClaspCheckResult,
  ClaspExitEvent,
  ProjectInfo
} from '../../shared/types'

const defaultOptions: CommandOptions = {
  scriptId: '',
  versionNumber: '',
  createTitle: '',
  createType: 'standalone',
  versionDescription: '',
  deploymentId: '',
  deployDescription: '',
  functionName: '',
  customArgs: '',
  force: false,
  watch: false,
  userName: 'default'
}

export default function App(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [folder, setFolder] = useState('')
  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [options, setOptions] = useState<CommandOptions>(defaultOptions)
  const [claspInfo, setClaspInfo] = useState<ClaspCheckResult | null>(null)
  const [authUser, setAuthUser] = useState<ClaspAuthUserResult | null>(null)
  const [running, setRunning] = useState(false)
  const [lines, setLines] = useState<LogLine[]>([])
  const [lastExit, setLastExit] = useState<ClaspExitEvent | null>(null)
  const [lineId, setLineId] = useState(0)
  const folderRef = useRef(folder)
  folderRef.current = folder
  const userNameRef = useRef(options.userName)
  userNameRef.current = options.userName
  const lastArgsRef = useRef<string[] | null>(null)

  const appendLog = useCallback((stream: LogLine['stream'], text: string) => {
    setLineId((prev) => {
      const id = prev + 1
      setLines((linesPrev) => [...linesPrev, { id, stream, text }])
      return id
    })
  }, [])

  const refreshProject = useCallback(async (targetFolder: string) => {
    if (!targetFolder) {
      setProject(null)
      return
    }
    const info = await window.api.readProject(targetFolder)
    setProject(info)
    if (info.scriptId) {
      setOptions((prev) => ({ ...prev, scriptId: info.scriptId || prev.scriptId }))
    }
  }, [])

  const refreshAuthUser = useCallback(async (userName?: string) => {
    const result = await window.api.getAuthorizedUser(userName ?? userNameRef.current)
    setAuthUser(result)
  }, [])

  useEffect(() => {
    let disposed = false

    async function boot(): Promise<void> {
      const [saved, check] = await Promise.all([
        window.api.getSettings(),
        window.api.checkClasp()
      ])
      if (disposed) {
        return
      }
      setSettings(saved)
      setClaspInfo(check)
      const userName = saved.userName || 'default'
      setOptions((prev) => ({ ...prev, userName }))
      if (saved.lastFolder) {
        setFolder(saved.lastFolder)
        await refreshProject(saved.lastFolder)
      }
      if (check.ok) {
        const auth = await window.api.getAuthorizedUser(userName)
        if (!disposed) {
          setAuthUser(auth)
        }
      }
    }

    void boot()

    const offLog = window.api.onClaspLog((event) => {
      appendLog(event.stream, event.text)
    })
    const offExit = window.api.onClaspExit((event) => {
      setRunning(false)
      setLastExit(event)
      appendLog(
        'system',
        event.cancelled
          ? '\n[Đã hủy lệnh]\n'
          : `\n[Kết thúc — code ${event.code ?? 'null'}]\n`
      )
      const currentFolder = folderRef.current
      if (currentFolder) {
        void refreshProject(currentFolder)
      }
      const cmd = lastArgsRef.current?.[0]
      if (cmd === 'login' || cmd === 'logout') {
        void refreshAuthUser()
      }
      lastArgsRef.current = null
    })

    return () => {
      disposed = true
      offLog()
      offExit()
    }
  }, [appendLog, refreshProject, refreshAuthUser])

  useEffect(() => {
    if (!claspInfo?.ok) {
      return
    }
    const handle = window.setTimeout(() => {
      void refreshAuthUser(options.userName)
    }, 250)
    return () => window.clearTimeout(handle)
  }, [options.userName, claspInfo?.ok, refreshAuthUser])

  const updateOptions = (partial: Partial<CommandOptions>): void => {
    setOptions((prev) => {
      const next = { ...prev, ...partial }
      if (partial.userName !== undefined && settings) {
        void window.api.setSettings({ userName: partial.userName }).then(setSettings)
      }
      return next
    })
  }

  const handleSelectFolder = async (): Promise<void> => {
    const selected = await window.api.selectFolder()
    if (!selected) {
      return
    }
    setFolder(selected)
    const saved = await window.api.rememberFolder(selected)
    setSettings(saved)
    await refreshProject(selected)
  }

  const handlePickRecentFolder = async (path: string): Promise<void> => {
    setFolder(path)
    const saved = await window.api.rememberFolder(path)
    setSettings(saved)
    await refreshProject(path)
  }

  const handleScriptIdChange = (value: string): void => {
    updateOptions({ scriptId: value })
  }

  const runClasp = async (args: string[], confirmMessage?: string): Promise<void> => {
    if (!folder) {
      appendLog('stderr', 'Chưa chọn thư mục làm việc.\n')
      return
    }
    if (running) {
      appendLog('stderr', 'Đang có lệnh chạy. Hãy hủy trước.\n')
      return
    }
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return
    }

    const resolvedArgs = [...args]
    const scriptId = extractScriptId(options.scriptId)
    if (resolvedArgs[0] === 'clone' && scriptId) {
      resolvedArgs[1] = scriptId
      setOptions((prev) => ({ ...prev, scriptId }))
    }

    lastArgsRef.current = resolvedArgs
    setLastExit(null)
    setRunning(true)
    const result = await window.api.runClasp({
      args: resolvedArgs,
      cwd: folder,
      userName: options.userName
    })
    if (!result.started) {
      setRunning(false)
      lastArgsRef.current = null
      appendLog('stderr', `${result.error || 'Không khởi chạy được clasp'}\n`)
    }
  }

  const copyLog = async (): Promise<void> => {
    const text = lines.map((line) => line.text).join('')
    await navigator.clipboard.writeText(text)
  }

  const recentFolders = useMemo(() => settings?.recentFolders ?? [], [settings])

  return (
    <div className="app">
      {claspInfo && !claspInfo.ok && (
        <div className="banner">
          Không tìm thấy clasp CLI. Cài bằng <code>npm i -g @google/clasp</code>
          {claspInfo.error ? ` — ${claspInfo.error}` : ''}
        </div>
      )}

      <ContextBar
        claspVersion={claspInfo?.ok ? claspInfo.version ?? null : null}
        folder={folder}
        recentFolders={recentFolders}
        project={project}
        scriptId={options.scriptId}
        disabled={running}
        onSelectFolder={() => void handleSelectFolder()}
        onPickRecentFolder={(path) => void handlePickRecentFolder(path)}
        onOpenFolder={() => void window.api.openFolder(folder)}
        onOpenInCursor={() => {
          void (async () => {
            const result = await window.api.openInCursor(folder)
            if (!result.ok) {
              appendLog('stderr', `${result.error}\n`)
            } else {
              appendLog('system', `Đã mở Cursor: ${folder}\n`)
            }
          })()
        }}
        onOpenInVSCode={() => {
          void (async () => {
            const result = await window.api.openInVSCode(folder)
            if (!result.ok) {
              appendLog('stderr', `${result.error}\n`)
            } else {
              appendLog('system', `Đã mở VS Code: ${folder}\n`)
            }
          })()
        }}
        onScriptIdChange={handleScriptIdChange}
      />

      <div className="workspace">
        <CommandPanel
          hasFolder={Boolean(folder)}
          hasProject={Boolean(project?.exists)}
          running={running}
          options={options}
          authUser={authUser}
          onChange={updateOptions}
          onRun={(args, confirmMessage) => void runClasp(args, confirmMessage)}
        />
        <LogConsole
          lines={lines}
          running={running}
          lastExit={lastExit}
          onClear={() => {
            setLines([])
            setLastExit(null)
          }}
          onCopy={() => void copyLog()}
          onCancel={() => void window.api.cancelClasp()}
        />
      </div>
    </div>
  )
}
