import type { ProjectInfo } from '../../../shared/types'
import { FolderPicker } from './FolderPicker'
import { ScriptIdInput } from './ScriptIdInput'

interface Props {
  claspVersion: string | null
  folder: string
  recentFolders: string[]
  project: ProjectInfo | null
  scriptId: string
  disabled?: boolean
  onSelectFolder: () => void
  onPickRecentFolder: (folder: string) => void
  onOpenFolder: () => void
  onOpenInCursor: () => void
  onOpenInVSCode: () => void
  onScriptIdChange: (value: string) => void
}

export function ContextBar({
  claspVersion,
  folder,
  recentFolders,
  project,
  scriptId,
  disabled,
  onSelectFolder,
  onPickRecentFolder,
  onOpenFolder,
  onOpenInCursor,
  onOpenInVSCode,
  onScriptIdChange
}: Props): JSX.Element {
  return (
    <section className="panel context-bar">
      <div className="context-bar-header">
        <div className="context-bar-status">
          {claspVersion ? (
            <span className="badge ok">clasp {claspVersion}</span>
          ) : (
            <span className="badge bad">Không thấy clasp</span>
          )}
          {folder ? (
            project?.exists ? (
              <span className="badge ok">Có .clasp.json</span>
            ) : (
              <span className="badge">Chưa có project</span>
            )
          ) : (
            <span className="hint">Chưa chọn thư mục</span>
          )}
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
        <ScriptIdInput value={scriptId} disabled={disabled} onChange={onScriptIdChange} />
      </div>
    </section>
  )
}
