import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FolderPicker } from './components/FolderPicker'
import { ScriptIdInput } from './components/ScriptIdInput'
import { CommandPanel, type CommandOptions } from './components/CommandPanel'
import { LogConsole, type LogLine } from './components/LogConsole'
import { extractScriptId } from './utils/scriptId'
import type {
  AppSettings,
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
  const [running, setRunning] = useState(false)
  const [lines, setLines] = useState<LogLine[]>([])
  const [lastExit, setLastExit] = useState<ClaspExitEvent | null>(null)
  const [lineId, setLineId] = useState(0)
  const folderRef = useRef(folder)
  folderRef.current = folder

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
      setOptions((prev) => ({ ...prev, userName: saved.userName || 'default' }))
      if (saved.lastFolder) {
        setFolder(saved.lastFolder)
        await refreshProject(saved.lastFolder)
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
    })

    return () => {
      disposed = true
      offLog()
      offExit()
    }
  }, [appendLog, refreshProject])

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

  const handlePickRecentScriptId = (id: string): void => {
    updateOptions({ scriptId: id })
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
      const saved = await window.api.rememberScriptId(scriptId)
      setSettings(saved)
      setOptions((prev) => ({ ...prev, scriptId }))
    }

    setLastExit(null)
    setRunning(true)
    const result = await window.api.runClasp({
      args: resolvedArgs,
      cwd: folder,
      userName: options.userName
    })
    if (!result.started) {
      setRunning(false)
      appendLog('stderr', `${result.error || 'Không khởi chạy được clasp'}\n`)
    }
  }

  const copyLog = async (): Promise<void> => {
    const text = lines.map((line) => line.text).join('')
    await navigator.clipboard.writeText(text)
  }

  const recentFolders = useMemo(() => settings?.recentFolders ?? [], [settings])
  const recentScriptIds = useMemo(() => settings?.recentScriptIds ?? [], [settings])

  return (
    <div className="app">
      {claspInfo && !claspInfo.ok && (
        <div className="banner">
          Không tìm thấy clasp CLI. Cài bằng <code>npm i -g @google/clasp</code>
          {claspInfo.error ? ` — ${claspInfo.error}` : ''}
        </div>
      )}
      {claspInfo?.ok && (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>Clasp Tool</strong>
          <span className="badge ok">clasp {claspInfo.version}</span>
        </div>
      )}

      <div className="topbar">
        <FolderPicker
          folder={folder}
          recentFolders={recentFolders}
          project={project}
          disabled={running}
          onSelect={() => void handleSelectFolder()}
          onPickRecent={(path) => void handlePickRecentFolder(path)}
          onOpen={() => void window.api.openFolder(folder)}
        />
        <ScriptIdInput
          value={options.scriptId}
          recentScriptIds={recentScriptIds}
          disabled={running}
          onChange={handleScriptIdChange}
          onPickRecent={handlePickRecentScriptId}
        />
      </div>

      <div className="workspace">
        <CommandPanel
          hasFolder={Boolean(folder)}
          hasProject={Boolean(project?.exists)}
          running={running}
          options={options}
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
