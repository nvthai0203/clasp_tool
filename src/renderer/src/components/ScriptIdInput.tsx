import { extractScriptId } from '../utils/scriptId'

interface Props {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function ScriptIdInput({ value, disabled, onChange }: Props): JSX.Element {
  const trimmed = value.trim()
  const extracted = extractScriptId(value)
  const differs = Boolean(extracted && extracted !== trimmed)

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
      {differs ? (
        <p className="hint">
          Sẽ dùng ID <strong>{extracted}</strong>
        </p>
      ) : (
        <p className="hint">Có thể dán URL dạng https://script.google.com/.../projects/&lt;id&gt;/...</p>
      )}
    </div>
  )
}
