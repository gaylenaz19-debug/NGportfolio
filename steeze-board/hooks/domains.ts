import type { DomainId, FeedKind } from '../types'

export const DOMAINS: Record<DomainId, { icon: string; label: string }> = {
  web: { icon: '🌐', label: 'WEB DEV' },
  apparel: { icon: '👕', label: 'APPAREL & DESIGN' },
  motion: { icon: '🎬', label: 'MOTION & VIDEO' },
  academic: { icon: '🎓', label: 'ACADEMIC' },
}

export const DOMAIN_IDS = Object.keys(DOMAINS) as DomainId[]

// Each rule adds its weight to its domain's score when it matches the prompt
// or the working directory. Brand names that span domains weigh less than the
// words that pin the work down (a tech pack is apparel, a Netlify deploy is web).
const RULES: ReadonlyArray<[DomainId, RegExp, number]> = [
  ['web', /\b(react|next(\.js|js)?|vite|tailwind|netlify|vercel|deploy(ment)?|frontend|landing page|website|three(\.js|js)|webgl)\b/i, 3],
  ['web', /\b(jayelstudio|laidbyalex|naznetworks)\b/i, 3],
  ['web', /\.netlify\.app|\bsteezeinmotion(studio)?\.netlify/i, 4],
  ['web', /\bsteezeinmotion\b/i, 1],
  ['apparel', /\bsteeze ?in ?motion\b/i, 2],
  ['apparel', /\b(tech ?packs?|garments?|apparel|streetwear|hoodies?|tees?|colou?rways?|fabric|gsm|mockups?)\b/i, 3],
  ['apparel', /\b(2[4-9]\d|[34]\d\d|500)\s?gsm\b/i, 4],
  ['apparel', /\b(midjourney|flux|--ar\b|--style\b|--v\s?\d|prompt engineering)/i, 3],
  ['apparel', /\b(adobe|illustrator|photoshop|indesign)\b/i, 3],
  ['motion', /\b(remotion|composition|useCurrentFrame|spring\(\)|render(ing)? (the )?video)\b/i, 4],
  ['motion', /\b(dji|osmo|pocket 3|d-?log ?m?|lut|colou?r ?grad(e|ing))\b/i, 4],
  ['motion', /\b(premiere( pro)?|capcut|after effects|davinci|b-?roll|reels?|tiktok)\b/i, 3],
  ['academic', /\b(greenwich|universit(y|ies)|ucas|personal statement|module|coursework|assignment|essay|dissertation|lecturer)\b/i, 4],
  ['academic', /\b(portfolio review|graphic design portfolio|crit|brief)\b/i, 2],
]

export function scoreDomains(text: string): Record<DomainId, number> {
  const scores: Record<DomainId, number> = { web: 0, apparel: 0, motion: 0, academic: 0 }
  for (const [domain, pattern, weight] of RULES) {
    if (pattern.test(text)) {
      scores[domain] += weight
    }
  }

  return scores
}

// The best-scoring domain, or `fallback` when nothing scores or the top is tied
// with the domain already in force (a passing mention never flips the session).
export function classify(text: string, fallback: DomainId | null): DomainId | null {
  const scores = scoreDomains(text)
  let best: DomainId | null = null
  for (const id of DOMAIN_IDS) {
    if (scores[id] > 0 && (best === null || scores[id] > scores[best])) {
      best = id
    }
  }
  if (best === null) {
    return fallback
  }
  if (fallback !== null && scores[fallback] === scores[best]) {
    return fallback
  }

  return best
}

export function parseDomain(word: string): DomainId | 'auto' | undefined {
  const w = word.trim().toLowerCase()
  if (w === 'auto') return 'auto'
  if (w.startsWith('web')) return 'web'
  if (w.startsWith('app') || w.startsWith('des')) return 'apparel'
  if (w.startsWith('mo') || w.startsWith('vid')) return 'motion'
  if (w.startsWith('acad') || w.startsWith('uni')) return 'academic'

  return undefined
}

export function kindOfCommand(command: string): FeedKind {
  if (/\bremotion\b.*\b(render|still|benchmark)\b|\brenderMedia\b/i.test(command)) return 'render'
  if (/\b(npm|pnpm|yarn|bun)\s+(run\s+)?(build|dev|start|export)\b|\bnext (build|dev)\b|\bvite build\b|\bnetlify (deploy|build|dev)\b/i.test(command)) return 'build'

  return 'tool'
}

export const BRAIN_CONTEXT = `<steeze-brain>
Standing preferences for this user (set with /brain-sync):
- Aesthetic: dark cyber / street-luxury. Near-black grounds (#0B0B0F), electric cyan (#00E5FF), flame amber (#FF5500), hyper green (#00FF66), crisp white. No pastel, no corporate flat.
- UI: high-performance, highly interactive components. Glassmorphism (backdrop blur, translucent fills, hairline glowing borders), spring physics over linear easing, GPU-friendly transforms, 60 FPS.
- Answers: direct and code-heavy. Lead with working code, keep prose short, skip the preamble.
</steeze-brain>`
