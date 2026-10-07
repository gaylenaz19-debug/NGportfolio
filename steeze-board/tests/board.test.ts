import { expect, mock, test } from 'claude-code/testing'

import { classify, kindOfCommand } from '../hooks/domains'

test('prompts and folders land in the right bucket', async () => {
  expect(classify('deploy the next.js site to netlify', null)).toBe('web')
  expect(classify('fix the hero on laidbyalex', null)).toBe('web')
  expect(classify('tech pack for a 400 GSM heavyweight hoodie', null)).toBe('apparel')
  expect(classify('Midjourney prompt for the STEEZEINMOTION drop --ar 4:5', null)).toBe('apparel')
  expect(classify('remotion composition with spring physics', null)).toBe('motion')
  expect(classify('grade my DJI Osmo Pocket 3 D-Log M footage', null)).toBe('motion')
  expect(classify('essay for University of Greenwich', null)).toBe('academic')
  expect(classify('/home/user/steezeinmotion.netlify-site', null)).toBe('web')
  expect(classify('thanks!', 'motion')).toBe('motion')
})

test('commands are sorted into the Engine Room kinds', async () => {
  expect(kindOfCommand('npx remotion render src/index.ts Promo out/promo.mp4')).toBe('render')
  expect(kindOfCommand('npm run build')).toBe('build')
  expect(kindOfCommand('netlify deploy --prod')).toBe('build')
  expect(kindOfCommand('ls -la')).toBe('tool')
})

const COMPOSE = {
  model: 'claude-x',
  promptModel: 'claude-x',
  surfaces: [],
  tools: [],
  outputStyle: null,
  traits: [],
}

test('/brain-sync adds the hidden section, /brain-sync off removes it', async ($, on) => {
  mock.store(on)
  on('prompt.compose', () => ({ sections: [{ id: 'intro', text: 'base', scope: 'shared' as const }] }))

  const before = await $.prompt.compose(COMPOSE)
  expect(before.sections.map(s => s.id)).toEqual(['intro'])

  await $.command.run({ command: 'brain-sync', args: '' })
  const synced = await $.prompt.compose(COMPOSE)
  expect(synced.sections.map(s => s.id)).toEqual(['intro', 'steeze-board:brain'])
  expect(synced.sections[1]?.text).toContain('Glassmorphism')

  await $.command.run({ command: 'brain-sync', args: 'off' })
  const off = await $.prompt.compose(COMPOSE)
  expect(off.sections.map(s => s.id)).toEqual(['intro'])
})
