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

export function CommandPanel({
  hasFolder,
  hasProject,
  running,
  options,
  onChange,
  onRun
}: Props): JSX.Element {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const busy = running || !hasFolder
  const needProject = running || !hasFolder || !hasProject

  return (
    <section className="panel commands">
      <h2>Lệnh clasp</h2>

      <div className="group">
        <h3>Auth</h3>
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
            <button className="btn" disabled={busy} onClick={() => onRun(['login'])}>
              login
            </button>
            <button className="btn" disabled={busy} onClick={() => onRun(['logout'])}>
              logout
            </button>
          </div>
        </div>
      </div>

      <div className="group">
        <h3>Project</h3>
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
              className="btn btn-primary"
              disabled={busy || !options.scriptId.trim()}
              onClick={() => {
                const args = ['clone', options.scriptId.trim()]
                if (options.versionNumber.trim()) {
                  args.push(options.versionNumber.trim())
                }
                onRun(args)
              }}
            >
              clone
            </button>
            <button className="btn" disabled={needProject} onClick={() => onRun(['pull'])}>
              pull
            </button>
            <button
              className="btn"
              disabled={needProject}
              onClick={() => {
                const args = ['push']
                if (options.force) {
                  args.push('--force')
                }
                if (options.watch) {
                  args.push('--watch')
                }
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
              onClick={() => onRun(['open-container'])}
            >
              open-container
            </button>
            <button className="btn" disabled={busy} onClick={() => onRun(['list'])}>
              list
            </button>
            <button
              className="btn btn-danger"
              disabled={busy || !options.scriptId.trim()}
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
              className="btn"
              disabled={busy || !options.createTitle.trim()}
              onClick={() =>
                onRun([
                  'create',
                  '--title',
                  options.createTitle.trim(),
                  '--type',
                  options.createType
                ])
              }
            >
              create
            </button>
          </div>
        </div>
      </div>

      <div className="group">
        <h3>Deploy</h3>
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
              onClick={() => {
                const args = ['version']
                if (options.versionDescription.trim()) {
                  args.push(options.versionDescription.trim())
                }
                onRun(args)
              }}
            >
              version
            </button>
            <button className="btn" disabled={needProject} onClick={() => onRun(['versions'])}>
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
              className="btn"
              disabled={needProject}
              onClick={() => {
                const args = ['deploy']
                if (options.deployDescription.trim()) {
                  args.push('-d', options.deployDescription.trim())
                }
                if (options.deploymentId.trim()) {
                  args.push('-i', options.deploymentId.trim())
                }
                onRun(args)
              }}
            >
              deploy
            </button>
            <button
              className="btn btn-danger"
              disabled={needProject || !options.deploymentId.trim()}
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
              onClick={() => {
                const args = ['open-web-app']
                if (options.deploymentId.trim()) {
                  args.push(options.deploymentId.trim())
                }
                onRun(args)
              }}
            >
              open-web-app
            </button>
          </div>
        </div>
      </div>

      <div className="group">
        <h3>Run</h3>
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
            onClick={() => onRun(['run', options.functionName.trim()])}
          >
            run
          </button>
        </div>
      </div>

      <div className="group">
        <h3>
          Custom{' '}
          <button className="btn btn-ghost" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? 'Ẩn' : 'Hiện'}
          </button>
        </h3>
        {showAdvanced && (
          <div className="stack">
            <textarea
              className="field"
              rows={3}
              value={options.customArgs}
              disabled={running}
              placeholder='Ví dụ: push --force   hoặc   delete --force'
              onChange={(e) => onChange({ customArgs: e.target.value })}
            />
            <button
              className="btn"
              disabled={busy || !options.customArgs.trim()}
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
        )}
      </div>
    </section>
  )
}
