export type SSG =
  | 'jekyll'
  | 'hugo'
  | 'eleventy'
  | 'astro'
  | 'next-mdx'
  | 'js-literals'
  | 'generic'

export type FieldType =
  | 'string'
  | 'datetime'
  | 'list'
  | 'boolean'
  | 'markdown'
  | 'image'
  | 'unknown'

export type Field = {
  name: string
  type: FieldType
  required: boolean
  example?: string
}

export type CollectionFormat = 'markdown' | 'mdx' | 'json' | 'yaml'

export type Collection = {
  name: string
  label: string
  folder: string
  format: CollectionFormat
  slugFrom: 'filename' | 'frontmatter.slug' | 'frontmatter.id'
  fields: Field[]
  jsBinding?: string
}

export type SiteIR = {
  siteRoot: string
  ssg: SSG
  collections: Collection[]
  jsSource?: string
  notes: string[]
  imageRoot?: { storeFsPath: string; publicPath: string }
}

export type SiteInfo = {
  ssg: SSG
  root: string
  configPath?: string
  jsSource?: string
  /** When ssg === 'generic', the folder (relative to root) containing markdown entries. */
  contentFolder?: string
}
