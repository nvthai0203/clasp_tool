import { useState } from 'react'
import { parseCustomArgs } from '../utils/scriptId'

export interface CommandOptions {
  scriptId: string
  versionNumber: string
  createTitle: string
  createType: string
  versionDescription: string
  deploymentId: string
  deployDescription: string
  functionName: string
  customArgs: string
  force: boolean
  watch: boolean
  userName: string
}

interface Props {
  hasFolder: boolean
  hasProject: boolean
  running: boolean
  options: CommandOptions
  onChange: (partial: Partial<CommandOptions>) => void
  onRun: (args: string[], confirmMessage?: string) => void
}

type TabId = 'sync' | 'deploy' | 'other'

function quoteArg(arg: string): string {
  return /\s/.test(arg) ? `"${arg}"` : arg
}

function formatClasp(args: string[]): string {
  return `clasp ${args.map(quoteArg).join(' ')}`
}

export function CommandPanel({
  hasFolder,
  hasProject,
  running,
  options,
  onChange,
  onRun
}: Props): JSX.Element {
  const [tab, setTab] = useState<TabId>('sync')
  const [previewArgs, setPreviewArgs] = useState<string[] | null>(null)

  const busy = running || !hasFolder
  const needProject = running || !hasFolder || !hasProject
  const hasScriptId = Boolean(options.scriptId.trim())
  const hasCreateTitle = Boolean(options.createTitle.trim())

  const clonePrimary = !hasProject && hasScriptId
  const createPrimary = !hasProject && !hasScriptId && hasCreateTitle
  const pushPrimary = hasProject
  const deployPrimary = hasProject

  const setPreview = (args: string[] | null): void => {
    setPreviewArgs(args)
  }

  const previewHandlers = (args: string[]) => ({
    onMouseEnter: () => setPreview(args),
    onFocus: () => setPreview(args),
    onMouseLeave: () => setPreview(null),
    onBlur: () => setPreview(null)
  })

  const buildCloneArgs = (): string[] => {
    const args = ['clone', options.scriptId.trim()]
    if (options.versionNumber.trim()) {
      args.push(options.versionNumber.trim())
    }
    return args
  }

  const buildPushArgs = (): string[] => {
    const args = ['push']
    if (options.force) {
      args.push('--force')
    }
    if (options.watch) {
      args.push('--watch')
    }
    return args
  }

  const buildCreateArgs = (): string[] => [
    'create',
    '--title',
    options.createTitle.trim(),
    '--type',
    options.createType
  ]

  const buildVersionArgs = (): string[] => {
    const args = ['version']
    if (options.versionDescription.trim()) {
      args.push(options.versionDescription.trim())
    }
    return args
  }

  const buildDeployArgs = (): string[] => {
    const args = ['deploy']
    if (options.deployDescription.trim()) {
      args.push('-d', options.deployDescription.trim())
    }
    if (options.deploymentId.trim()) {
      args.push('-i', options.deploymentId.trim())
    }
    return args
  }

  const buildOpenWebAppArgs = (): string[] => {
    const args = ['open-web-app']
    if (options.deploymentId.trim()) {
      args.push(options.deploymentId.trim())
    }
    return args
  }

  const buildCustomArgs = (): string[] => parseCustomArgs(options.customArgs.trim())

  return (
    <section className="panel commands">
      <div className="commands-header">
        <h2>Lệnh clasp</h2>
        <div className="tabs" role="tablist" aria-label="Nhóm lệnh">
          <button
            type="button"
            role="tab"
            className={`tab ${tab === 'sync' ? 'active' : ''}`}
            aria-selected={tab === 'sync'}
            onClick={() => setTab('sync')}
          >
            Đồng bộ
          </button>
          <button
            type="button"
            role="tab"
            className={`tab ${tab === 'deploy' ? 'active' : ''}`}
            aria-selected={tab === 'deploy'}
            onClick={() => setTab('deploy')}
          >
            Deploy
          </button>
          <button
            type="button"
            role="tab"
            className={`tab ${tab === 'other' ? 'active' : ''}`}
            aria-selected={tab === 'other'}
            onClick={() => setTab('other')}
          >
            Khác
          </button>
        </div>
      </div>

      {!hasFolder && (
        <div className="empty-banner">Chọn thư mục ở thanh trên để bật lệnh.</div>
      )}
      {hasFolder && !hasProject && tab === 'sync' && (
        <div className="empty-banner">
          Folder chưa có <code>.clasp.json</code>. Dùng <strong>clone</strong> hoặc{' '}
          <strong>create</strong>.
        </div>
      )}

      <div className="commands-body">
        {tab === 'sync' && (
          <>
            <div className="group">
              <h3>
                Auth <span className="group-sub">Đăng nhập Google</span>
              </h3>
              <div className="stack">
                <div className="row">
                  <span className="label">User (--user)</span>
                  <input
                    className="field"
                    value={options.userName}
                    disabled={running}
                    onChange={(e) => onChange({ userName: e.target.value })}
                    placeholder="default"
                  />
                </div>
                <div className="group-grid">
                  <button
                    className="btn"
                    disabled={busy}
                    {...previewHandlers(['login'])}
                    onClick={() => onRun(['login'])}
                  >
                    login
                  </button>
                  <button
                    className="btn"
                    disabled={busy}
                    {...previewHandlers(['logout'])}
                    onClick={() => onRun(['logout'])}
                  >
                    logout
                  </button>
                </div>
              </div>
            </div>

            <div className="group">
              <h3>
                Project <span className="group-sub">Lấy / đẩy code</span>
              </h3>
              <div className="stack">
                <div className="row">
                  <input
                    className="field"
                    value={options.versionNumber}
                    disabled={running}
                    placeholder="Version (clone, tùy chọn)"
                    onChange={(e) => onChange({ versionNumber: e.target.value })}
                  />
                </div>
                <div className="group-grid">
                  <button
                    className={`btn ${clonePrimary ? 'btn-primary' : ''}`}
                    disabled={busy || !hasScriptId}
                    {...previewHandlers(buildCloneArgs())}
                    onClick={() => onRun(buildCloneArgs())}
                  >
                    clone
                  </button>
                  <button
                    className="btn"
                    disabled={needProject}
                    {...previewHandlers(['pull'])}
                    onClick={() => onRun(['pull'])}
                  >
                    pull
                  </button>
                  <button
                    className={`btn ${pushPrimary ? 'btn-primary' : ''}`}
                    disabled={needProject}
                    {...previewHandlers(buildPushArgs())}
                    onClick={() => {
                      const args = buildPushArgs()
                      onRun(
                        args,
                        options.force
                          ? 'Push với --force có thể ghi đè file remote. Tiếp tục?'
                          : undefined
                      )
                    }}
                  >
                    push
                  </button>
                  <button
                    className="btn"
                    disabled={needProject}
                    {...previewHandlers(['open-container'])}
                    onClick={() => onRun(['open-container'])}
                  >
                    open-container
                  </button>
                  <button
                    className="btn"
                    disabled={busy}
                    {...previewHandlers(['list'])}
                    onClick={() => onRun(['list'])}
                  >
                    list
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={busy || !hasScriptId}
                    {...previewHandlers(['delete', options.scriptId.trim(), '--force'])}
                    onClick={() =>
                      onRun(
                        ['delete', options.scriptId.trim(), '--force'],
                        `Xóa vĩnh viễn script ${options.scriptId.trim()} trên Google?`
                      )
                    }
                  >
                    delete
                  </button>
                </div>
                <div className="checks">
                  <label>
                    <input
                      type="checkbox"
                      checked={options.force}
                      disabled={running}
                      onChange={(e) => onChange({ force: e.target.checked })}
                    />
                    --force
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={options.watch}
                      disabled={running}
                      onChange={(e) => onChange({ watch: e.target.checked })}
                    />
                    --watch
                  </label>
                </div>
                <div className="row">
                  <input
                    className="field"
                    value={options.createTitle}
                    disabled={running}
                    placeholder="Tiêu đề script mới"
                    onChange={(e) => onChange({ createTitle: e.target.value })}
                  />
                  <select
                    className="field"
                    style={{ maxWidth: 140 }}
                    value={options.createType}
                    disabled={running}
                    onChange={(e) => onChange({ createType: e.target.value })}
                  >
                    <option value="standalone">standalone</option>
                    <option value="docs">docs</option>
                    <option value="sheets">sheets</option>
                    <option value="slides">slides</option>
                    <option value="forms">forms</option>
                    <option value="webapp">webapp</option>
                    <option value="api">api</option>
                  </select>
                  <button
                    className={`btn ${createPrimary ? 'btn-primary' : ''}`}
                    disabled={busy || !hasCreateTitle}
                    {...previewHandlers(buildCreateArgs())}
                    onClick={() => onRun(buildCreateArgs())}
                  >
                    create
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'deploy' && (
          <div className="group">
            <h3>
              Deploy <span className="group-sub">Phiên bản &amp; triển khai</span>
            </h3>
            <div className="stack">
              <div className="row">
                <input
                  className="field"
                  value={options.versionDescription}
                  disabled={running}
                  placeholder="Mô tả version"
                  onChange={(e) => onChange({ versionDescription: e.target.value })}
                />
                <button
                  className="btn"
                  disabled={needProject}
                  {...previewHandlers(buildVersionArgs())}
                  onClick={() => onRun(buildVersionArgs())}
                >
                  version
                </button>
                <button
                  className="btn"
                  disabled={needProject}
                  {...previewHandlers(['versions'])}
                  onClick={() => onRun(['versions'])}
                >
                  versions
                </button>
              </div>
              <div className="row">
                <input
                  className="field"
                  value={options.deployDescription}
                  disabled={running}
                  placeholder="Mô tả deploy"
                  onChange={(e) => onChange({ deployDescription: e.target.value })}
                />
                <input
                  className="field"
                  value={options.deploymentId}
                  disabled={running}
                  placeholder="deploymentId"
                  onChange={(e) => onChange({ deploymentId: e.target.value })}
                />
              </div>
              <div className="group-grid">
                <button
                  className={`btn ${deployPrimary ? 'btn-primary' : ''}`}
                  disabled={needProject}
                  {...previewHandlers(buildDeployArgs())}
                  onClick={() => onRun(buildDeployArgs())}
                >
                  deploy
                </button>
                <button
                  className="btn btn-danger"
                  disabled={needProject || !options.deploymentId.trim()}
                  {...previewHandlers(['undeploy', options.deploymentId.trim()])}
                  onClick={() =>
                    onRun(
                      ['undeploy', options.deploymentId.trim()],
                      `Xóa deployment ${options.deploymentId.trim()}?`
                    )
                  }
                >
                  undeploy
                </button>
                <button
                  className="btn"
                  disabled={needProject}
                  {...previewHandlers(buildOpenWebAppArgs())}
                  onClick={() => onRun(buildOpenWebAppArgs())}
                >
                  open-web-app
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'other' && (
          <>
            <div className="group">
              <h3>
                Run <span className="group-sub">Chạy function</span>
              </h3>
              <div className="row">
                <input
                  className="field"
                  value={options.functionName}
                  disabled={running}
                  placeholder="Tên function"
                  onChange={(e) => onChange({ functionName: e.target.value })}
                />
                <button
                  className="btn"
                  disabled={needProject || !options.functionName.trim()}
                  {...previewHandlers(['run', options.functionName.trim()])}
                  onClick={() => onRun(['run', options.functionName.trim()])}
                >
                  run
                </button>
              </div>
            </div>

            <div className="group">
              <h3>
                Custom <span className="group-sub">Lệnh tùy chỉnh</span>
              </h3>
              <div className="stack">
                <textarea
                  className="field"
                  rows={3}
                  value={options.customArgs}
                  disabled={running}
                  placeholder="Ví dụ: push --force   hoặc   delete --force"
                  onChange={(e) => onChange({ customArgs: e.target.value })}
                />
                <button
                  className="btn"
                  disabled={busy || !options.customArgs.trim()}
                  onMouseEnter={() => {
                    const args = buildCustomArgs()
                    setPreview(args.length > 0 ? args : null)
                  }}
                  onFocus={() => {
                    const args = buildCustomArgs()
                    setPreview(args.length > 0 ? args : null)
                  }}
                  onMouseLeave={() => setPreview(null)}
                  onBlur={() => setPreview(null)}
                  onClick={() => {
                    const raw = options.customArgs.trim()
                    const args = parseCustomArgs(raw)
                    if (args.length === 0) {
                      return
                    }
                    const dangerous =
                      args[0] === 'delete' ||
                      args.includes('undeploy') ||
                      args.includes('--force')
                    onRun(args, dangerous ? `Chạy lệnh tùy chỉnh: clasp ${raw}?` : undefined)
                  }}
                >
                  Chạy custom
                </button>
                <p className="hint">Nhập args sau `clasp`, ví dụ: `pull` hoặc `push --watch`.</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="cmd-preview" aria-live="polite">
        {previewArgs && previewArgs.length > 0 ? (
          <code>{formatClasp(previewArgs)}</code>
        ) : (
          <span className="hint">Hover nút lệnh để xem `clasp …` sắp chạy</span>
        )}
      </div>
    </section>
  )
}
