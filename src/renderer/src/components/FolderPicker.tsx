import { folderMenuLabel } from '../utils/display'

interface Props {
  folder: string
  recentFolders: string[]
  disabled?: boolean
  selectPrimary?: boolean
  onSelect: () => void
  onPickRecent: (folder: string) => void
  onOpen: () => void
  onOpenInCursor: () => void
  onOpenInVSCode: () => void
}

export function FolderPicker({
  folder,
  recentFolders,
  disabled,
  selectPrimary = false,
  onSelect,
  onPickRecent,
  onOpen,
  onOpenInCursor,
  onOpenInVSCode
}: Props): JSX.Element {
  const inRecent = Boolean(folder && recentFolders.includes(folder))

  return (
    <div className="stack context-folder">
      <div className="row">
        <input
          className="field"
          value={folder}
          readOnly
          placeholder="Chưa chọn thư mục..."
          title={folder || undefined}
        />
        <button
          type="button"
          className={`btn ${selectPrimary ? 'btn-primary' : ''}`}
          onClick={onSelect}
          disabled={disabled}
        >
          Chọn folder
        </button>
      </div>

      <div className="row">
        <button type="button" className="btn" onClick={onOpen} disabled={!folder || disabled}>
          Mở thư mục
        </button>
        <button type="button" className="btn" onClick={onOpenInCursor} disabled={!folder || disabled}>
          Mở với Cursor
        </button>
        <button type="button" className="btn" onClick={onOpenInVSCode} disabled={!folder || disabled}>
          Mở với VS Code
        </button>
        {recentFolders.length > 0 && (
          <select
            className="field recent-select"
            value={inRecent ? folder : ''}
            disabled={disabled}
            aria-label="Thư mục gần đây"
            title={folder || 'Thư mục gần đây'}
            onChange={(e) => {
              if (e.target.value) {
                onPickRecent(e.target.value)
              }
            }}
          >
            <option value="">Gần đây...</option>
            {recentFolders.map((item) => (
              <option key={item} value={item} title={item}>
                {folderMenuLabel(item)}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
