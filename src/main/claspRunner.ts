import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { BrowserWindow } from 'electron'
import type { ClaspExitEvent, ClaspLogEvent, ClaspRunRequest, ClaspRunResult } from '../shared/types'

export class ClaspRunner {
  private process: ChildProcessWithoutNullStreams | null = null
  private cancelled = false

  isRunning(): boolean {
    return this.process !== null
  }

  run(request: ClaspRunRequest, getWindow: () => BrowserWindow | null): ClaspRunResult {
    if (this.process) {
      return { started: false, error: 'Đã có lệnh clasp đang chạy. Hãy hủy trước.' }
    }

    if (!request.cwd) {
      return { started: false, error: 'Chưa chọn thư mục làm việc.' }
    }

    const args = [...request.args]
    if (request.userName && request.userName.trim() && request.userName.trim() !== 'default') {
      args.unshift('--user', request.userName.trim())
    }

    this.cancelled = false
    this.emitLog(getWindow, {
      stream: 'system',
      text: `$ clasp ${args.join(' ')}\n  cwd: ${request.cwd}\n`
    })

    try {
      this.process = spawn('clasp', args, {
        cwd: request.cwd,
        shell: true,
        env: { ...process.env },
        windowsHide: true
      })
    } catch (error) {
      this.process = null
      const message = error instanceof Error ? error.message : String(error)
      return { started: false, error: message }
    }

    this.process.stdout.on('data', (chunk: Buffer) => {
      this.emitLog(getWindow, { stream: 'stdout', text: chunk.toString() })
    })

    this.process.stderr.on('data', (chunk: Buffer) => {
      this.emitLog(getWindow, { stream: 'stderr', text: chunk.toString() })
    })

    this.process.on('error', (error) => {
      this.emitLog(getWindow, {
        stream: 'stderr',
        text: `\nKhông chạy được clasp: ${error.message}\n`
      })
      this.finish(getWindow, { code: 1, signal: null, cancelled: this.cancelled })
    })

    this.process.on('close', (code, signal) => {
      this.finish(getWindow, { code, signal, cancelled: this.cancelled })
    })

    return { started: true }
  }

  cancel(): boolean {
    if (!this.process) {
      return false
    }
    this.cancelled = true
    this.process.kill()
    return true
  }

  private finish(getWindow: () => BrowserWindow | null, event: ClaspExitEvent): void {
    this.process = null
    const win = getWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send('clasp:exit', event)
    }
  }

  private emitLog(getWindow: () => BrowserWindow | null, event: ClaspLogEvent): void {
    const win = getWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send('clasp:log', event)
    }
  }
}
