import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { SiteInfo, SSG, CollectionFormat } from '../ir/types.ts'
import { parseLiterals } from '../js-roundtrip/explode.ts'

export type CollectionStub = {
  name: string
  label: string
  folder: string
  format: CollectionFormat
  slugFrom: 'filename' | 'frontmatter.slug' | 'frontmatter.id'
  samples?: Array<Record<string, unknown>>
  jsBinding?: string
}

export type InferResult = {
  stubs: CollectionStub[]
  notes: string[]
}

// Conventional content folders per SSG. First matching folder per SSG wins for now;
// we list a couple of well-known alternates so common variations are covered.
type Convention = {
  name: string
  label: string
  folder: string
  format: CollectionFormat
}

const SSG_CONVENTIONS: Partial<Record<SSG, Convention[]>> = {
  jekyll: [
    { name: 'posts', label: 'Posts', folder: '_posts', format: 'markdown' },
  ],
  hugo: [
    { name: 'posts', label: 'Posts', folder: 'content/posts', format: 'markdown' },
    { name: 'blog',  label: 'Blog',  folder: 'content/blog',  format: 'markdown' },
  ],
  eleventy: [
    { name: 'posts', label: 'Posts', folder: 'posts',  format: 'markdown' },
    { name: 'posts', label: 'Posts', folder: '_posts', format: 'markdown' },
  ],
  astro: [
    { name: 'blog',  label: 'Blog',  folder: 'src/content/blog',  format: 'markdown' },
    { name: 'posts', label: 'Posts', folder: 'src/content/posts', format: 'markdown' },
  ],
  'next-mdx': [
    { name: 'posts', label: 'Posts', folder: 'posts',         format: 'mdx' },
    { name: 'posts', label: 'Posts', folder: 'content/posts', format: 'mdx' },
  ],
}

export async function inferCollections(info: SiteInfo): Promise<InferResult> {
  if (info.ssg === 'js-literals') return inferJsLiterals(info)
  if (info.ssg === 'generic') return { stubs: inferGeneric(info), notes: [] }

  const conventions = SSG_CONVENTIONS[info.ssg]
  if (conventions) return { stubs: inferConventional(info, conventions), notes: [] }

  return { stubs: [], notes: [] }
}

function inferGeneric(info: SiteInfo): CollectionStub[] {
  if (!info.contentFolder) return []
  return [{
    name: 'posts',
    label: 'Posts',
    folder: info.contentFolder,
    format: 'markdown',
    slugFrom: 'filename',
  }]
}

function inferConventional(info: SiteInfo, conventions: Convention[]): CollectionStub[] {
  const seen = new Set<string>()
  const out: CollectionStub[] = []
  for (const conv of conventions) {
    const p = join(info.root, conv.folder)
    if (!existsSync(p) || !statSync(p).isDirectory()) continue
    if (seen.has(conv.name)) continue
    seen.add(conv.name)
    out.push({
      name: conv.name,
      label: conv.label,
      folder: conv.folder,
      format: conv.format,
      slugFrom: 'filename',
    })
  }
  return out
}

function inferJsLiterals(info: SiteInfo): InferResult {
  const stubs: CollectionStub[] = []
  const notes: string[] = []
  if (!info.jsSource) return { stubs, notes }

  const source = readFileSync(info.jsSource, 'utf8')
  const literals = parseLiterals(source)

  for (const [name, entries] of literals) {
    if (entries.length === 0) {
      notes.push(`${name}: empty array — skipped (no entries to infer a schema from).`)
      continue
    }
    const allObjects = entries.every(isPlainObject)
    if (!allObjects) {
      const first = entries[0]
      const shape = Array.isArray(first) ? 'nested array (2D)' : `array of ${typeof first}`
      notes.push(`${name}: not editable — ${shape}.`)
      continue
    }
    stubs.push({
      name,
      label: humanize(name),
      folder: `.simplesiteedit/data/${name}`,
      format: 'json',
      slugFrom: 'filename',
      samples: entries.slice(0, 5) as Array<Record<string, unknown>>,
      jsBinding: name,
    })
  }

  return { stubs, notes }
}

function isPlainObject(v: unknown): boolean {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function humanize(name: string): string {
  return name
    .toLowerCase()
    .split('_')
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
}
