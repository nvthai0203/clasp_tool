import { useState } from 'react'
import type { ClaspAuthUserResult } from '../../../shared/types'
import { extractScriptId, formatClasp, parseCustomArgs } from '../utils/scriptId'

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
  authUser: ClaspAuthUserResult | null
  onChange: (partial: Partial<CommandOptions>) => void
  onRun: (args: string[], confirmMessage?: string) => void
}

type TabId = 'sync' | 'deploy' | 'other'

function whyDisabled(running: boolean, hasFolder: boolean, extra?: string): string | undefined {
  if (!hasFolder) {
    return 'Chọn thư mục trước'
  }
  if (running) {
    return 'Đang có lệnh chạy'
  }
  return extra
}

export function CommandPanel({
  hasFolder,
  hasProject,
  running,
  options,
  authUser,
  onChange,
  onRun
}: Props): JSX.Element {
  const [tab, setTab] = useState<TabId>('sync')
  const [previewArgs, setPreviewArgs] = useState<string[] | null>(null)

  const scriptId = extractScriptId(options.scriptId)
  const hasScriptId = Boolean(scriptId)
  const hasCreateTitle = Boolean(options.createTitle.trim())
  const hasDeploymentId = Boolean(options.deploymentId.trim())
  const hasFunctionName = Boolean(options.functionName.trim())

  const loginPrimary = Boolean(
    hasFolder && !hasProject && authUser?.ok && !authUser.loggedIn && !running
  )
  const clonePrimary = hasFolder && !hasProject && hasScriptId && !loginPrimary && !running
  const createPrimary =
    hasFolder && !hasProject && !hasScriptId && hasCreateTitle && !loginPrimary && !running
  const pushPrimary = hasProject && !running
  const deployPrimary = hasProject && !running

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
    const args = ['clone', scriptId]
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

  const withDeployDescription = (args: string[]): string[] => {
    if (options.deployDescription.trim()) {
      args.push('-d', options.deployDescription.trim())
    }
    return args
  }

  const buildNewDeployArgs = (): string[] => withDeployDescription(['deploy'])

  const buildUpdateDeployArgs = (): string[] =>
    withDeployDescription(['deploy', '-i', options.deploymentId.trim()])

  const buildOpenWebAppArgs = (): string[] => {
    const args = ['open-web-app']
    if (hasDeploymentId) {
      args.push(options.deploymentId.trim())
    }
    return args
  }

  const buildCustomArgs = (): string[] => parseCustomArgs(options.customArgs.trim())

  const runButton = (
    label: string,
    args: string[],
    reason: string | undefined,
    opts?: { primary?: boolean; danger?: boolean; confirm?: string; ariaLabel?: string }
  ): JSX.Element => (
    <button
      type="button"
      className={`btn${opts?.primary ? ' btn-primary' : ''}${opts?.danger ? ' btn-danger' : ''}`}
      disabled={reason !== undefined}
      title={reason}
      aria-label={opts?.ariaLabel}
      {...previewHandlers(args)}
      onClick={() => {
        if (reason) {
          return
        }
        onRun(args, opts?.confirm)
      }}
    >
      {label}
    </button>
  )

  const pinnedArgs = (): string[] | null => {
    if (!hasFolder || running) {
      return null
    }
    if (tab === 'sync') {
      if (loginPrimary) {
        return ['login']
      }
      if (clonePrimary) {
        return buildCloneArgs()
      }
      if (createPrimary) {
        return buildCreateArgs()
      }
      if (pushPrimary) {
        return buildPushArgs()
      }
      return null
    }
    if (tab === 'deploy' && deployPrimary) {
      return buildNewDeployArgs()
    }
    return null
  }

  const shownArgs = previewArgs && previewArgs.length > 0 ? previewArgs : pinnedArgs()
  const showingHover = Boolean(previewArgs && previewArgs.length > 0)

  const projectReason = hasProject ? undefined : 'Cần file .clasp.json'
  const scriptReason = hasScriptId ? undefined : 'Cần Script ID'
  const titleReason = hasCreateTitle ? undefined : 'Cần tiêu đề script'
  const deploymentReason = hasDeploymentId ? undefined : 'Cần deploymentId'
  const functionReason = hasFunctionName ? undefined : 'Cần tên function'

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

      {!hasFolder && <div className="empty-banner">Chọn thư mục ở thanh trên để bật lệnh.</div>}
      {hasFolder && !hasProject && tab === 'sync' && (
        <div className="empty-banner">
          Folder chưa có <code>.clasp.json</code>. Dùng <strong>clone</strong> hoặc{' '}
          <strong>create</strong> ngay bên dưới.
        </div>
      )}

      <div className="commands-body">
        {tab === 'sync' && (
          <>
            <div className="group">
              <h3>
                Đăng nhập <span className="group-sub">Tài khoản Google</span>
              </h3>
              <div className="stack">
                <div className="auth-status">
                  {!authUser ? (
                    <span className="hint">Đang kiểm tra đăng nhập…</span>
                  ) : !authUser.ok ? (
                    <span className="hint" title={authUser.error}>
                      Không đọc được trạng thái login
                      {authUser.error ? `: ${authUser.error}` : ''}
                    </span>
                  ) : authUser.loggedIn && authUser.email ? (
                    <span className="badge ok" title={authUser.email}>
                      Đang login: {authUser.email}
                    </span>
                  ) : authUser.loggedIn ? (
                    <span className="badge ok">Đang login (không rõ email)</span>
                  ) : (
                    <span className="badge">Chưa đăng nhập</span>
                  )}
                </div>
                <div className="row">
                  <span className="label">Tài khoản</span>
                  <input
                    className="field"
                    value={options.userName}
                    disabled={running}
                    onChange={(e) => onChange({ userName: e.target.value })}
                    placeholder="default"
                    aria-label="Tài khoản clasp"
                  />
                </div>
                <p className="hint">Tên khác default sẽ gửi --user.</p>
                <div className="group-grid">
                  {runButton('login', ['login'], whyDisabled(running, hasFolder), {
                    primary: loginPrimary
                  })}
                  {runButton('logout', ['logout'], whyDisabled(running, hasFolder))}
                  {runButton('list', ['list'], whyDisabled(running, hasFolder))}
                </div>
              </div>
            </div>

            {!hasProject && (
              <>
                <div className="group">
                  <h3>
                    Clone <span className="group-sub">Tải script về folder này</span>
                  </h3>
                  <div className="row">
                    <input
                      className="field"
                      value={options.versionNumber}
                      disabled={running}
                      placeholder="Version (chỉ cho clone)"
                      aria-label="Version cho clone"
                      onChange={(e) => onChange({ versionNumber: e.target.value })}
                    />
                    {runButton('clone', buildCloneArgs(), whyDisabled(running, hasFolder, scriptReason), {
                      primary: clonePrimary
                    })}
                  </div>
                  {!hasScriptId && <p className="hint">Dán Script ID hoặc URL ở thanh trên.</p>}
                </div>

                <div className="group">
                  <h3>
                    Create <span className="group-sub">Tạo script mới trong folder này</span>
                  </h3>
                  <div className="row">
                    <input
                      className="field"
                      value={options.createTitle}
                      disabled={running}
                      placeholder="Tiêu đề script mới"
                      aria-label="Tiêu đề script mới"
                      onChange={(e) => onChange({ createTitle: e.target.value })}
                    />
                    <select
                      className="field"
                      style={{ maxWidth: 140 }}
                      value={options.createType}
                      disabled={running}
                      aria-label="Loại script"
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
                    {runButton(
                      'create',
                      buildCreateArgs(),
                      whyDisabled(running, hasFolder, titleReason),
                      { primary: createPrimary }
                    )}
                  </div>
                </div>

                <div className="group">
                  <h3>
                    Khi đã có project <span className="group-sub">Cần .clasp.json</span>
                  </h3>
                  <p className="hint group-note">
                    pull, push và open-container bật sau khi clone hoặc create. --force và --watch chỉ
                    xuất hiện cạnh push.
                  </p>
                  <div className="group-grid">
                    {runButton('pull', ['pull'], whyDisabled(running, hasFolder, projectReason))}
                    {runButton('push', ['push'], whyDisabled(running, hasFolder, projectReason))}
                    {runButton(
                      'open-container',
                      ['open-container'],
                      whyDisabled(running, hasFolder, projectReason)
                    )}
                  </div>
                </div>
              </>
            )}

            {hasProject && (
              <>
                <div className="group">
                  <h3>
                    Đồng bộ code <span className="group-sub">pull và push</span>
                  </h3>
                  <div className="group-grid">
                    {runButton('push', buildPushArgs(), whyDisabled(running, hasFolder, projectReason), {
                      primary: pushPrimary,
                      confirm: options.force
                        ? 'Push với --force có thể ghi đè file trên Google. Tiếp tục?'
                        : undefined
                    })}
                    {runButton('pull', ['pull'], whyDisabled(running, hasFolder, projectReason))}
                    {runButton(
                      'open-container',
                      ['open-container'],
                      whyDisabled(running, hasFolder, projectReason)
                    )}
                  </div>
                  <div className="checks">
                    <label title="Chỉ áp dụng cho push">
                      <input
                        type="checkbox"
                        checked={options.force}
                        disabled={running}
                        onChange={(e) => onChange({ force: e.target.checked })}
                      />
                      push --force
                    </label>
                    <label title="Chỉ áp dụng cho push">
                      <input
                        type="checkbox"
                        checked={options.watch}
                        disabled={running}
                        onChange={(e) => onChange({ watch: e.target.checked })}
                      />
                      push --watch
                    </label>
                  </div>
                </div>

                <div className="group">
                  <h3>
                    Clone / create <span className="group-sub">Script khác trong folder này</span>
                  </h3>
                  <div className="row">
                    <input
                      className="field"
                      value={options.versionNumber}
                      disabled={running}
                      placeholder="Version (chỉ cho clone)"
                      aria-label="Version cho clone"
                      onChange={(e) => onChange({ versionNumber: e.target.value })}
                    />
                    {runButton('clone', buildCloneArgs(), whyDisabled(running, hasFolder, scriptReason))}
                  </div>
                  <div className="row">
                    <input
                      className="field"
                      value={options.createTitle}
                      disabled={running}
                      placeholder="Tiêu đề script mới"
                      aria-label="Tiêu đề script mới"
                      onChange={(e) => onChange({ createTitle: e.target.value })}
                    />
                    <select
                      className="field"
                      style={{ maxWidth: 140 }}
                      value={options.createType}
                      disabled={running}
                      aria-label="Loại script"
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
                    {runButton(
                      'create',
                      buildCreateArgs(),
                      whyDisabled(running, hasFolder, titleReason)
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="group danger-zone">
              <h3>
                Xóa script <span className="group-sub">Trên Google, không hoàn tác</span>
              </h3>
              <p className="hint group-note">Dùng Script ID ở thanh trên. Không cần .clasp.json.</p>
              {runButton(
                'delete',
                ['delete', scriptId, '--force'],
                whyDisabled(running, hasFolder, scriptReason),
                {
                  danger: true,
                  confirm: `Xóa vĩnh viễn script ${scriptId || ''} trên Google?`
                }
              )}
            </div>
          </>
        )}

        {tab === 'deploy' && (
          <>
            <div className="group">
              <h3>
                Version <span className="group-sub">Phiên bản code</span>
              </h3>
              <div className="row">
                <input
                  className="field"
                  value={options.versionDescription}
                  disabled={running}
                  placeholder="Mô tả version"
                  aria-label="Mô tả version"
                  onChange={(e) => onChange({ versionDescription: e.target.value })}
                />
                {runButton(
                  'version',
                  buildVersionArgs(),
                  whyDisabled(running, hasFolder, projectReason)
                )}
                {runButton('versions', ['versions'], whyDisabled(running, hasFolder, projectReason))}
              </div>
            </div>

            <div className="group">
              <h3>
                Deploy mới <span className="group-sub">Không gửi -i</span>
              </h3>
              <div className="row">
                <input
                  className="field"
                  value={options.deployDescription}
                  disabled={running}
                  placeholder="Mô tả deploy (tùy chọn)"
                  aria-label="Mô tả deploy"
                  onChange={(e) => onChange({ deployDescription: e.target.value })}
                />
                {runButton(
                  'deploy',
                  buildNewDeployArgs(),
                  whyDisabled(running, hasFolder, projectReason),
                  { primary: deployPrimary }
                )}
              </div>
              <p className="hint">Tạo deployment mới. ID cũ không bị gửi kèm.</p>
            </div>

            <div className="group">
              <h3>
                Deployment có sẵn <span className="group-sub">Cần deploymentId</span>
              </h3>
              <div className="stack">
                <input
                  className="field"
                  value={options.deploymentId}
                  disabled={running}
                  placeholder="deploymentId"
                  aria-label="deploymentId"
                  onChange={(e) => onChange({ deploymentId: e.target.value })}
                />
                <div className="group-grid">
                  {runButton(
                    'deploy -i',
                    buildUpdateDeployArgs(),
                    whyDisabled(running, hasFolder, projectReason ?? deploymentReason),
                    { ariaLabel: 'Cập nhật deployment' }
                  )}
                  {runButton(
                    'undeploy',
                    ['undeploy', options.deploymentId.trim()],
                    whyDisabled(running, hasFolder, projectReason ?? deploymentReason),
                    {
                      danger: true,
                      confirm: `Gỡ deployment ${options.deploymentId.trim()}?`
                    }
                  )}
                  {runButton(
                    'open-web-app',
                    buildOpenWebAppArgs(),
                    whyDisabled(running, hasFolder, projectReason)
                  )}
                </div>
                <p className="hint">
                  deploy mới không gửi -i. deploy -i, undeploy và open-web-app dùng ô này.
                </p>
              </div>
            </div>
          </>
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
                  aria-label="Tên function"
                  onChange={(e) => onChange({ functionName: e.target.value })}
                />
                {runButton(
                  'run',
                  ['run', options.functionName.trim()],
                  whyDisabled(running, hasFolder, projectReason ?? functionReason)
                )}
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
                  placeholder="Ví dụ: pull   hoặc   push --watch"
                  aria-label="Tham số clasp tùy chỉnh"
                  onChange={(e) => onChange({ customArgs: e.target.value })}
                />
                <button
                  type="button"
                  className="btn"
                  disabled={whyDisabled(running, hasFolder, options.customArgs.trim() ? undefined : 'Nhập tham số') !== undefined}
                  title={whyDisabled(running, hasFolder, options.customArgs.trim() ? undefined : 'Nhập tham số')}
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
                      args[0] === 'delete' || args.includes('undeploy') || args.includes('--force')
                    onRun(
                      args,
                      dangerous ? 'Lệnh này có thể xóa hoặc ghi đè dữ liệu trên Google.' : undefined
                    )
                  }}
                >
                  Chạy custom
                </button>
                <p className="hint">Nhập phần đứng sau clasp, ví dụ pull hoặc push --watch.</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="cmd-preview" aria-live="polite">
        {shownArgs && shownArgs.length > 0 ? (
          <>
            <span className="hint">{showingHover ? 'Đang trỏ' : 'Sắp chạy'}</span>
            <code>{formatClasp(shownArgs)}</code>
          </>
        ) : (
          <span className="hint">
            {hasFolder ? 'Gõ thông tin để thấy lệnh clasp sẽ chạy' : 'Chọn thư mục để bật lệnh'}
          </span>
        )}
      </div>
    </section>
  )
}
