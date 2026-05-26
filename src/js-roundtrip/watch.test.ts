import { describe, test, expect } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { explode } from './explode'
import { watchAndInject } from './watch'

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-watch-'))
  try {
    await fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('watchAndInject', () => {
  test('rewrites the JS source file when a shadow JSON file changes', async () => {
    await withTmp(async (dir) => {
      const src = join(dir, 'app.js')
      writeFileSync(src, `const POSTS = [{ title: 'original' }]\n`)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      explode(src, shadowRoot)

      let resolveWritten: () => void = () => {}
      const written = new Promise<void>((r) => { resolveWritten = r })
      const handle = await watchAndInject(src, shadowRoot, { onWrite: resolveWritten, debounceMs: 50 })

      // Mutate the shadow file.
      writeFileSync(
        join(shadowRoot, 'POSTS', '0001.json'),
        JSON.stringify({ title: 'rewritten by watcher' }, null, 2) + '\n',
      )

      await written
      await handle.stop()

      expect(readFileSync(src, 'utf8')).toContain('rewritten by watcher')
    }, 10000)
  }, 10000)

  test('detects external edit of the JS source and skips inject', async () => {
    await withTmp(async (dir) => {
      const src = join(dir, 'app.js')
      writeFileSync(src, `const POSTS = [{ title: 'original' }]\n`)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      explode(src, shadowRoot)

      let conflictFired = 0
      let writeFired = 0
      let resolveDone: () => void = () => {}
      const done = new Promise<void>((r) => { resolveDone = r })

      const handle = await watchAndInject(src, shadowRoot, {
        onWrite: () => { writeFired++ },
        onConflict: () => { conflictFired++; resolveDone() },
        debounceMs: 50,
      })

      // Simulate hand-edit of app.js outside SimpleSiteEdit: change mtime AND content.
      await new Promise((r) => setTimeout(r, 50))
      writeFileSync(src, `const POSTS = [{ title: 'hand edited' }]\n// extra comment\n`)

      // Now mutate a shadow file — watcher should detect mtime mismatch and skip.
      await new Promise((r) => setTimeout(r, 50))
      writeFileSync(
        join(shadowRoot, 'POSTS', '0001.json'),
        JSON.stringify({ title: 'would be lost' }, null, 2) + '\n',
      )

      await done
      await handle.stop()

      expect(conflictFired).toBe(1)
      expect(writeFired).toBe(0)
      // The hand-edited content must survive.
      expect(readFileSync(src, 'utf8')).toContain('hand edited')
    }, 10000)
  }, 10000)

  test('debounces multiple rapid changes into one write', async () => {
    await withTmp(async (dir) => {
      const src = join(dir, 'app.js')
      writeFileSync(src, `const POSTS = [{ title: 'a' }, { title: 'b' }, { title: 'c' }]\n`)
      const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
      explode(src, shadowRoot)

      let writeCount = 0
      let resolveWritten: () => void = () => {}
      const firstWrite = new Promise<void>((r) => { resolveWritten = r })
      const handle = await watchAndInject(src, shadowRoot, {
        onWrite: () => {
          writeCount++
          resolveWritten()
        },
        debounceMs: 100,
      })

      // Three rapid writes, all within debounce window.
      const dir2 = join(shadowRoot, 'POSTS')
      writeFileSync(join(dir2, '0001.json'), JSON.stringify({ title: 'A1' }, null, 2))
      writeFileSync(join(dir2, '0002.json'), JSON.stringify({ title: 'B1' }, null, 2))
      writeFileSync(join(dir2, '0003.json'), JSON.stringify({ title: 'C1' }, null, 2))

      await firstWrite
      // Give chokidar a beat to ensure no additional writes accumulate.
      await new Promise((r) => setTimeout(r, 250))
      await handle.stop()

      expect(writeCount).toBe(1)
    }, 10000)
  }, 10000)
})
