import { statSync } from 'node:fs'
import chokidar, { type FSWatcher } from 'chokidar'
import { inject } from './inject.ts'

export type WatchOptions = {
  onWrite?: () => void
  /** Called when app.js was modified outside SimpleSiteEdit since the last inject. */
  onConflict?: () => void
  debounceMs?: number
}

export type WatchHandle = {
  stop: () => Promise<void>
}

export async function watchAndInject(
  srcPath: string,
  shadowRoot: string,
  opts: WatchOptions = {},
): Promise<WatchHandle> {
  const debounceMs = opts.debounceMs ?? 200

  // mtime of srcPath as of the watcher's last known good state. Any change to
  // srcPath outside this watcher (hand-edit, another tool) will invalidate it.
  let lastKnownMtimeMs = mtimeOf(srcPath)

  const watcher: FSWatcher = chokidar.watch(shadowRoot, {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 25 },
  })

  let pending: NodeJS.Timeout | null = null
  let processing = false
  let again = false

  const flush = async () => {
    if (processing) {
      again = true
      return
    }
    processing = true
    try {
      const current = mtimeOf(srcPath)
      if (current !== null && lastKnownMtimeMs !== null && current !== lastKnownMtimeMs) {
        opts.onConflict?.()
        return
      }
      inject(srcPath, shadowRoot, srcPath)
      lastKnownMtimeMs = mtimeOf(srcPath)
      opts.onWrite?.()
    } catch (e) {
      process.stderr.write(`SimpleSiteEdit watcher: inject failed: ${(e as Error).message}\n`)
    } finally {
      processing = false
      if (again) {
        again = false
        schedule()
      }
    }
  }

  const schedule = () => {
    if (pending) clearTimeout(pending)
    pending = setTimeout(() => {
      pending = null
      void flush()
    }, debounceMs)
  }

  watcher.on('add', schedule)
  watcher.on('change', schedule)
  watcher.on('unlink', schedule)

  await new Promise<void>((res) => {
    watcher.once('ready', () => res())
  })

  return {
    stop: async () => {
      if (pending) clearTimeout(pending)
      await watcher.close()
    },
  }
}

function mtimeOf(path: string): number | null {
  try {
    return statSync(path).mtimeMs
  } catch {
    return null
  }
}
