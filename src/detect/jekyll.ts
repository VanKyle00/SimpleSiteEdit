import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { SiteInfo } from '../ir/types.ts'

export async function detect(root: string): Promise<SiteInfo | null> {
  const configPath = join(root, '_config.yml')
  if (!existsSync(configPath)) return null
  return { ssg: 'jekyll', root, configPath }
}
