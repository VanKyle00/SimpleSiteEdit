import { describe, test, expect } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseLiterals, explode } from './explode'

function withTmp(fn: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-test-'))
  try {
    fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('parseLiterals', () => {
  test('extracts a single top-level const array of object literals', () => {
    const source = `const POSTS = [{ title: 'hello' }, { title: 'world' }]`
    const result = parseLiterals(source)
    expect(result.size).toBe(1)
    expect(result.get('POSTS')).toEqual([
      { title: 'hello' },
      { title: 'world' },
    ])
  })

  test('extracts multiple top-level const arrays', () => {
    const source = `
      const TRACKS = [{ id: 't1' }, { id: 't2' }]
      const POSTS = [{ title: 'a' }]
      const RELEASES = [{ year: 2025 }]
    `
    const result = parseLiterals(source)
    expect([...result.keys()].sort()).toEqual(['POSTS', 'RELEASES', 'TRACKS'])
    expect(result.get('TRACKS')).toEqual([{ id: 't1' }, { id: 't2' }])
    expect(result.get('RELEASES')).toEqual([{ year: 2025 }])
  })
})

describe('explode', () => {
  test('writes one shadow JSON file per array entry, named NNNN.json in order', () => {
    withTmp((dir) => {
      const src = join(dir, 'app.js')
      writeFileSync(src, `const POSTS = [{ title: 'first' }, { title: 'second' }, { title: 'third' }]`)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      explode(src, shadowRoot)

      const collectionDir = join(shadowRoot, 'POSTS')
      const files = readdirSync(collectionDir).sort()
      expect(files).toEqual(['0001.json', '0002.json', '0003.json'])

      const first = JSON.parse(readFileSync(join(collectionDir, '0001.json'), 'utf8'))
      const second = JSON.parse(readFileSync(join(collectionDir, '0002.json'), 'utf8'))
      expect(first).toEqual({ title: 'first' })
      expect(second).toEqual({ title: 'second' })
    })
  })

  test('joins a paragraph-array field into a single blank-line-separated string', () => {
    withTmp((dir) => {
      const src = join(dir, 'app.js')
      const para1 = 'Last quarter I made the case for ripping out our job runner.'
      const para2 = 'The old runner used a priority queue with five tiers.'
      writeFileSync(
        src,
        `const DEVBLOG = [{ title: 'x', body: [${JSON.stringify(para1)}, ${JSON.stringify(para2)}] }]`,
      )
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      explode(src, shadowRoot)

      const entry = JSON.parse(readFileSync(join(shadowRoot, 'DEVBLOG', '0001.json'), 'utf8'))
      expect(entry.body).toBe(`${para1}\n\n${para2}`)
      expect(entry.title).toBe('x')
    })
  })

  test('leaves short-string arrays (tags) untouched in shadow JSON', () => {
    withTmp((dir) => {
      const src = join(dir, 'app.js')
      writeFileSync(src, `const POSTS = [{ tags: ['intro', 'follow-up'] }]`)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      explode(src, shadowRoot)

      const entry = JSON.parse(readFileSync(join(shadowRoot, 'POSTS', '0001.json'), 'utf8'))
      expect(entry.tags).toEqual(['intro', 'follow-up'])
    })
  })
})
