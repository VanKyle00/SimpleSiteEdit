import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { SiteInfo } from '../ir/types.ts'

const ELEVENTY_CONFIGS = ['.eleventy.js', '.eleventy.cjs', 'eleventy.config.js', 'eleventy.config.cjs']

export async function detect(root: string): Promise<SiteInfo | null> {
  for (const name of ELEVENTY_CONFIGS) {
    const p = join(root, name)
    if (existsSync(p)) return { ssg: 'eleventy', root, configPath: p }
  }
  return null
}
