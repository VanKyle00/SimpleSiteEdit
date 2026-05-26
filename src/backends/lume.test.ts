import { describe, test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, existsSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { lume, ensureImageStore } from './lume'
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

  test('keeps the body field name on a json-format collection (no body→content rename)', async () => {
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
              { name: 'body', type: 'markdown', required: true },
            ],
          },
        ],
      }
      await lume.emitConfig(ir, dir)
      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      // For json-format collections, the JSON key is literal — Lume must see `body`,
      // not the markdown-storage convention `content`.
      expect(code).toContain('body: markdown')
      expect(code).not.toContain('content: markdown')
    })
  })
})

describe('lume.emitConfig — image uploads', () => {
  test('emits cms.upload when ir.imageRoot is set', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: 'fixtures/jekyll-minimal',
        ssg: 'jekyll',
        notes: [],
        collections: [],
        imageRoot: { storeFsPath: 'assets/images', publicPath: '/assets/images/' },
      }
      await lume.emitConfig(ir, dir)
      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      expect(code).toContain('cms.upload(')
      expect(code).toContain('"name": "images"')
      expect(code).toContain('"store": "fs:assets/images"')
      expect(code).toContain('"publicPath": "/assets/images/"')
    })
  })

  test('omits cms.upload when ir.imageRoot is not set', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: 'fixtures/jekyll-minimal',
        ssg: 'jekyll',
        notes: [],
        collections: [],
      }
      await lume.emitConfig(ir, dir)
      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      expect(code).not.toContain('cms.upload(')
    })
  })

  test('upload block is emitted before the first cms.collection', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: 'fixtures/jekyll-minimal',
        ssg: 'jekyll',
        notes: [],
        imageRoot: { storeFsPath: 'images', publicPath: '/images/' },
        collections: [
          {
            name: 'posts',
            label: 'Posts',
            folder: '_posts',
            format: 'markdown',
            slugFrom: 'filename',
            fields: [{ name: 'body', type: 'markdown', required: true }],
          },
        ],
      }
      await lume.emitConfig(ir, dir)
      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      const uploadIdx = code.indexOf('cms.upload(')
      const collectionIdx = code.indexOf('cms.collection(')
      expect(uploadIdx).toBeGreaterThan(-1)
      expect(collectionIdx).toBeGreaterThan(-1)
      expect(uploadIdx).toBeLessThan(collectionIdx)
    })
  })

  test('forward-slashes storeFsPath in the emitted store argument', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: 'C:/x',
        ssg: 'jekyll',
        notes: [],
        collections: [],
        imageRoot: { storeFsPath: 'static\\uploads', publicPath: '/uploads/' },
      }
      await lume.emitConfig(ir, dir)
      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      expect(code).toContain('"store": "fs:static/uploads"')
      expect(code).not.toContain('static\\\\uploads')
    })
  })
})

describe('lume.emitConfig — markdown widget upload binding', () => {
  test('markdown fields use object form with `upload: "images"` when imageRoot is set', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: 'fixtures/jekyll-minimal',
        ssg: 'jekyll',
        notes: [],
        imageRoot: { storeFsPath: 'images', publicPath: '/images/' },
        collections: [
          {
            name: 'posts',
            label: 'Posts',
            folder: '_posts',
            format: 'markdown',
            slugFrom: 'filename',
            fields: [{ name: 'body', type: 'markdown', required: true }],
          },
        ],
      }
      await lume.emitConfig(ir, dir)
      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      expect(code).toContain('"name": "content"')
      expect(code).toContain('"type": "markdown"')
      expect(code).toMatch(/"upload":\s*"images"/)
      expect(code).not.toMatch(/"uploads":\s*"images"/)
      expect(code).not.toContain('content: markdown')
    })
  })

  test('markdown fields keep shorthand form when imageRoot is NOT set', async () => {
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
            fields: [{ name: 'body', type: 'markdown', required: true }],
          },
        ],
      }
      await lume.emitConfig(ir, dir)
      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      expect(code).toContain('content: markdown')
      expect(code).not.toMatch(/"upload":\s*"images"/)
    })
  })

  test('non-markdown fields keep shorthand form even when imageRoot is set', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: 'fixtures/jekyll-minimal',
        ssg: 'jekyll',
        notes: [],
        imageRoot: { storeFsPath: 'images', publicPath: '/images/' },
        collections: [
          {
            name: 'posts',
            label: 'Posts',
            folder: '_posts',
            format: 'markdown',
            slugFrom: 'filename',
            fields: [
              { name: 'title', type: 'string', required: true },
              { name: 'body', type: 'markdown', required: true },
            ],
          },
        ],
      }
      await lume.emitConfig(ir, dir)
      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      expect(code).toContain('title: text')
    })
  })

  test('on JSON-format collections (js-literals), body keeps name `body` and gets upload binding', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: 'C:/Users/Administrator/portfolio',
        ssg: 'js-literals',
        jsSource: 'C:/Users/Administrator/portfolio/app.js',
        notes: [],
        imageRoot: { storeFsPath: 'images', publicPath: '/images/' },
        collections: [
          {
            name: 'DEVBLOG',
            label: 'Devblog',
            folder: '.simplesiteedit/data/DEVBLOG',
            format: 'json',
            slugFrom: 'filename',
            jsBinding: 'DEVBLOG',
            fields: [
              { name: 'body', type: 'markdown', required: true },
            ],
          },
        ],
      }
      await lume.emitConfig(ir, dir)
      const code = readFileSync(join(dir, 'lume', '_cms.ts'), 'utf8')
      expect(code).toContain('"name": "body"')
      expect(code).not.toContain('"name": "content"')
      expect(code).toMatch(/"upload":\s*"images"/)
    })
  })
})

describe('ensureImageStore', () => {
  test('creates the image store directory when missing', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: dir,
        ssg: 'jekyll',
        notes: [],
        collections: [],
        imageRoot: { storeFsPath: 'static/uploads', publicPath: '/uploads/' },
      }
      ensureImageStore(ir)
      const created = join(dir, 'static', 'uploads')
      expect(existsSync(created)).toBe(true)
      expect(statSync(created).isDirectory()).toBe(true)
    })
  })

  test('is a no-op when imageRoot is not set', async () => {
    await withTmp(async (dir) => {
      const ir: SiteIR = {
        siteRoot: dir,
        ssg: 'jekyll',
        notes: [],
        collections: [],
      }
      ensureImageStore(ir)
      expect(existsSync(join(dir, 'images'))).toBe(false)
    })
  })

  test('is idempotent when the directory already exists', async () => {
    await withTmp(async (dir) => {
      mkdirSync(join(dir, 'images'))
      const ir: SiteIR = {
        siteRoot: dir,
        ssg: 'jekyll',
        notes: [],
        collections: [],
        imageRoot: { storeFsPath: 'images', publicPath: '/images/' },
      }
      ensureImageStore(ir)
      ensureImageStore(ir)
      expect(existsSync(join(dir, 'images'))).toBe(true)
    })
  })
})
