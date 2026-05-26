import { describe, test, expect } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { detect } from './js-literals'

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-detect-jsl-'))
  try {
    await fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('detect/js-literals', () => {
  test('returns SiteInfo with jsSource when root has an HTML file and a JS file with top-level const arrays', async () => {
    await withTmp(async (dir) => {
      writeFileSync(join(dir, 'index.html'), '<html><script src="app.js"></script></html>')
      writeFileSync(join(dir, 'app.js'), `const POSTS = [{ title: 'hi' }]`)
      const info = await detect(dir)
      expect(info).toEqual({
        ssg: 'js-literals',
        root: dir,
        jsSource: join(dir, 'app.js'),
      })
    })
  })

  test('returns null when no HTML file is present', async () => {
    await withTmp(async (dir) => {
      writeFileSync(join(dir, 'app.js'), `const POSTS = [{ title: 'hi' }]`)
      const info = await detect(dir)
      expect(info).toBeNull()
    })
  })

  test('returns null when no JS file has top-level const arrays', async () => {
    await withTmp(async (dir) => {
      writeFileSync(join(dir, 'index.html'), '<html></html>')
      writeFileSync(join(dir, 'app.js'), `function render() { return 1 }`)
      const info = await detect(dir)
      expect(info).toBeNull()
    })
  })

  test('returns null when a Jekyll _config.yml is present (do not steal Jekyll sites)', async () => {
    await withTmp(async (dir) => {
      writeFileSync(join(dir, 'index.html'), '<html></html>')
      writeFileSync(join(dir, 'app.js'), `const POSTS = [{ title: 'hi' }]`)
      writeFileSync(join(dir, '_config.yml'), 'title: x')
      const info = await detect(dir)
      expect(info).toBeNull()
    })
  })
})
