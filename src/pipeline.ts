import type { SiteIR, SiteInfo, Collection } from './ir/types.ts'
import { detect as detectJekyll } from './detect/jekyll.ts'
import { detect as detectHugo } from './detect/hugo.ts'
import { detect as detectEleventy } from './detect/eleventy.ts'
import { detect as detectAstro } from './detect/astro.ts'
import { detect as detectNextMdx } from './detect/next-mdx.ts'
import { detect as detectJsLiterals } from './detect/js-literals.ts'
import { detect as detectGeneric } from './detect/generic.ts'
import { inferCollections } from './infer/collections.ts'
import { inferSchema, inferSchemaFromSamples } from './infer/schema.ts'
import { inferImageRoot, publicPathFor } from './infer/images.ts'

// Real-SSG detectors first; js-literals + generic last (fallbacks).
const detectors: Array<(root: string) => Promise<SiteInfo | null>> = [
  detectJekyll,
  detectHugo,
  detectEleventy,
  detectAstro,
  detectNextMdx,
  detectJsLiterals,
  detectGeneric,
]

export type BuildIROptions = {
  imagesOverride?: string
}

export async function buildIR(root: string, opts: BuildIROptions = {}): Promise<SiteIR> {
  let info: SiteInfo | null = null
  for (const detector of detectors) {
    info = await detector(root)
    if (info) break
  }

  const imageRoot = opts.imagesOverride
    ? { storeFsPath: normalizeRel(opts.imagesOverride), publicPath: publicPathFor(opts.imagesOverride) }
    : inferImageRoot(root)

  if (!info) {
    return { siteRoot: root, ssg: 'generic', collections: [], notes: [], imageRoot }
  }

  const { stubs, notes } = await inferCollections(info)
  const collections: Collection[] = []
  for (const stub of stubs) {
    const fields = stub.samples
      ? inferSchemaFromSamples(stub.samples)
      : await inferSchema(info.root, stub.folder, stub.format)
    collections.push({
      name: stub.name,
      label: stub.label,
      folder: stub.folder,
      format: stub.format,
      slugFrom: stub.slugFrom,
      fields,
      ...(stub.jsBinding ? { jsBinding: stub.jsBinding } : {}),
    })
  }

  const ir: SiteIR = { siteRoot: root, ssg: info.ssg, collections, notes, imageRoot }
  if (info.jsSource) ir.jsSource = info.jsSource
  return ir
}

function normalizeRel(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
}
