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
          className={`btn ${selectPrimary ? 'btn-primary' : ''}`}
          onClick={onSelect}
          disabled={disabled}
        >
          Chọn folder
        </button>
      </div>

      <div className="row">
        <button className="btn" onClick={onOpen} disabled={!folder || disabled}>
          Mở Explorer
        </button>
        <button className="btn" onClick={onOpenInCursor} disabled={!folder || disabled}>
          Mở Cursor
        </button>
        <button className="btn" onClick={onOpenInVSCode} disabled={!folder || disabled}>
          Mở VS Code
        </button>
        {recentFolders.length > 0 && (
          <select
            className="field"
            value=""
            disabled={disabled}
            aria-label="Thư mục gần đây"
            onChange={(e) => {
              if (e.target.value) {
                onPickRecent(e.target.value)
              }
            }}
          >
            <option value="">Gần đây...</option>
            {recentFolders.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
