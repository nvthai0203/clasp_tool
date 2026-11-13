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
    <div className="stack context-script">
      <div className="row">
        <span className="label">Script ID</span>
        <input
          className="field"
          value={value}
          disabled={disabled}
          placeholder="Dán Script ID hoặc URL script.google.com..."
          onChange={(e) => onChange(e.target.value)}
        />
        {recentScriptIds.length > 0 && (
          <select
            className="field"
            style={{ maxWidth: 180 }}
            value=""
            disabled={disabled}
            aria-label="Script ID gần đây"
            onChange={(e) => {
              if (e.target.value) {
                onPickRecent(e.target.value)
              }
            }}
          >
            <option value="">Gần đây...</option>
            {recentScriptIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="hint">
        Có thể dán URL dạng https://script.google.com/.../projects/&lt;id&gt;/...
      </p>
    </div>
  )
}
