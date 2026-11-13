import type { ProjectInfo } from '../../../shared/types'
import { FolderPicker } from './FolderPicker'
import { ScriptIdInput } from './ScriptIdInput'

interface Props {
  title?: string
  claspVersion: string | null
  folder: string
  recentFolders: string[]
  project: ProjectInfo | null
  scriptId: string
  recentScriptIds: string[]
  disabled?: boolean
  onSelectFolder: () => void
  onPickRecentFolder: (folder: string) => void
  onOpenFolder: () => void
  onOpenInCursor: () => void
  onOpenInVSCode: () => void
  onScriptIdChange: (value: string) => void
  onPickRecentScriptId: (id: string) => void
}

function shortenPath(path: string, max = 48): string {
  if (!path || path.length <= max) {
    return path
  }
  const parts = path.replace(/\\/g, '/').split('/')
  const leaf = parts[parts.length - 1] || path
  const head = path.slice(0, 12)
  return `${head}…/${leaf}`
}

function shortenId(id: string, max = 28): string {
  if (!id || id.length <= max) {
    return id
  }
  return `${id.slice(0, 10)}…${id.slice(-8)}`
}

export function ContextBar({
  title = 'Clasp Tool',
  claspVersion,
  folder,
  recentFolders,
  project,
  scriptId,
  recentScriptIds,
  disabled,
  onSelectFolder,
  onPickRecentFolder,
  onOpenFolder,
  onOpenInCursor,
  onOpenInVSCode,
  onScriptIdChange,
  onPickRecentScriptId
}: Props): JSX.Element {
  const displayScriptId = project?.scriptId || scriptId

  return (
    <section className="panel context-bar">
      <div className="context-bar-header">
        <strong>{title}</strong>
        {claspVersion ? <span className="badge ok">clasp {claspVersion}</span> : null}
      </div>

      <div className="context-bar-status">
        <div className="context-meta">
          {folder ? (
            <span className="meta" title={folder}>
              <strong>{shortenPath(folder)}</strong>
            </span>
          ) : (
            <span className="hint">Chưa chọn thư mục</span>
          )}
          {folder ? (
            project?.exists ? (
              <span className="badge ok">Có .clasp.json</span>
            ) : (
              <span className="badge">Chưa có project</span>
            )
          ) : null}
          {displayScriptId ? (
            <span className="meta" title={displayScriptId}>
              ID: <strong>{shortenId(displayScriptId)}</strong>
            </span>
          ) : null}
        </div>
      </div>

      <div className="context-bar-controls">
        <FolderPicker
          folder={folder}
          recentFolders={recentFolders}
          disabled={disabled}
          selectPrimary={!folder}
          onSelect={onSelectFolder}
          onPickRecent={onPickRecentFolder}
          onOpen={onOpenFolder}
          onOpenInCursor={onOpenInCursor}
          onOpenInVSCode={onOpenInVSCode}
        />
        <ScriptIdInput
          value={scriptId}
          recentScriptIds={recentScriptIds}
          disabled={disabled}
          onChange={onScriptIdChange}
          onPickRecent={onPickRecentScriptId}
        />
      </div>
    </section>
  )
}
