interface Props {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function ScriptIdInput({ value, disabled, onChange }: Props): JSX.Element {
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
      </div>
      <p className="hint">
        Có thể dán URL dạng https://script.google.com/.../projects/&lt;id&gt;/...
      </p>
    </div>
  )
}
