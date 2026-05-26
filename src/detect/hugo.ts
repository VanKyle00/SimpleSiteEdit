import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { SiteInfo } from '../ir/types.ts'

const HUGO_CONFIGS = ['hugo.toml', 'hugo.yaml', 'hugo.json']

export async function detect(root: string): Promise<SiteInfo | null> {
  for (const name of HUGO_CONFIGS) {
    const p = join(root, name)
    if (existsSync(p)) return { ssg: 'hugo', root, configPath: p }
  }
  return null
}
