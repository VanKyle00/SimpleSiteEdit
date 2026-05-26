import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

export type ImageRoot = {
  /** Site-relative path (forward-slashed) where uploaded images are stored. */
  storeFsPath: string
  /** URL prefix Lume's markdown widget inserts into edited markdown. */
  publicPath: string
}

export function publicPathFor(relPath: string): string {
  const normalized = relPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  for (const prefix of ['static/', 'public/']) {
    if (normalized.startsWith(prefix)) {
      return '/' + normalized.slice(prefix.length) + '/'
    }
  }
  return '/' + normalized + '/'
}

// Priority order: more specific layouts before generic. First match wins.
const DETECTION_ORDER: string[] = [
  'assets/images',
  'static/images',
  'public/images',
  'images',
]

export function inferImageRoot(siteRoot: string): ImageRoot {
  for (const rel of DETECTION_ORDER) {
    const abs = join(siteRoot, rel)
    if (existsSync(abs) && statSync(abs).isDirectory()) {
      return { storeFsPath: rel, publicPath: publicPathFor(rel) }
    }
  }
  // Fallback: not yet on disk; created lazily on launch (see Lume backend task).
  return { storeFsPath: 'images', publicPath: '/images/' }
}
