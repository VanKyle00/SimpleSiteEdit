import { describe, test, expect } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inferCollections } from './collections'

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-collections-'))
  try {
    await fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('inferCollections — markdown SSGs', () => {
  type Case = {
    ssg: 'jekyll' | 'hugo' | 'eleventy' | 'astro' | 'next-mdx'
    fixture: string
    expectedFolder: string
    expectedFormat: 'markdown' | 'mdx'
  }
  const cases: Case[] = [
    { ssg: 'jekyll',   fixture: 'fixtures/jekyll-minimal',   expectedFolder: '_posts',             expectedFormat: 'markdown' },
    { ssg: 'hugo',     fixture: 'fixtures/hugo-minimal',     expectedFolder: 'content/posts',      expectedFormat: 'markdown' },
    { ssg: 'eleventy', fixture: 'fixtures/eleventy-minimal', expectedFolder: 'posts',              expectedFormat: 'markdown' },
    { ssg: 'astro',    fixture: 'fixtures/astro-minimal',    expectedFolder: 'src/content/blog',   expectedFormat: 'markdown' },
    { ssg: 'next-mdx', fixture: 'fixtures/next-mdx-minimal', expectedFolder: 'posts',              expectedFormat: 'mdx' },
  ]
  for (const c of cases) {
    test(`${c.ssg}: finds ${c.expectedFolder} as a ${c.expectedFormat} collection`, async () => {
      const { stubs } = await inferCollections({ ssg: c.ssg, root: c.fixture })
      const posts = stubs.find((s) => s.folder === c.expectedFolder)
      expect(posts).toBeDefined()
      expect(posts!.format).toBe(c.expectedFormat)
    })
  }
})

describe('inferCollections (js-literals)', () => {
  test('produces one CollectionStub per top-level const array, carrying samples and jsBinding', async () => {
    await withTmp(async (dir) => {
      const js = join(dir, 'app.js')
      writeFileSync(
        js,
        `const POSTS = [{ title: 'a' }, { title: 'b' }]\n` +
          `const TRACKS = [{ id: 't1' }]\n`,
      )
      const { stubs } = await inferCollections({ ssg: 'js-literals', root: dir, jsSource: js })
      const byName = Object.fromEntries(stubs.map((s) => [s.name, s]))
      expect(Object.keys(byName).sort()).toEqual(['POSTS', 'TRACKS'])
      expect(byName.POSTS.jsBinding).toBe('POSTS')
      expect(byName.POSTS.format).toBe('json')
      expect(byName.POSTS.samples).toEqual([{ title: 'a' }, { title: 'b' }])
      expect(byName.POSTS.folder).toBe('.simplesiteedit/data/POSTS')
    })
  })

  test('records a note for each non-uniform-object array (2D, arrays of strings, etc.)', async () => {
    await withTmp(async (dir) => {
      const js = join(dir, 'app.js')
      writeFileSync(
        js,
        `const POSTS = [{ title: 'a' }]\n` +
          `const GRID = [[{ x: 1 }], [{ x: 2 }]]\n` +
          `const TABS = ['home', 'about']\n`,
      )
      const { stubs, notes } = await inferCollections({ ssg: 'js-literals', root: dir, jsSource: js })
      expect(stubs.map((s) => s.name)).toEqual(['POSTS'])
      expect(notes).toHaveLength(2)
      expect(notes.join(' ')).toMatch(/GRID/)
      expect(notes.join(' ')).toMatch(/TABS/)
    })
  })
})
