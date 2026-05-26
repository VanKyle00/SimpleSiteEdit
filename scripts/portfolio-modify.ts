import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { explode } from '../src/js-roundtrip/explode.ts'
import { inject } from '../src/js-roundtrip/inject.ts'

const APP_JS = 'C:/Users/Administrator/portfolio/app.js'

const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-portfolio-modify-'))
try {
  const original = readFileSync(APP_JS, 'utf8')
  const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
  const out = join(dir, 'out.js')

  explode(APP_JS, shadowRoot)

  // Modify one entry in DEVBLOG (first post): rewrite its title.
  const devblogDir = join(shadowRoot, 'DEVBLOG')
  const firstFile = readdirSync(devblogDir).sort()[0]
  const firstPath = join(devblogDir, firstFile)
  const entry = JSON.parse(readFileSync(firstPath, 'utf8')) as Record<string, unknown>
  const oldTitle = entry.title
  entry.title = 'SIMPLESITEEDIT MODIFIED THIS TITLE'
  writeFileSync(firstPath, JSON.stringify(entry, null, 2) + '\n')

  inject(APP_JS, shadowRoot, out)
  const result = readFileSync(out, 'utf8')

  console.log(`source: ${original.length} bytes, output: ${result.length} bytes`)
  console.log(`old title: ${JSON.stringify(oldTitle)}`)
  console.log(`new title: ${JSON.stringify(entry.title)}`)
  console.log(`new title present in output: ${result.includes(String(entry.title))}`)
  console.log(`old title still present:     ${result.includes(String(oldTitle))}`)

  // Count differing lines, roughly.
  const aLines = original.split('\n')
  const bLines = result.split('\n')
  let differing = 0
  const maxLen = Math.max(aLines.length, bLines.length)
  for (let i = 0; i < maxLen; i++) {
    if (aLines[i] !== bLines[i]) differing++
  }
  console.log(`lines changed (rough): ${differing} / ${maxLen}`)

  // Print a small range around the changed area.
  for (let i = 0; i < maxLen; i++) {
    if (aLines[i] !== bLines[i]) {
      const start = Math.max(0, i - 2)
      const end = Math.min(maxLen, i + 3)
      console.log(`\nFirst diff in line ${i + 1}:`)
      for (let j = start; j < end; j++) {
        if (aLines[j] !== bLines[j]) {
          console.log(`  - L${j + 1} OLD: ${aLines[j]}`)
          console.log(`  + L${j + 1} NEW: ${bLines[j]}`)
        } else {
          console.log(`    L${j + 1}:    ${aLines[j]}`)
        }
      }
      break
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true })
}
