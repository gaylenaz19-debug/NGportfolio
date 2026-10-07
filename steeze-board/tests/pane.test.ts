import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  component: 'Pane',
  requestId: 'steeze-board',
  props: {
    title: 'STEEZE BOARD',
    isFocused: false,
    bodyColumns: 120,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
  viewport: { columns: 160, rows: 48 },
} as const

test('the board draws and its control bar locks a domain', async ($, on) => {
  mock.store(on)
  const ui = await $.ui.mount({ plugin: 'steeze-board', surface: 'terminal', ...PANE })
  expect(await ui.find({ type: 'Text', text: /ENGINE ROOM/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /TOKEN TRACKER/ })).toBeDefined()
  await ui.input({ key: 'cmd', text: 'domain motion' })
  expect(await ui.find({ type: 'Text', text: /MOTION & VIDEO/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /domain locked/ })).toBeDefined()
  await ui.unmount()
})
