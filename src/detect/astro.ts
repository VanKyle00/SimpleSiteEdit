import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { SiteInfo } from '../ir/types.ts'

const ASTRO_CONFIGS = ['astro.config.mjs', 'astro.config.ts', 'astro.config.js']

export async function detect(root: string): Promise<SiteInfo | null> {
  for (const name of ASTRO_CONFIGS) {
    const p = join(root, name)
    if (existsSync(p)) return { ssg: 'astro', root, configPath: p }
  }
  return null
}
