import type { ProjectInfo } from '../../../shared/types'

interface Props {
  folder: string
  recentFolders: string[]
  project: ProjectInfo | null
  disabled?: boolean
  onSelect: () => void
  onPickRecent: (folder: string) => void
  onOpen: () => void
}

export function FolderPicker({
  folder,
  recentFolders,
  project,
  disabled,
  onSelect,
  onPickRecent,
  onOpen
}: Props): JSX.Element {
  return (
    <section className="panel">
      <h2>Thư mục làm việc</h2>
      <div className="stack">
        <div className="row">
          <input
            className="field"
            value={folder}
            readOnly
            placeholder="Chưa chọn thư mục..."
          />
          <button className="btn btn-primary" onClick={onSelect} disabled={disabled}>
            Chọn folder
          </button>
          <button className="btn" onClick={onOpen} disabled={!folder || disabled}>
            Mở
          </button>
        </div>

        {recentFolders.length > 0 && (
          <div className="row">
            <span className="label">Gần đây:</span>
            <select
              className="field"
              value=""
              disabled={disabled}
              onChange={(e) => {
                if (e.target.value) {
                  onPickRecent(e.target.value)
                }
              }}
            >
              <option value="">Chọn thư mục gần đây...</option>
              {recentFolders.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="meta">
          {project?.exists ? (
            <>
              <span className="badge ok">Có .clasp.json</span>{' '}
              Script ID: <strong>{project.scriptId || '(không có)'}</strong>
            </>
          ) : folder ? (
            <span className="badge">Chưa có .clasp.json — dùng Clone hoặc Create</span>
          ) : (
            <span className="hint">Chọn thư mục trước khi chạy lệnh project.</span>
          )}
        </div>
      </div>
    </section>
  )
}
