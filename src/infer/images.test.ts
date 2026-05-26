import { describe, test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { publicPathFor, inferImageRoot } from './images'

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

function withTmp(fn: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-images-'))
  try {
    fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('inferImageRoot', () => {
  test('detects assets/images/ (Jekyll)', () => {
    withTmp((dir) => {
      mkdirSync(join(dir, 'assets', 'images'), { recursive: true })
      const r = inferImageRoot(dir)
      expect(r.storeFsPath).toBe('assets/images')
      expect(r.publicPath).toBe('/assets/images/')
    })
  })

  test('detects static/images/ (Hugo)', () => {
    withTmp((dir) => {
      mkdirSync(join(dir, 'static', 'images'), { recursive: true })
      const r = inferImageRoot(dir)
      expect(r.storeFsPath).toBe('static/images')
      expect(r.publicPath).toBe('/images/')
    })
  })

  test('detects public/images/ (Next.js / Astro)', () => {
    withTmp((dir) => {
      mkdirSync(join(dir, 'public', 'images'), { recursive: true })
      const r = inferImageRoot(dir)
      expect(r.storeFsPath).toBe('public/images')
      expect(r.publicPath).toBe('/images/')
    })
  })

  test('detects images/ at the root', () => {
    withTmp((dir) => {
      mkdirSync(join(dir, 'images'))
      const r = inferImageRoot(dir)
      expect(r.storeFsPath).toBe('images')
      expect(r.publicPath).toBe('/images/')
    })
  })

  test('falls back to images/ when nothing is present', () => {
    withTmp((dir) => {
      const r = inferImageRoot(dir)
      expect(r.storeFsPath).toBe('images')
      expect(r.publicPath).toBe('/images/')
    })
  })

  test('priority: assets/images beats images/ if both exist', () => {
    withTmp((dir) => {
      mkdirSync(join(dir, 'images'))
      mkdirSync(join(dir, 'assets', 'images'), { recursive: true })
      const r = inferImageRoot(dir)
      expect(r.storeFsPath).toBe('assets/images')
    })
  })

  test('priority: static/images beats public/images and images/', () => {
    withTmp((dir) => {
      mkdirSync(join(dir, 'images'))
      mkdirSync(join(dir, 'public', 'images'), { recursive: true })
      mkdirSync(join(dir, 'static', 'images'), { recursive: true })
      const r = inferImageRoot(dir)
      expect(r.storeFsPath).toBe('static/images')
    })
  })
})
