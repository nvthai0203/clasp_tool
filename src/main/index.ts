import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { spawn } from 'child_process'
import { ClaspRunner } from './claspRunner'
import { getSettings, rememberFolder, rememberScriptId, setSettings } from './store'
import type {
  AppSettings,
  ClaspAuthUserResult,
  ClaspCheckResult,
  ClaspRunRequest,
  ProjectInfo
} from '../shared/types'

let mainWindow: BrowserWindow | null = null
const runner = new ClaspRunner()
const isDev = !app.isPackaged

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    show: false,
    title: 'Clasp Tool',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function checkClasp(): Promise<ClaspCheckResult> {
  return new Promise((resolve) => {
    const child = spawn('clasp', ['--version'], {
      shell: true,
      windowsHide: true
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      resolve({ ok: false, error: error.message })
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true, version: stdout.trim() || stderr.trim() })
      } else {
        resolve({
          ok: false,
          error: stderr.trim() || stdout.trim() || `clasp thoát với mã ${code}`
        })
      }
    })
  })
}

function getAuthorizedUser(userName?: string): Promise<ClaspAuthUserResult> {
  return new Promise((resolve) => {
    const args = ['show-authorized-user', '--json']
    const trimmed = userName?.trim()
    if (trimmed && trimmed !== 'default') {
      args.unshift('--user', trimmed)
    }

    const child = spawn('clasp', args, {
      shell: true,
      windowsHide: true
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      resolve({ ok: false, loggedIn: false, error: error.message })
    })

    child.on('close', (code) => {
      const text = stdout.trim() || stderr.trim()
      if (!text) {
        resolve({
          ok: false,
          loggedIn: false,
          error: code === 0 ? 'Không có output từ clasp' : `clasp thoát với mã ${code}`
        })
        return
      }

      try {
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}')
        const jsonText =
          jsonStart >= 0 && jsonEnd > jsonStart ? text.slice(jsonStart, jsonEnd + 1) : text
        const parsed = JSON.parse(jsonText) as {
          loggedIn?: boolean
          email?: string | null
        }
        const loggedIn = Boolean(parsed.loggedIn)
        const email =
          typeof parsed.email === 'string' && parsed.email.trim()
            ? parsed.email.trim()
            : undefined
        resolve({ ok: true, loggedIn, email })
      } catch {
        const lower = text.toLowerCase()
        if (lower.includes('not logged in') || lower.includes('chưa đăng nhập')) {
          resolve({ ok: true, loggedIn: false })
          return
        }
        resolve({
          ok: false,
          loggedIn: false,
          error: stderr.trim() || stdout.trim() || `clasp thoát với mã ${code}`
        })
      }
    })
  })
}

function readProject(folder: string): ProjectInfo {
  if (!folder) {
    return { exists: false }
  }

  const claspPath = join(folder, '.clasp.json')
  if (!existsSync(claspPath)) {
    return { exists: false }
  }

  try {
    const raw = JSON.parse(readFileSync(claspPath, 'utf8')) as Record<string, unknown>
    return {
      exists: true,
      scriptId: typeof raw.scriptId === 'string' ? raw.scriptId : undefined,
      rootDir: typeof raw.rootDir === 'string' ? raw.rootDir : undefined,
      projectId: typeof raw.projectId === 'string' ? raw.projectId : undefined,
      raw
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { exists: false, raw: { parseError: message } }
  }
}

type OpenEditorResult = { ok: true } | { ok: false; error: string }

function openInEditorCli(
  folder: string,
  options: { command: string; appName: string; installHint: string }
): Promise<OpenEditorResult> {
  if (!folder || !existsSync(folder)) {
    return Promise.resolve({ ok: false, error: 'Thư mục không tồn tại.' })
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: OpenEditorResult): void => {
      if (settled) {
        return
      }
      settled = true
      resolve(result)
    }

    try {
      const child = spawn(options.command, [folder], {
        shell: true,
        windowsHide: true,
        detached: true,
        stdio: 'ignore'
      })

      child.once('error', (error) => {
        finish({
          ok: false,
          error: `Không mở được ${options.appName}: ${error.message}. ${options.installHint}`
        })
      })

      child.unref()
      setImmediate(() => finish({ ok: true }))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      finish({
        ok: false,
        error: `Không mở được ${options.appName}: ${message}. ${options.installHint}`
      })
    }
  })
}

function registerIpc(): void {
  ipcMain.handle('clasp:check', async () => checkClasp())

  ipcMain.handle('clasp:authorizedUser', async (_event, userName?: string) =>
    getAuthorizedUser(userName)
  )

  ipcMain.handle('dialog:selectFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    const folder = result.filePaths[0]
    rememberFolder(folder)
    return folder
  })

  ipcMain.handle('project:read', (_event, folder: string) => readProject(folder))

  ipcMain.handle('shell:openFolder', async (_event, folder: string) => {
    if (!folder || !existsSync(folder)) {
      return false
    }
    await shell.openPath(folder)
    return true
  })

  ipcMain.handle('shell:openInCursor', (_event, folder: string) =>
    openInEditorCli(folder, {
      command: 'cursor',
      appName: 'Cursor',
      installHint:
        `Trong Cursor mở Command Palette → “Shell Command: Install 'cursor' command in PATH”.`
    })
  )

  ipcMain.handle('shell:openInVSCode', (_event, folder: string) =>
    openInEditorCli(folder, {
      command: 'code',
      appName: 'VS Code',
      installHint:
        `Trong VS Code mở Command Palette → “Shell Command: Install 'code' command in PATH”.`
    })
  )

  ipcMain.handle('settings:get', () => getSettings())

  ipcMain.handle('settings:set', (_event, partial: Partial<AppSettings>) => setSettings(partial))

  ipcMain.handle('settings:rememberFolder', (_event, folder: string) => rememberFolder(folder))

  ipcMain.handle('settings:rememberScriptId', (_event, scriptId: string) =>
    rememberScriptId(scriptId)
  )

  ipcMain.handle('clasp:run', (_event, request: ClaspRunRequest) =>
    runner.run(request, () => mainWindow)
  )

  ipcMain.handle('clasp:cancel', () => runner.cancel())

  ipcMain.handle('clasp:isRunning', () => runner.isRunning())
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.clasp.tool')
  }

  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
