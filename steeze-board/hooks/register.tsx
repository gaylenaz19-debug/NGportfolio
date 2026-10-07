import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { DomainId, FeedItem, FeedKind, TokenSnapshot } from '../types'
import { BRAIN_CONTEXT, DOMAINS, classify, kindOfCommand, parseDomain } from './domains'

const PANE = 'steeze-board'
const CYAN = '#00E5FF'
const AMBER = '#FF5500'
const GREEN = '#00FF66'
const INK = '#0B0B0F'

const feed = atom({ plugin: 'steeze-board', key: 'feed' } as const, [])
const domain = atom({ plugin: 'steeze-board', key: 'domain' } as const, null)
const domainLock = atom({ plugin: 'steeze-board', key: 'domainLock' } as const, null)
const tokens = atom({ plugin: 'steeze-board', key: 'tokens' } as const, null)
const cacheWarmAt = atom({ plugin: 'steeze-board', key: 'cacheWarmAt' } as const, null)
const now = atom({ plugin: 'steeze-board', key: 'now' } as const, 0)
const brain = atom({ plugin: 'steeze-board', key: 'brain' } as const, false)
const ttlMin = atom({ plugin: 'steeze-board', key: 'ttlMin' } as const, 5)
const footer = atom({ plugin: 'steeze-board', key: 'footer' } as const, 'type `help` for commands')

type DomainLog = Partial<Record<DomainId, { count: number; lastSeen: number; lastCwd: string }>>

const KIND_TAG: Record<FeedKind, string> = { agent: 'AGENT ', render: 'RENDER', build: 'BUILD ', tool: 'tool  ' }

const HELP =
  'domain web|apparel|motion|academic|auto · brain on|off · ttl <min> · clear · ask <prompt> · close'

function k(n: number | undefined): string {
  if (n === undefined) return '–'
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : String(n)
}

