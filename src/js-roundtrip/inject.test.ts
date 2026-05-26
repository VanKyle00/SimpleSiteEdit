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

  test('splits a paragraph string in shadow back into a string-array in source', () => {
    withTmp((dir) => {
      const src = join(dir, 'app.js')
      const para1 = 'Last quarter I made the case for ripping out our job runner.'
      const para2 = 'The old runner used a priority queue with five tiers.'
      const para3 = 'The new runner takes a deadline per task and an estimated duration.'
      const original =
        `const DEVBLOG = [{ title: 'x', body: [${JSON.stringify(para1)}, ${JSON.stringify(para2)}] }]\n`
      writeFileSync(src, original)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      mkdirSync(join(shadowRoot, 'DEVBLOG'), { recursive: true })
      // Lume saves the body as a single string with paragraph 3 appended.
      writeFileSync(
        join(shadowRoot, 'DEVBLOG', '0001.json'),
        JSON.stringify({ title: 'x', body: `${para1}\n\n${para2}\n\n${para3}` }, null, 2) + '\n',
      )

      const outPath = join(dir, 'out.js')
      inject(src, shadowRoot, outPath)
      const result = readFileSync(outPath, 'utf8')
      expect(result).toContain(JSON.stringify(para1))
      expect(result).toContain(JSON.stringify(para2))
      expect(result).toContain(JSON.stringify(para3))
      // The body must be an array literal, not a single string.
      expect(result).toMatch(/body:\s*\[/)
    })
  })

  test('no-op rewrite when shadow string matches the joined source paragraphs', () => {
    withTmp((dir) => {
      const src = join(dir, 'app.js')
      const para1 = 'Last quarter I made the case for ripping out our job runner.'
      const para2 = 'The old runner used a priority queue with five tiers.'
      const original =
        `const DEVBLOG = [{ body: [${JSON.stringify(para1)}, ${JSON.stringify(para2)}] }]\n`
      writeFileSync(src, original)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      mkdirSync(join(shadowRoot, 'DEVBLOG'), { recursive: true })
      writeFileSync(
        join(shadowRoot, 'DEVBLOG', '0001.json'),
        JSON.stringify({ body: `${para1}\n\n${para2}` }, null, 2) + '\n',
      )

      const outPath = join(dir, 'out.js')
      inject(src, shadowRoot, outPath)
      // Source had no real change → file content stays byte-identical.
      expect(readFileSync(outPath, 'utf8')).toBe(original)
    })
  })
})
