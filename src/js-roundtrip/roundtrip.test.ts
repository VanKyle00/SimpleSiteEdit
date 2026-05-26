import { describe, test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { explode } from './explode'
import { inject } from './inject'

function withTmp(fn: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-roundtrip-'))
  try {
    fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('round-trip identity', () => {
  test('explode → inject (no changes) preserves source for a small synthetic file', () => {
    withTmp((dir) => {
      const original =
        `const TRACKS = [\n` +
        `  { id: 't1', name: 'Lead' },\n` +
        `  { id: 't2', name: 'Bass' }\n` +
        `];\n` +
        `\n` +
        `function render() {\n` +
        `  return TRACKS.map(t => t.name);\n` +
        `}\n`
      const src = join(dir, 'app.js')
      writeFileSync(src, original)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      const out = join(dir, 'out.js')

      explode(src, shadowRoot)
      inject(src, shadowRoot, out)

      expect(readFileSync(out, 'utf8')).toBe(original)
    })
  })

  test('paragraph-array survives explode → no-edit inject (joined in shadow, split back to array)', () => {
    withTmp((dir) => {
      const para1 = 'Last quarter I made the case for ripping out our job runner.'
      const para2 = 'The old runner used a priority queue with five tiers.'
      const original =
        `const DEVBLOG = [{ body: [${JSON.stringify(para1)}, ${JSON.stringify(para2)}] }];\n`
      const src = join(dir, 'app.js')
      writeFileSync(src, original)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      const out = join(dir, 'out.js')

      explode(src, shadowRoot)
      // Shadow JSON should contain the joined string (verified in explode.test.ts).
      inject(src, shadowRoot, out)

      // With no edits in the shadow, inject must leave the source byte-identical.
      expect(readFileSync(out, 'utf8')).toBe(original)
    })
  })

  test('modifying a shadow entry preserves the rest of the file verbatim', () => {
    withTmp((dir) => {
      const original =
        `// Header comment.\n` +
        `const TRACKS = [{ id: 't1', name: 'Lead' }];\n` +
        `\n` +
        `// Trailing comment with care.\n` +
        `function render() {\n` +
        `  return TRACKS;\n` +
        `}\n`
      const src = join(dir, 'app.js')
      writeFileSync(src, original)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      const out = join(dir, 'out.js')

      explode(src, shadowRoot)
      // mutate the shadow entry
      writeFileSync(
        join(shadowRoot, 'TRACKS', '0001.json'),
        JSON.stringify({ id: 't1', name: 'Lead REWRITTEN' }, null, 2) + '\n',
      )
      inject(src, shadowRoot, out)

      const result = readFileSync(out, 'utf8')

      // The name change must be present.
      expect(result).toContain('Lead REWRITTEN')
      // Surrounding code (comments, function, blank line) must be preserved.
      expect(result).toContain('// Header comment.')
      expect(result).toContain('// Trailing comment with care.')
      expect(result).toContain('function render() {\n  return TRACKS;\n}')
    })
  })

  test('a standalone image-only paragraph round-trips byte-identical', () => {
    withTmp((dir) => {
      const para1 = 'Last quarter I made the case for ripping out our job runner.'
      const image = '![inserted screenshot](/images/runner.png)'
      const para2 = 'The new runner uses a single FIFO queue with no priorities.'
      const original =
        `const DEVBLOG = [{ body: [${JSON.stringify(para1)}, ${JSON.stringify(image)}, ${JSON.stringify(para2)}] }];\n`
      const src = join(dir, 'app.js')
      writeFileSync(src, original)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      const out = join(dir, 'out.js')

      explode(src, shadowRoot)
      inject(src, shadowRoot, out)

      expect(readFileSync(out, 'utf8')).toBe(original)
    })
  })

  test('an inline image inside a paragraph round-trips byte-identical', () => {
    withTmp((dir) => {
      const inlineParagraph =
        'Here is the diagram ![architecture](/images/arch.svg) — note the new queue layer in the middle.'
      const other = 'A short follow-up paragraph with no image at all in it.'
      const original =
        `const DEVBLOG = [{ body: [${JSON.stringify(inlineParagraph)}, ${JSON.stringify(other)}] }];\n`
      const src = join(dir, 'app.js')
      writeFileSync(src, original)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      const out = join(dir, 'out.js')

      explode(src, shadowRoot)
      inject(src, shadowRoot, out)

      expect(readFileSync(out, 'utf8')).toBe(original)
    })
  })
})
