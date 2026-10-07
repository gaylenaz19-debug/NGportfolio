export type DomainId = 'web' | 'apparel' | 'motion' | 'academic'

export type FeedKind = 'agent' | 'render' | 'build' | 'tool'

export type FeedStatus = 'run' | 'ok' | 'fail'

export type FeedItem = {
  id: string
  at: number
  kind: FeedKind
  label: string
  status: FeedStatus
  ms?: number
}

export type TokenSnapshot = {
  tokens?: number
  window: number
  percent?: number
  costUsd?: number
  fiveHourPercent?: number
  lastInput: number
  lastOutput: number
  lastCacheRead: number
  lastCacheWrite: number
  model?: string
}

declare module 'claude-code' {
  interface PluginState {
    'steeze-board': {
      feed: FeedItem[]
      domain: DomainId | null
      domainLock: DomainId | null
      tokens: TokenSnapshot | null
      cacheWarmAt: number | null
      now: number
      brain: boolean
      ttlMin: number
      footer: string
    }
  }
}
