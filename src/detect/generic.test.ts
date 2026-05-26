import { describe, test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { detect } from './generic'

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-generic-'))
  try {
    await fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('detect/generic', () => {
  test('detects fixtures/generic-md and returns the posts folder', async () => {
    const info = await detect('fixtures/generic-md')
    expect(info).toEqual({
      ssg: 'generic',
      root: 'fixtures/generic-md',
      contentFolder: 'posts',
    })
  })

  test('returns null when no markdown folder is present', async () => {
    await withTmp(async (dir) => {
      writeFileSync(join(dir, 'index.html'), '<html></html>')
      expect(await detect(dir)).toBeNull()
    })
  })

  test('returns null when an other-SSG marker is present (Jekyll)', async () => {
    await withTmp(async (dir) => {
      writeFileSync(join(dir, '_config.yml'), 'title: x\n')
      mkdirSync(join(dir, 'posts'))
      writeFileSync(join(dir, 'posts', 'p.md'), '---\ntitle: x\n---\nbody\n')
      expect(await detect(dir)).toBeNull()
    })
  })

  test('returns null when a markdown file has no frontmatter', async () => {
    await withTmp(async (dir) => {
      mkdirSync(join(dir, 'posts'))
      writeFileSync(join(dir, 'posts', 'p.md'), '# Just a heading, no frontmatter.\n')
      expect(await detect(dir)).toBeNull()
    })
  })
})
