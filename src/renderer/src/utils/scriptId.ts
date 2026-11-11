/** Extract Apps Script ID from a raw ID or script.google.com URL. */
export function extractScriptId(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) {
    return ''
  }

  const fromProjects = trimmed.match(/\/projects\/([a-zA-Z0-9_-]+)/)
  if (fromProjects?.[1]) {
    return fromProjects[1]
  }

  const fromDParam = trimmed.match(/[?&#]id=([a-zA-Z0-9_-]+)/)
  if (fromDParam?.[1]) {
    return fromDParam[1]
  }

  return trimmed
}

export function parseCustomArgs(input: string): string[] {
  const args: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(input)) !== null) {
    args.push(match[1] ?? match[2] ?? match[3])
  }
  return args
}
