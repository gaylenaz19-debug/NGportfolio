# steeze-board

A Claude Code mod: a live "Second Brain" dashboard pane.

```
╭─ ⚙ THE ENGINE ROOM ─────────────────────╮╭─ ◆ TOKEN TRACKER ──────╮
│ ✓ RENDER npx remotion render … (41.2s)  ││ context 38%            │
│ ▶ BUILD  npm run build                  ││ ████████░░░░░░░░░░░░░  │
│ ✓ AGENT  Explore: find hero component   ││ 76k / 200k tokens      │
│ ✗ BUILD  netlify deploy --prod (3.1s)   ││ cache TTL 5m  3:12     │
╰─────────────────────────────────────────╯│ ◆ DOMAINS              │
╭─────────────────────────────────────────╮│ ▸ 🌐 WEB DEV 4         │
│ 🌐 WEB DEV [auto] · brain SYNCED · …    │╰────────────────────────╯
│ ❯ domain web · brain on · ttl 60 · ask… │
╰─────────────────────────────────────────╯
```

- **Engine Room** (left, cyan): every tool call live. Agents, Remotion renders and web builds/deploys are tagged; failures turn flame amber.
- **Token Tracker** (right): context used against the window, the last request's input/output and cache read/write, a cache-expiry countdown (5 min by default, `ttl 60` for 1 h caching), the 5-hour limit and session cost. It turns amber past 80% or in the final minute of the cache.
- **Control Bar** (footer): the active domain, the brain state and a command line:
  `domain web|apparel|motion|academic|auto` · `brain on|off` · `ttl <min>` · `clear` · `ask <prompt>` · `close`
- **Domains**: each session is auto-tagged 🌐 WEB DEV / 👕 APPAREL & DESIGN / 🎬 MOTION & VIDEO / 🎓 ACADEMIC from your prompts and working directory, with per-domain counts kept across sessions.
- **`/brain-sync`**: adds a hidden system-prompt section to every session: dark cyber / street-luxury aesthetics, glassmorphism and spring physics, and direct code-heavy answers. `/brain-sync off` removes it. The setting persists.

`/steeze` opens the pane. It also opens on its own at session start when the terminal is at least 144 columns wide.

## Install

At a Claude Code terminal prompt:

```
/plugin install steeze-board --marketplace gaylenaz19-debug/NGportfolio
```

Answer `y` to add the marketplace, then pick the user scope. To try it from a local checkout instead: `claude --plugin-dir ./steeze-board`.

## Develop

```
claude plugin validate ./steeze-board
claude plugin test ./steeze-board
```
