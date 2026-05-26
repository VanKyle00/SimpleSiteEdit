import { describe, test, expect } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { lume } from './lume'
import type { SiteIR } from '../ir/types'

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-lume-'))
  try {
    await fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('lume.emitConfig', () => {
  test('emits a _cms.ts that wires storage + each markdown collection with the right fields', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: 'fixtures/jekyll-minimal',
        ssg: 'jekyll',
        notes: [],
        collections: [
          {
            name: 'posts',
            label: 'Posts',
            folder: '_posts',
            format: 'markdown',
            slugFrom: 'filename',
            fields: [
              { name: 'title', type: 'string', required: true },
              { name: 'date', type: 'datetime', required: true },
              { name: 'tags', type: 'list', required: false },
              { name: 'draft', type: 'boolean', required: true },
              { name: 'body', type: 'markdown', required: true },
            ],
          },
        ],
      }
      await lume.emitConfig(ir, dir)

      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      // It must be valid TypeScript that wires up storage + collection
      expect(code).toContain('lumeCMS')
      expect(code).toContain('cms.storage(')
      expect(code).toContain('cms.collection(')
      expect(code).toContain('posts')
      expect(code).toContain('_posts/*.md')
      // Field-type widget mapping
      expect(code).toContain('title: text')
      expect(code).toContain('date: datetime')
      expect(code).toContain('tags: list')
      expect(code).toContain('draft: checkbox')
      // The IR's "body" markdown field maps to Lume's "content" convention.
      expect(code).toContain('content: markdown')
      expect(code).not.toContain('body: markdown')
      expect(code).toContain('export default cms')
    })
  })

  test('refuses to overwrite an existing _cms.ts unless { force: true } is passed', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = { siteRoot: 'x', ssg: 'jekyll', notes: [], collections: [] }
      await lume.emitConfig(ir, dir)
      await expect(lume.emitConfig(ir, dir)).rejects.toThrow(/exists/i)
      await expect(lume.emitConfig(ir, dir, { force: true })).resolves.toBeUndefined()
    })
  })

  test('emits a JSON folder collection for js-literals IR', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: 'C:/Users/Administrator/portfolio',
        ssg: 'js-literals',
        jsSource: 'C:/Users/Administrator/portfolio/app.js',
        notes: [],
        collections: [
          {
            name: 'DEVBLOG',
            label: 'Devblog',
            folder: '.simplesiteedit/data/DEVBLOG',
            format: 'json',
            slugFrom: 'filename',
            jsBinding: 'DEVBLOG',
            fields: [
              { name: 'title', type: 'string', required: true },
              { name: 'tags', type: 'list', required: false },
            ],
          },
        ],
      }
      await lume.emitConfig(ir, dir)

      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      expect(code).toContain('DEVBLOG')
      expect(code).toContain('.simplesiteedit/data/DEVBLOG/*.json')
    })
  })
})
