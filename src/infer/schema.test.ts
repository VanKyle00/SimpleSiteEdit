import { describe, test, expect } from 'vitest'
import { inferSchema, inferSchemaFromSamples } from './schema'

describe('inferSchemaFromSamples (js-literals / json)', () => {
  test('unions object keys and infers types from in-memory samples', () => {
    const samples = [
      { title: 'Hello', tags: ['a', 'b'], featured: true, num: 42 },
      { title: 'World', featured: false, num: 7 },
    ]
    const fields = inferSchemaFromSamples(samples)
    const byName = Object.fromEntries(fields.map((f) => [f.name, f]))
    expect(byName.title).toMatchObject({ type: 'string', required: true })
    expect(byName.tags).toMatchObject({ type: 'list', required: false })
    expect(byName.featured).toMatchObject({ type: 'boolean', required: true })
    expect(byName.num).toMatchObject({ type: 'string', required: true })
  })

  test('treats an array of prose paragraphs as markdown, not list', () => {
    const samples = [
      {
        title: 'A devblog entry',
        tags: ['scheduling', 'rust', 'audio'],
        body: [
          'Last quarter I made the case for ripping out our job runner and replacing it with something built around explicit deadlines.',
          'The old runner used a priority queue with five tiers; in practice the queue was almost always saturated with tier-3 work.',
        ],
      },
    ]
    const fields = inferSchemaFromSamples(samples)
    const byName = Object.fromEntries(fields.map((f) => [f.name, f]))
    expect(byName.body).toMatchObject({ type: 'markdown' })
    // Tags are short strings — they remain a list.
    expect(byName.tags).toMatchObject({ type: 'list' })
  })

  test('short-string arrays stay as list (tags are not prose)', () => {
    const samples = [{ tags: ['intro', 'follow-up'] }]
    const fields = inferSchemaFromSamples(samples)
    expect(fields[0]).toMatchObject({ name: 'tags', type: 'list' })
  })

  test('arrays with any non-string element stay as list', () => {
    const samples = [
      {
        mixed: [
          'A long enough string that would otherwise qualify as prose on its own.',
          42,
        ],
      },
    ]
    const fields = inferSchemaFromSamples(samples)
    expect(fields[0]).toMatchObject({ name: 'mixed', type: 'list' })
  })
})

describe('inferSchema (markdown collection)', () => {
  test('produces the union of frontmatter keys with correct types and required flags', async () => {
    const fields = await inferSchema('fixtures/jekyll-minimal', '_posts', 'markdown')
    const byName = Object.fromEntries(fields.map((f) => [f.name, f]))

    // title and date appear in all 3 posts.
    expect(byName.title).toMatchObject({ type: 'string', required: true })
    expect(byName.date).toMatchObject({ type: 'datetime', required: true })

    // tags appear in 2 of 3 → required: false.
    expect(byName.tags).toMatchObject({ type: 'list', required: false })

    // draft appears in all 3.
    expect(byName.draft).toMatchObject({ type: 'boolean', required: true })

    // body is the post content itself → markdown, required.
    expect(byName.body).toMatchObject({ type: 'markdown', required: true })
  })
})
