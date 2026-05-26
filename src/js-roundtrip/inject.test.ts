import { describe, test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inject } from './inject'

function withTmp(fn: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-test-'))
  try {
    fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('inject', () => {
  test('leaves source byte-identical when shadow matches original', () => {
    withTmp((dir) => {
      const src = join(dir, 'app.js')
      const original = `const POSTS = [{ title: 'hello' }]\n`
      writeFileSync(src, original)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      mkdirSync(join(shadowRoot, 'POSTS'), { recursive: true })
      writeFileSync(join(shadowRoot, 'POSTS', '0001.json'), JSON.stringify({ title: 'hello' }, null, 2) + '\n')

      const outPath = join(dir, 'out.js')
      inject(src, shadowRoot, outPath)
      expect(readFileSync(outPath, 'utf8')).toBe(original)
    })
  })
})
