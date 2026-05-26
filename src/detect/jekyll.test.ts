import { describe, test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { detect } from './jekyll'

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-detect-'))
  try {
    await fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('detect/jekyll', () => {
  test('returns SiteInfo when _config.yml exists at root', async () => {
    await withTmp(async (dir) => {
      writeFileSync(join(dir, '_config.yml'), 'title: x\n')
      const info = await detect(dir)
      expect(info).toEqual({
        ssg: 'jekyll',
        root: dir,
        configPath: join(dir, '_config.yml'),
      })
    })
  })

  test('returns null when no _config.yml is present', async () => {
    await withTmp(async (dir) => {
      writeFileSync(join(dir, 'index.html'), '<html></html>')
      const info = await detect(dir)
      expect(info).toBeNull()
    })
  })
})
