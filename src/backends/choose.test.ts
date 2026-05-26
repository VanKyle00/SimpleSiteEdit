import { describe, test, expect } from 'vitest'
import { chooseBackend } from './choose'
import type { BackendAdapter } from './types'

function fakeAdapter(name: BackendAdapter['name'], available: boolean): BackendAdapter {
  return {
    name,
    isAvailable: async () => available,
    emitConfig: async () => {},
    launch: async () => ({ url: '', stop: async () => {} }),
  }
}

describe('chooseBackend', () => {
  test('returns the explicitly preferred backend if available', async () => {
    const result = await chooseBackend('lume', [fakeAdapter('lume', true)])
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') expect(result.adapter.name).toBe('lume')
  })

  test('errors when preferred backend is unavailable', async () => {
    const result = await chooseBackend('lume', [fakeAdapter('lume', false)])
    expect(result.kind).toBe('error')
    if (result.kind === 'error') expect(result.message).toMatch(/lume/i)
  })

  test('picks the first available when no preference given', async () => {
    const result = await chooseBackend(undefined, [fakeAdapter('lume', true)])
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') expect(result.adapter.name).toBe('lume')
  })

  test('errors when no backend is available', async () => {
    const result = await chooseBackend(undefined, [fakeAdapter('lume', false)])
    expect(result.kind).toBe('error')
    if (result.kind === 'error') expect(result.message).toMatch(/lume/i)
  })
})
