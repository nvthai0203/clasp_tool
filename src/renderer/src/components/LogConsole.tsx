import { useEffect, useRef } from 'react'
import type { ClaspExitEvent, LogStream } from '../../../shared/types'

export interface LogLine {
  id: number
  stream: LogStream
  text: string
}

interface Props {
  lines: LogLine[]
  running: boolean
  lastExit: ClaspExitEvent | null
  onClear: () => void
  onCopy: () => void
  onCancel: () => void
}

export function LogConsole({
  lines,
  running,
  lastExit,
  onClear,
  onCopy,
  onCancel
}: Props): JSX.Element {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const status = running
    ? 'Đang chạy...'
    : lastExit
      ? lastExit.cancelled
        ? 'Đã hủy'
        : `Thoát: ${lastExit.code ?? 'null'}${lastExit.signal ? ` (${lastExit.signal})` : ''}`
      : 'Sẵn sàng'

  return (
    <section className="panel log-panel">
      <div className="log-toolbar">
        <div className="row">
          <h2 style={{ margin: 0 }}>Log</h2>
          <span className={`badge ${running ? '' : lastExit?.code === 0 ? 'ok' : ''}`}>
            {status}
          </span>
        </div>
        <div className="row">
          <button className="btn" onClick={onCopy} disabled={lines.length === 0}>
            Copy
          </button>
          <button className="btn" onClick={onClear} disabled={lines.length === 0 || running}>
            Clear
          </button>
          <button className="btn btn-danger" onClick={onCancel} disabled={!running}>
            Hủy
          </button>
        </div>
      </div>
      <div className="log-console" aria-live="polite">
        {lines.length === 0 ? (
          <span className="log-line system">Chưa có output. Chạy một lệnh clasp để xem log.</span>
        ) : (
          lines.map((line) => (
            <span key={line.id} className={`log-line ${line.stream}`}>
              {line.text}
            </span>
          ))
        )}
        <div ref={endRef} />
      </div>
    </section>
  )
}
