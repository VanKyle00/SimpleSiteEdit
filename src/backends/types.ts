import type { SiteIR } from '../ir/types.ts'

export type LaunchHandle = {
  url: string
  stop: () => Promise<void>
}

export interface BackendAdapter {
  name: 'lume'

  /** True when the runtime dependencies for this backend are installed. */
  isAvailable(): Promise<boolean>

  /** Write any backend-specific config files into outDir. */
  emitConfig(ir: SiteIR, outDir: string, opts?: EmitOptions): Promise<void>

  /** Start the backend processes and return a URL the browser should open. */
  launch(ir: SiteIR, outDir: string, opts?: LaunchOptions): Promise<LaunchHandle>
}

export type LaunchOptions = {
  /** When true, do not auto-open a browser window after launch. */
  noOpen?: boolean
}

export type EmitOptions = {
  /** Overwrite existing files at the target paths. */
  force?: boolean
}
