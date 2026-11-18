export function folderMenuLabel(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/').filter(Boolean)
  const leaf = parts.pop() || path
  return leaf.length > 24 ? `…${leaf.slice(-22)}` : leaf
}
