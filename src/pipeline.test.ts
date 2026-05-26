import { describe, test, expect } from 'vitest'
import { buildIR } from './pipeline'

describe('buildIR', () => {
  test('produces a SiteIR for the Jekyll fixture', async () => {
    const ir = await buildIR('fixtures/jekyll-minimal')

    expect(ir.ssg).toBe('jekyll')
    expect(ir.siteRoot).toBe('fixtures/jekyll-minimal')

    const posts = ir.collections.find((c) => c.name === 'posts')
    expect(posts).toBeDefined()
    expect(posts!.folder).toBe('_posts')
    expect(posts!.format).toBe('markdown')

    const fieldNames = posts!.fields.map((f) => f.name).sort()
    expect(fieldNames).toEqual(['body', 'date', 'draft', 'tags', 'title'])
  })

  test('returns a generic IR with no collections when no markdown folder is found', async () => {
    const ir = await buildIR('fixtures')  // top-level fixtures dir
    expect(ir.ssg).toBe('generic')
    expect(ir.collections).toEqual([])
  })

  test('detects fixtures/generic-md as a generic site with a posts collection', async () => {
    const ir = await buildIR('fixtures/generic-md')
    expect(ir.ssg).toBe('generic')
    const posts = ir.collections.find((c) => c.folder === 'posts')
    expect(posts).toBeDefined()
    expect(posts!.format).toBe('markdown')
    const fieldNames = posts!.fields.map((f) => f.name)
    expect(fieldNames).toContain('title')
    expect(fieldNames).toContain('body')
  })

  test('produces an IR for the js-literals fixture with editable collections + notes', async () => {
    const ir = await buildIR('fixtures/js-literals')
    expect(ir.ssg).toBe('js-literals')
    expect(ir.jsSource).toMatch(/app\.js$/)
    const names = ir.collections.map((c) => c.name).sort()
    expect(names).toEqual(['POSTS', 'TRACKS'])
    expect(ir.notes.length).toBe(2)
    expect(ir.notes.join(' ')).toMatch(/GRID/)
    expect(ir.notes.join(' ')).toMatch(/VIEWS/)
  })

  test.each([
    { ssg: 'hugo',     fixture: 'fixtures/hugo-minimal',     postsFolder: 'content/posts',    format: 'markdown' },
    { ssg: 'eleventy', fixture: 'fixtures/eleventy-minimal', postsFolder: 'posts',            format: 'markdown' },
    { ssg: 'astro',    fixture: 'fixtures/astro-minimal',    postsFolder: 'src/content/blog', format: 'markdown' },
    { ssg: 'next-mdx', fixture: 'fixtures/next-mdx-minimal', postsFolder: 'posts',            format: 'mdx' },
  ])('produces an IR for $ssg with the expected posts collection', async ({ ssg, fixture, postsFolder, format }) => {
    const ir = await buildIR(fixture)
    expect(ir.ssg).toBe(ssg)
    const posts = ir.collections.find((c) => c.folder === postsFolder)
    expect(posts).toBeDefined()
    expect(posts!.format).toBe(format)
    const fieldNames = posts!.fields.map((f) => f.name)
    expect(fieldNames).toContain('title')
    expect(fieldNames).toContain('body')
  })
})
