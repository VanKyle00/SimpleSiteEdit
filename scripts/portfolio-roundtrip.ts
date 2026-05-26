import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { explode } from '../src/js-roundtrip/explode.ts'
import { inject } from '../src/js-roundtrip/inject.ts'

const APP_JS = 'C:/Users/Administrator/portfolio/app.js'

const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-portfolio-'))
try {
  const original = readFileSync(APP_JS, 'utf8')
  const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
  const out = join(dir, 'out.js')

  console.log(`source: ${APP_JS} (${original.length} bytes)`)
  console.log(`exploding to: ${shadowRoot}`)
  explode(APP_JS, shadowRoot)
  console.log(`injecting to: ${out}`)
  inject(APP_JS, shadowRoot, out)

  const result = readFileSync(out, 'utf8')
  console.log(`output: ${result.length} bytes`)

  if (result === original) {
    console.log('IDENTICAL — round-trip is byte-perfect')
    process.exit(0)
  }

  console.log('DIFF — round-trip lost something')
  const minLen = Math.min(original.length, result.length)
  let firstDiff = -1
  for (let i = 0; i < minLen; i++) {
    if (original[i] !== result[i]) {
      firstDiff = i
      break
    }
  }
  if (firstDiff === -1) firstDiff = minLen

  const ctx = 80
  const start = Math.max(0, firstDiff - ctx)
  console.log(`\nfirst diff at byte ${firstDiff} (line ~${original.slice(0, firstDiff).split('\n').length}):`)
  console.log('--- original (context):')
  console.log(JSON.stringify(original.slice(start, firstDiff + ctx)))
  console.log('--- output (context):')
  console.log(JSON.stringify(result.slice(start, firstDiff + ctx)))

  writeFileSync(join(process.cwd(), 'roundtrip-original.js'), original)
  writeFileSync(join(process.cwd(), 'roundtrip-output.js'), result)
  console.log('\nFull files written to roundtrip-original.js and roundtrip-output.js for inspection')
  process.exit(1)
} finally {
  rmSync(dir, { recursive: true, force: true })
}
