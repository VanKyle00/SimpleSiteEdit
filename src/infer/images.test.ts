import { describe, test, expect } from 'vitest'
import { publicPathFor } from './images'

describe('publicPathFor', () => {
  test('strips static/ prefix (Hugo convention)', () => {
    expect(publicPathFor('static/images')).toBe('/images/')
  })

  test('strips public/ prefix (Next.js / Astro convention)', () => {
    expect(publicPathFor('public/images')).toBe('/images/')
  })

  test('keeps assets/ prefix (Jekyll convention)', () => {
    expect(publicPathFor('assets/images')).toBe('/assets/images/')
  })

  test('passes through a root-level images/ folder', () => {
    expect(publicPathFor('images')).toBe('/images/')
  })

  test('passes through a non-conventional path', () => {
    expect(publicPathFor('content/uploads')).toBe('/content/uploads/')
  })

  test('always adds a trailing slash', () => {
    expect(publicPathFor('foo')).toMatch(/\/$/)
    expect(publicPathFor('static/foo')).toMatch(/\/$/)
  })

  test('normalizes backslashes to forward slashes', () => {
    expect(publicPathFor('static\\images')).toBe('/images/')
    expect(publicPathFor('assets\\images')).toBe('/assets/images/')
  })
})
