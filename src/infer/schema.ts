import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import type { Field, FieldType, CollectionFormat } from '../ir/types.ts'

const SAMPLE_SIZE = 5

export async function inferSchema(
  siteRoot: string,
  folder: string,
  format: CollectionFormat,
): Promise<Field[]> {
  const dir = join(siteRoot, folder)
  const exts = format === 'mdx' ? ['.mdx'] : ['.md', '.markdown']
  const all = readdirSync(dir)
    .filter((f) => exts.some((e) => f.endsWith(e)))
    .sort()
  const sample = all.slice(0, SAMPLE_SIZE)

  const samples: Array<Record<string, unknown>> = []
  const bodies: string[] = []
  for (const filename of sample) {
    const raw = readFileSync(join(dir, filename), 'utf8')
    const parsed = matter(raw)
    samples.push(parsed.data as Record<string, unknown>)
    bodies.push(parsed.content)
  }

  const fields = inferSchemaFromSamples(samples)
  if (format === 'markdown' || format === 'mdx') {
    const allHaveBody = bodies.length > 0 && bodies.every((b) => b.trim().length > 0)
    fields.push({ name: 'body', type: 'markdown', required: allHaveBody })
  }
  return fields
}

export function inferSchemaFromSamples(samples: Array<Record<string, unknown>>): Field[] {
  if (samples.length === 0) return []

  // For each sample: { key → { type, example } }
  const seen: Array<Map<string, { type: FieldType; example?: string }>> = samples.map((sample) => {
    const m = new Map<string, { type: FieldType; example?: string }>()
    for (const [k, v] of Object.entries(sample)) {
      m.set(k, { type: inferType(k, v), example: exampleOf(v) })
    }
    return m
  })

  const unionKeys = new Set<string>()
  for (const s of seen) for (const k of s.keys()) unionKeys.add(k)

  const fields: Field[] = []
  for (const k of unionKeys) {
    let agreedType: FieldType | undefined
    let example: string | undefined
    let presentCount = 0
    for (const s of seen) {
      const entry = s.get(k)
      if (!entry) continue
      presentCount++
      if (agreedType === undefined) agreedType = entry.type
      else if (agreedType !== entry.type) agreedType = 'string'
      if (example === undefined && entry.example !== undefined) example = entry.example
    }
    fields.push({
      name: k,
      type: agreedType ?? 'unknown',
      required: presentCount === seen.length,
      ...(example !== undefined ? { example } : {}),
    })
  }
  return fields
}

function inferType(key: string, value: unknown): FieldType {
  if (value === null || value === undefined) return 'unknown'
  if (value instanceof Date) return 'datetime'
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) {
    if (isProseArray(value)) return 'markdown'
    return 'list'
  }
  if (typeof value === 'string') {
    if (isIsoDate(value)) return 'datetime'
    if (isImagePath(key, value)) return 'image'
    return 'string'
  }
  if (typeof value === 'number') return 'string'
  return 'unknown'
}

/**
 * True when an array looks like a sequence of prose paragraphs (a blog body
 * stored as `body: ['para1', 'para2', ...]`) rather than a list of tags.
 *
 * Heuristic: every element is a string of at least 40 chars containing whitespace.
 * Tag-shaped arrays like `['intro', 'follow-up']` don't qualify.
 */
export function isProseArray(value: unknown): value is string[] {
  if (!Array.isArray(value)) return false
  if (value.length === 0) return false
  return value.every(
    (el) => typeof el === 'string' && el.length >= 40 && /\s/.test(el),
  )
}

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(s)
}

function isImagePath(key: string, s: string): boolean {
  const lower = s.toLowerCase()
  const imageExts = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif', '.avif']
  if (imageExts.some((e) => lower.endsWith(e))) return true
  if (/(^|\/)images?\//i.test(s)) return true
  if (/^(cover|image|thumbnail|photo)$/i.test(key) && lower.includes('/')) return true
  return false
}

function exampleOf(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (Array.isArray(value)) return value.length > 0 ? String(value[0]) : undefined
  if (typeof value === 'object') return undefined
  return String(value)
}
