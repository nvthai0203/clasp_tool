interface Props {
  value: string
  recentScriptIds: string[]
  disabled?: boolean
  onChange: (value: string) => void
  onPickRecent: (id: string) => void
}

export function ScriptIdInput({
  value,
  recentScriptIds,
  disabled,
  onChange,
  onPickRecent
}: Props): JSX.Element {
  return (
    <section className="panel">
      <h2>Script ID</h2>
      <div className="stack">
        <input
          className="field"
          value={value}
          disabled={disabled}
          placeholder="Dán Script ID hoặc URL script.google.com..."
          onChange={(e) => onChange(e.target.value)}
        />
        {recentScriptIds.length > 0 && (
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
              <option value="">Chọn Script ID gần đây...</option>
              {recentScriptIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="hint">
          Có thể dán URL dạng https://script.google.com/.../projects/&lt;id&gt;/...
        </p>
      </div>
    </section>
  )
}
