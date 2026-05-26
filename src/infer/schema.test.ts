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