function bar(percent: number, width: number): string {
  const filled = Math.max(0, Math.min(width, Math.round((percent / 100) * width)))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function clockOf(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

async function pushFeed($: EngineInterface, item: FeedItem) {
  await update($, feed, list => [...list, item].slice(-300))
}

async function settleFeed($: EngineInterface, id: string, isError: boolean, startedAt: number) {
  const ms = (await $.clock.now()) - startedAt
  await update($, feed, list =>
    list.map(one => (one.id === id ? { ...one, status: isError ? 'fail' : 'ok', ms } : one)),
  )
}

async function refreshUsage($: EngineInterface, last?: Partial<TokenSnapshot>) {
  const usage = await $.session.usage()
  const fiveHour = usage.rateLimits.find(r => r.kind === 'five_hour')
  await update($, tokens, prev => ({
    lastInput: 0,
    lastOutput: 0,
    lastCacheRead: 0,
    lastCacheWrite: 0,
    ...prev,
    ...last,
    tokens: usage.context.tokens,
    window: usage.context.window,
    percent: usage.context.percent,
    costUsd: usage.cost?.usd,
    fiveHourPercent: fiveHour?.percentUsed,
  }))
}

// Tags the session from text (a prompt, the cwd) and records it in the
// cross-session domain log the first time the session lands in a bucket.
async function tag($: EngineInterface, text: string) {
  if ((await read($, domainLock)) !== null) return
  const before = await read($, domain)
  const after = classify(text, before)
  if (after === null || after === before) return
  await update($, domain, () => after)
  const log = ((await $.store.get('domains')) ?? {}) as DomainLog
  const seen = log[after]
  log[after] = { count: (seen?.count ?? 0) + 1, lastSeen: await $.clock.now(), lastCwd: await $.session.cwd() }
  await $.store.set('domains', log)
  $.ui.status(`${DOMAINS[after].icon} ${DOMAINS[after].label}`)
}

async function runFooterCommand($: EngineInterface, raw: string): Promise<string> {
  const [verb = '', ...rest] = raw.trim().split(/\s+/)
  const arg = rest.join(' ')
  switch (verb.toLowerCase()) {
    case '':
    case 'help':
      return HELP
    case 'domain': {
      const picked = parseDomain(arg)
      if (picked === undefined) return `unknown domain "${arg}"`
      if (picked === 'auto') {
        await update($, domainLock, () => null)
        return 'domain: auto-tagging'
      }
      await update($, domainLock, () => picked)
      await update($, domain, () => picked)
      return `domain locked: ${DOMAINS[picked].label}`
    }
    case 'brain': {
      const isOn = arg !== 'off'
      await update($, brain, () => isOn)
      await $.store.set('brain', isOn)
      return isOn ? 'brain context ON for new requests' : 'brain context OFF'
    }
    case 'ttl': {
      const min = Number(arg)
      if (!Number.isFinite(min) || min <= 0) return 'ttl takes minutes, e.g. `ttl 5` or `ttl 60`'
      await update($, ttlMin, () => min)
      await $.store.set('ttlMin', min)
      return `cache TTL set to ${min}m`
    }
    case 'clear':
      await update($, feed, () => [])
      return 'feed cleared'
    case 'ask':
      if (arg === '') return 'ask <prompt>'
      await $.prompt.submit({ text: arg })
      return 'prompt queued'
    case 'close':
      await $.ui.close({ id: PANE })
      return ''
    default:
      return `unknown command "${verb}" · ${HELP}`
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'steeze', description: 'Open the Steeze Board dashboard' })
    await $.command.register({
      name: 'brain-sync',
      description: 'Inject the Steeze Brain preferences into every new session (`/brain-sync off` to stop)',
      argumentHint: '[on|off]',
    })
    await update($, brain, () => false)
    const storedBrain = await $.store.get('brain')
    if (typeof storedBrain === 'boolean') await update($, brain, () => storedBrain)
    const storedTtl = await $.store.get('ttlMin')
    if (typeof storedTtl === 'number') await update($, ttlMin, () => storedTtl)

    await tag($, e.cwd)
    await refreshUsage($)
    $.clock.every(1000, () => void $.clock.now().then(t => update($, now, () => t)))
    $.clock.every(15_000, () => void refreshUsage($))
    void $.ui.open({ id: PANE, title: 'STEEZE BOARD' })

    return next(e)
  })

  on('command.run', { command: 'steeze' }, async $ => {
    await $.ui.open({ id: PANE, title: 'STEEZE BOARD' })

    return { text: 'Steeze Board open.' }
  })

  on('command.run', { command: 'brain-sync' }, async ($, e) => {
    const isOn = e.args.trim() !== 'off'
    await update($, brain, () => isOn)
    await $.store.set('brain', isOn)

    return isOn
      ? {
          text: 'Brain synced: every new session now carries the Steeze Brain preferences.',
          context: [BRAIN_CONTEXT],
        }
      : { text: 'Brain context removed for new requests.' }
  })

  // The hidden block: a session-scoped system prompt section, sent after the
  // cache boundary so it never disturbs the shared prompt cache.
  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    if (!(await read($, brain))) return composed

    return {
      sections: [...composed.sections, { id: 'steeze-board:brain', text: BRAIN_CONTEXT, scope: 'session' }],
    }
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.origin.kind !== 'plugin') await tag($, e.text)

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    let kind: FeedKind = 'tool'
    let label = String(e.tool)
    if (e.tool === 'Bash') {
      kind = kindOfCommand(e.command)
      label = e.command.replace(/\s+/g, ' ')
    } else if (e.tool === 'Agent') {
      kind = 'agent'
      label = `${e.subagent_type ?? 'agent'}: ${e.description}`
    }
    const startedAt = await $.clock.now()
    const id = e.tool_use_id ?? `${label}@${startedAt}`
    await pushFeed($, { id, at: startedAt, kind, label, status: 'run' })
    if (kind === 'render') $.ui.toast(`🎬 Remotion render started`)
    const ran = await next(e)
    await settleFeed($, id, ran.deny !== undefined || ran.isError === true, startedAt)
    if (kind === 'render') $.ui.toast(ran.isError ? '🎬 render FAILED' : '🎬 render done')

    return ran
  })

  on('turn.step', async function* ($, e, next) {
    const response = yield* next(e)
    if (response.usage !== null) {
      const u = response.usage
      if (u.cache_read_input_tokens + u.cache_creation_input_tokens > 0) {
        const t = await $.clock.now()
        await update($, cacheWarmAt, () => t)
      }
      await refreshUsage($, {
        lastInput: u.input_tokens,
        lastOutput: u.output_tokens,
        lastCacheRead: u.cache_read_input_tokens,
        lastCacheWrite: u.cache_creation_input_tokens,
        model: u.model,
      })
    }

    return response
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const width = e.props.bodyColumns
    const rows = Math.max(8, (e.viewport?.rows ?? 30) - 8)
    const sideWidth = Math.min(36, Math.max(26, Math.floor(width * 0.34)))
    const isStacked = width < 70

    const list = await read($, feed)
    const current = await read($, domain)
    const locked = await read($, domainLock)
    const snap = await read($, tokens)
    const warmAt = await read($, cacheWarmAt)
    const t = await read($, now)
    const isBrainOn = await read($, brain)
    const ttl = await read($, ttlMin)
    const note = await read($, footer)
    const log = ((await $.store.get('domains')) ?? {}) as DomainLog

    const feedRoom = Math.max(3, rows - 4)
    const shown = list.slice(-feedRoom)

    const engineRoom = (
      <Box
        key="engine"
        flexDirection="column"
        flexGrow={1}
        borderStyle="round"
        borderColor={CYAN}
        paddingX={1}
        backgroundColor={INK}
      >
        <Text color={CYAN} bold>
          ⚙ THE ENGINE ROOM <Text dimColor>· {list.filter(i => i.status === 'run').length} live</Text>
        </Text>
        {shown.length === 0 && <Text dimColor>Waiting for agents, renders and builds…</Text>}
        {shown.map(item => {
          const color = item.status === 'fail' ? AMBER : item.status === 'run' ? CYAN : item.kind === 'tool' ? undefined : GREEN
          const mark = item.status === 'run' ? '▶' : item.status === 'ok' ? '✓' : '✗'
          return (
            <Text color={color} dimColor={item.kind === 'tool' && item.status === 'ok'} wrap="truncate-end">
              {mark} {KIND_TAG[item.kind]} {item.label}
              {item.ms !== undefined ? ` (${(item.ms / 1000).toFixed(1)}s)` : ''}
            </Text>
          )
        })}
      </Box>
    )

    const percent = snap?.percent ?? 0
    const isHot = percent >= 80
    const left = warmAt === null ? null : ttl * 60_000 - (t - warmAt)
    const isCold = left !== null && left <= 0
    const isCooling = left !== null && left > 0 && left < 60_000
    const hitRate =
      snap && snap.lastCacheRead + snap.lastInput + snap.lastCacheWrite > 0
        ? Math.round((snap.lastCacheRead / (snap.lastCacheRead + snap.lastInput + snap.lastCacheWrite)) * 100)
        : null

    const tracker = (
      <Box
        key="tokens"
        flexDirection="column"
        width={isStacked ? undefined : sideWidth}
        borderStyle="round"
        borderColor={isHot || isCooling ? AMBER : CYAN}
        paddingX={1}
        backgroundColor={INK}
      >
        <Text color={AMBER} bold>
          ◆ TOKEN TRACKER
        </Text>
        <Text>
          context <Text color={isHot ? AMBER : CYAN} bold>{snap?.percent ?? 0}%</Text>
        </Text>
        <Text color={isHot ? AMBER : CYAN}>{bar(percent, sideWidth - 4)}</Text>
        <Text dimColor>
          {k(snap?.tokens)} / {k(snap?.window)} tokens
        </Text>
        {isHot && <Text color={AMBER} bold>⚠ compact soon: /compact</Text>}
        <Text> </Text>
        <Text>
          last req <Text color={CYAN}>in {k(snap?.lastInput)}</Text> · out {k(snap?.lastOutput)}
        </Text>
        <Text>
          cache r/w <Text color={GREEN}>{k(snap?.lastCacheRead)}</Text> / {k(snap?.lastCacheWrite)}
          {hitRate !== null ? ` · ${hitRate}% hit` : ''}
        </Text>
        <Text>
          cache TTL {ttl}m{' '}
          {left === null ? (
            <Text dimColor>no cache yet</Text>
          ) : isCold ? (
            <Text color={AMBER} bold>EXPIRED · next req re-writes</Text>
          ) : (
            <Text color={isCooling ? AMBER : GREEN} bold>
              {clockOf(left)}
            </Text>
          )}
        </Text>
        {snap?.fiveHourPercent !== undefined && (
          <Text>
            5h limit <Text color={snap.fiveHourPercent >= 80 ? AMBER : CYAN}>{Math.round(snap.fiveHourPercent)}%</Text>
          </Text>
        )}
        {snap?.costUsd !== undefined && <Text dimColor>session ${snap.costUsd.toFixed(2)}</Text>}
        {snap?.model && <Text dimColor wrap="truncate-end">{snap.model}</Text>}
        <Text> </Text>
        <Text color={CYAN} bold>
          ◆ DOMAINS
        </Text>
        {(Object.keys(DOMAINS) as DomainId[]).map(id => (
          <Text color={id === current ? CYAN : undefined} dimColor={id !== current} wrap="truncate-end">
            {id === current ? '▸' : ' '} {DOMAINS[id].icon} {DOMAINS[id].label} {log[id]?.count ?? 0}
          </Text>
        ))}
      </Box>
    )

    let input = null
    if (e.surface !== 'mobile') {
      const { Input } = $.ui.resolve(e)
      input = (
        <Input
          key="cmd"
          label="❯"
          placeholder="domain web · brain on · ttl 60 · ask …"
          onSubmit={async value => {
            const said = await runFooterCommand($, value)
            await update($, footer, () => said)
          }}
        />
      )
    }

    const tagLabel = current === null ? '◌ UNTAGGED' : `${DOMAINS[current].icon} ${DOMAINS[current].label}`
    const control = (
      <Box key="control" flexDirection="column" borderStyle="round" borderColor={CYAN} paddingX={1} backgroundColor={INK}>
        <Text wrap="truncate-end">
          <Text color={CYAN} bold>
            {tagLabel}
          </Text>
          {locked !== null ? <Text color={AMBER}> [locked]</Text> : <Text dimColor> [auto]</Text>}
          <Text dimColor> · brain </Text>
          <Text color={isBrainOn ? GREEN : AMBER} bold>
            {isBrainOn ? 'SYNCED' : 'OFF'}
          </Text>
          <Text dimColor> · {note}</Text>
        </Text>
        {input}
      </Box>
    )

    return (
      <Box flexDirection="column" backgroundColor={INK}>
        <Box flexDirection={isStacked ? 'column' : 'row'} height={isStacked ? undefined : rows}>
          {engineRoom}
          {tracker}
        </Box>
        {control}
      </Box>
    )
  })
}
