// End-to-end smoke test of the js-literals watcher on a real-portfolio copy.
// Copies portfolio → temp, runs explode + watchAndInject, modifies a shadow file,
// verifies app.js gets rewritten, prints PASS/FAIL.

import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { explode } from '../src/js-roundtrip/explode.ts'
import { watchAndInject } from '../src/js-roundtrip/watch.ts'

const SRC = 'C:/Users/Administrator/portfolio'
const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-portfolio-smoke-'))
const dest = join(dir, 'portfolio')

let exitCode = 0
try {
  cpSync(SRC, dest, { recursive: true })
  const appJs = resolve(dest, 'app.js')
  const shadowRoot = resolve(dest, '.SimpleSiteEdit', 'data')

  console.log(`copied ${SRC} → ${dest}`)
  explode(appJs, shadowRoot)
  console.log(`exploded to ${shadowRoot}`)

  const before = readFileSync(appJs, 'utf8')

  let resolveWritten: () => void = () => {}
  const written = new Promise<void>((r) => { resolveWritten = r })

  const handle = await watchAndInject(appJs, shadowRoot, {
    onWrite: () => {
      console.log('watcher: onWrite fired')
      resolveWritten()
    },
    debounceMs: 100,
  })
  console.log('watcher started')

  // Mutate the first DEVBLOG entry's title.
  const devblogDir = join(shadowRoot, 'DEVBLOG')
  const firstFile = readdirSync(devblogDir).sort()[0]
  const target = join(devblogDir, firstFile)
  const entry = JSON.parse(readFileSync(target, 'utf8')) as Record<string, unknown>
  const oldTitle = entry.title
  entry.title = 'WATCHER ROUND-TRIP TEST'
  writeFileSync(target, JSON.stringify(entry, null, 2) + '\n')
  console.log(`mutated ${target}: ${JSON.stringify(oldTitle)} → ${JSON.stringify(entry.title)}`)

  // Wait for the watcher.
  await Promise.race([
    written,
    new Promise<void>((_, rej) => setTimeout(() => rej(new Error('timeout waiting for watcher')), 5000)),
  ])

  await handle.stop()
  console.log('watcher stopped')

  const after = readFileSync(appJs, 'utf8')
  const ok = after !== before && after.includes('WATCHER ROUND-TRIP TEST')
  if (!ok) {
    console.log('FAIL: app.js did NOT get the new title')
    exitCode = 1
  } else {
    console.log('PASS: app.js was rewritten with new title')
  }
} catch (e) {
  console.error('error:', (e as Error).message)
  exitCode = 1
} finally {
  rmSync(dir, { recursive: true, force: true })
  process.exit(exitCode)
}
