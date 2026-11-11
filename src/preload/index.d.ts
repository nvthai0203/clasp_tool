import type { ClaspToolApi } from './index'

declare global {
  interface Window {
    api: ClaspToolApi
  }
}

export {}
