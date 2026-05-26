import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { SiteInfo } from '../ir/types.ts'

const NEXT_CONFIGS = ['next.config.mjs', 'next.config.ts', 'next.config.js', 'next.config.cjs']

export async function detect(root: string): Promise<SiteInfo | null> {
  let configPath: string | null = null
  for (const name of NEXT_CONFIGS) {
    const p = join(root, name)
    if (existsSync(p)) { configPath = p; break }
  }
  if (!configPath) return null

  // Require MDX support to be present — otherwise this is a plain Next.js site,
  // not a markdown-driven personal site that SimpleSiteEdit can edit.
  if (!hasMdxIndicator(root, configPath)) return null

  return { ssg: 'next-mdx', root, configPath }
}

function hasMdxIndicator(root: string, configPath: string): boolean {
  try {
    const config = readFileSync(configPath, 'utf8')
    if (/@next\/mdx|@contentlayer|@mdx-js/.test(config)) return true
  } catch {}

  const pkgPath = join(root, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = readFileSync(pkgPath, 'utf8')
      if (/@next\/mdx|contentlayer|@mdx-js/.test(pkg)) return true
    } catch {}
  }
  return false
}
