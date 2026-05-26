import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { SiteInfo } from '../ir/types.ts'

// Folders where personal sites commonly stash markdown content.
const CANDIDATE_FOLDERS = [
  'content/posts',
  'content/blog',
  '_posts',
  'posts',
  'src/content/blog',
  'src/content/posts',
  'pages',
]

// If any of these are present, defer to that SSG's detector.
const OTHER_SSG_MARKERS = [
  '_config.yml',
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

  for (const folder of CANDIDATE_FOLDERS) {
    const path = join(root, folder)
    if (!existsSync(path) || !statSync(path).isDirectory()) continue
    if (!hasMarkdownWithFrontmatter(path)) continue
    return { ssg: 'generic', root, contentFolder: folder }
  }

  return null
}

function hasMarkdownWithFrontmatter(dir: string): boolean {
  const files = readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.markdown') || f.endsWith('.mdx'))
  for (const name of files) {
    try {
      const head = readFileSync(join(dir, name), 'utf8').slice(0, 200)
      if (/^---\s*\n/.test(head)) return true
    } catch {
      continue
    }
  }
  return false
}
