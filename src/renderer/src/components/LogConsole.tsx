import { useEffect, useRef, useState } from 'react'
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
  onCancel: () => void
}

export function LogConsole({ lines, running, lastExit, onClear, onCancel }: Props): JSX.Element {
  const consoleRef = useRef<HTMLDivElement | null>(null)
  const stickRef = useRef(true)
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'err'>('idle')

  const onScroll = (): void => {
    const el = consoleRef.current
    if (!el) {
      return
    }
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    stickRef.current = distance < 48
  }

  useEffect(() => {
    if (!stickRef.current) {
      return
    }
    const el = consoleRef.current
    if (!el) {
      return
    }
    el.scrollTop = el.scrollHeight
  }, [lines])

  useEffect(() => {
    if (copyState === 'idle') {
      return
    }
    const handle = window.setTimeout(() => setCopyState('idle'), 4000)
    return () => window.clearTimeout(handle)
  }, [copyState])

  const copyLog = (): void => {
    const text = lines.map((line) => line.text).join('')
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', 'true')
    area.style.position = 'fixed'
    area.style.top = '0'
    area.style.left = '0'
    area.style.width = '1px'
    area.style.height = '1px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.focus()
    area.select()
    area.setSelectionRange(0, text.length)
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    area.remove()
    if (ok) {
      setCopyState('ok')
      return
    }
    const clipboard = navigator.clipboard
    if (!clipboard?.writeText) {
      setCopyState('err')
      return
    }
    void clipboard.writeText(text).then(
      () => setCopyState('ok'),
      () => setCopyState('err')
    )
  }

  const status = running
    ? 'Đang chạy...'
    : lastExit
      ? lastExit.cancelled
        ? 'Đã hủy'
        : `Thoát: ${lastExit.code ?? 'null'}${lastExit.signal ? ` (${lastExit.signal})` : ''}`
      : 'Sẵn sàng'

  const failed = Boolean(lastExit && (lastExit.cancelled || lastExit.code !== 0))
  const badgeClass = running ? 'badge' : lastExit ? (failed ? 'badge bad' : 'badge ok') : 'badge'

  const copyLabel = copyState === 'ok' ? 'Đã chép' : copyState === 'err' ? 'Không chép được' : 'Copy'

  return (
    <section className="panel log-panel">
      <div className="log-toolbar">
        <div className="row">
          <h2 style={{ margin: 0 }}>Log</h2>
          <span className={badgeClass}>{status}</span>
        </div>
        <div className="row">
          <button
            type="button"
            className="btn"
            onClick={copyLog}
            disabled={lines.length === 0}
          >
            {copyLabel}
          </button>
          {copyState === 'ok' ? <span className="badge ok">Đã chép</span> : null}
          {copyState === 'err' ? <span className="badge bad">Không chép được</span> : null}
          <button type="button" className="btn" onClick={onClear} disabled={lines.length === 0 || running}>
            Clear
          </button>
          <button type="button" className="btn btn-danger" onClick={onCancel} disabled={!running}>
            Hủy
          </button>
        </div>
      </div>
      <div ref={consoleRef} className="log-console" onScroll={onScroll}>
        {lines.length === 0 ? (
          <span className="log-line system">Chưa có output. Chạy một lệnh clasp để xem log.</span>
        ) : (
          lines.map((line) => (
            <span key={line.id} className={`log-line ${line.stream}`}>
              {line.text}
            </span>
          ))
        )}
      </div>
    </section>
  )
}
