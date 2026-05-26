import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { SiteInfo } from '../ir/types.ts'
import { parseLiterals } from '../js-roundtrip/explode.ts'

// Tell-tale markers of other SSGs; if any are present, defer to that SSG's detector.
const OTHER_SSG_MARKERS = [
  '_config.yml',           // Jekyll
  'hugo.toml',
  'hugo.yaml',
  'hugo.json',
  'astro.config.mjs',
  'astro.config.ts',
  'astro.config.js',
  '.eleventy.js',
  '.eleventy.cjs',
  'eleventy.config.js',
  'eleventy.config.cjs',
  'next.config.js',
  'next.config.mjs',
  'next.config.ts',
  'next.config.cjs',
]

export async function detect(root: string): Promise<SiteInfo | null> {
  if (!existsSync(root) || !statSync(root).isDirectory()) return null

  const entries = readdirSync(root)

  for (const marker of OTHER_SSG_MARKERS) {
    if (entries.includes(marker)) return null
  }

  const hasHtml = entries.some((f) => f.endsWith('.html') || f.endsWith('.htm'))
  if (!hasHtml) return null

  // Find the JS file with the most top-level const arrays — that's the data file.
  let bestJs: { path: string; count: number } | null = null
  for (const name of entries) {
    if (!name.endsWith('.js') && !name.endsWith('.mjs')) continue
    const path = join(root, name)
    if (!statSync(path).isFile()) continue
    let source: string
    try {
      source = readFileSync(path, 'utf8')
    } catch {
      continue
    }
    let count = 0
    try {
      count = parseLiterals(source).size
    } catch {
      continue
    }
    if (count > 0 && (bestJs === null || count > bestJs.count)) {
      bestJs = { path, count }
    }
  }

  if (!bestJs) return null
  return { ssg: 'js-literals', root, jsSource: bestJs.path }
}
