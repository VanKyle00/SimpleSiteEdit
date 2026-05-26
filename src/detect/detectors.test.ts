// Cross-detector sanity: each detector matches its own fixture and rejects the others.

import { describe, test, expect } from 'vitest'
import { detect as detectJekyll } from './jekyll'
import { detect as detectHugo } from './hugo'
import { detect as detectEleventy } from './eleventy'
import { detect as detectAstro } from './astro'
import { detect as detectNextMdx } from './next-mdx'
import { detect as detectJsLiterals } from './js-literals'
import { detect as detectGeneric } from './generic'

type DetectorEntry = {
  name: string
  detect: (root: string) => Promise<unknown | null>
  fixture: string
  ssg: string
}

const detectors: DetectorEntry[] = [
  { name: 'jekyll',      detect: detectJekyll,     fixture: 'fixtures/jekyll-minimal',   ssg: 'jekyll' },
  { name: 'hugo',        detect: detectHugo,       fixture: 'fixtures/hugo-minimal',     ssg: 'hugo' },
  { name: 'eleventy',    detect: detectEleventy,   fixture: 'fixtures/eleventy-minimal', ssg: 'eleventy' },
  { name: 'astro',       detect: detectAstro,      fixture: 'fixtures/astro-minimal',    ssg: 'astro' },
  { name: 'next-mdx',    detect: detectNextMdx,    fixture: 'fixtures/next-mdx-minimal', ssg: 'next-mdx' },
  { name: 'js-literals', detect: detectJsLiterals, fixture: 'fixtures/js-literals',      ssg: 'js-literals' },
  { name: 'generic',     detect: detectGeneric,    fixture: 'fixtures/generic-md',       ssg: 'generic' },
]

describe('detectors', () => {
  for (const d of detectors) {
    test(`${d.name} detects its own fixture and returns ssg=${d.ssg}`, async () => {
      const info = await d.detect(d.fixture) as { ssg: string } | null
      expect(info).not.toBeNull()
      expect(info!.ssg).toBe(d.ssg)
    })

    for (const other of detectors) {
      if (other === d) continue
      test(`${d.name} does NOT match ${other.name}'s fixture`, async () => {
        const info = await d.detect(other.fixture)
        expect(info).toBeNull()
      })
    }
  }
})
