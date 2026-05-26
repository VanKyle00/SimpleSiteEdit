import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { explode } from '../src/js-roundtrip/explode.ts'
import { inject } from '../src/js-roundtrip/inject.ts'

const APP_JS = 'C:/Users/Administrator/portfolio/app.js'

const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-inspect-'))
const original = readFileSync(APP_JS, 'utf8')
const shadowRoot = join(dir, '.SimpleSiteEdit', 'data')
const out = join(dir, 'out.js')

explode(APP_JS, shadowRoot)

const firstFile = readdirSync(join(shadowRoot, 'DEVBLOG')).sort()[0]
const firstPath = join(shadowRoot, 'DEVBLOG', firstFile)
const entry = JSON.parse(readFileSync(firstPath, 'utf8')) as Record<string, unknown>
const oldTitle = entry.title as string
entry.title = 'SIMPLESITEEDIT MODIFIED THIS TITLE'
writeFileSync(firstPath, JSON.stringify(entry, null, 2) + '\n')

inject(APP_JS, shadowRoot, out)
const result = readFileSync(out, 'utf8')

console.log('OLD title:', JSON.stringify(oldTitle))
const oldIndices: number[] = []
let idx = 0
while ((idx = result.indexOf(oldTitle, idx)) !== -1) {
  oldIndices.push(idx)
  idx += oldTitle.length
}
console.log(`OLD title appears ${oldIndices.length} time(s) in OUTPUT at offsets:`, oldIndices)

// Look at original to compare
const origIndices: number[] = []
idx = 0
while ((idx = original.indexOf(oldTitle, idx)) !== -1) {
  origIndices.push(idx)
  idx += oldTitle.length
}
console.log(`OLD title appears ${origIndices.length} time(s) in ORIGINAL at offsets:`, origIndices)

// Show each old-title occurrence with context.
for (const i of oldIndices) {
  console.log(`\n--- output context @ ${i}:`)
  console.log(JSON.stringify(result.slice(Math.max(0, i - 60), i + 60)))
}

// What lines outside DEVBLOG changed?
const devblogStart = result.indexOf('const DEVBLOG')
const devblogEnd = result.indexOf('const RELEASES')
console.log(`\nDEVBLOG block in output: bytes ${devblogStart}-${devblogEnd}`)

// Compare regions before and after DEVBLOG, byte-for-byte.
const origDevblogStart = original.indexOf('const DEVBLOG')
const origDevblogEnd = original.indexOf('const RELEASES')

const origBefore = original.slice(0, origDevblogStart)
const outBefore = result.slice(0, devblogStart)
console.log(`\nBytes BEFORE DEVBLOG identical: ${origBefore === outBefore}  (orig=${origBefore.length}, out=${outBefore.length})`)

const origAfter = original.slice(origDevblogEnd)
const outAfter = result.slice(devblogEnd)
console.log(`Bytes AFTER DEVBLOG identical:  ${origAfter === outAfter}   (orig=${origAfter.length}, out=${outAfter.length})`)

writeFileSync(join(process.cwd(), 'inspect-output.js'), result)
console.log('\nFull modified output saved to inspect-output.js')

rmSync(dir, { recursive: true, force: true })
