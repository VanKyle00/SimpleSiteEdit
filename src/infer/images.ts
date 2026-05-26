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
