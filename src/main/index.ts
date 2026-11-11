import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { spawn } from 'child_process'
import { ClaspRunner } from './claspRunner'
import { getSettings, rememberFolder, rememberScriptId, setSettings } from './store'
import type { AppSettings, ClaspCheckResult, ClaspRunRequest, ProjectInfo } from '../shared/types'

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

function registerIpc(): void {
  ipcMain.handle('clasp:check', async () => checkClasp())

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
