import { join, resolve } from 'node:path'
import { buildIR } from './pipeline.ts'
import { lume } from './backends/lume.ts'
import { chooseBackend } from './backends/choose.ts'
import { explode } from './js-roundtrip/explode.ts'
import { watchAndInject, type WatchHandle } from './js-roundtrip/watch.ts'

type Io = {
  write: (s: string) => void
  writeErr?: (s: string) => void
}

const USAGE =
  'usage: simplesiteedit <site-path> [--dry-run] [--no-open] [--backend lume] [--images <path>] [--persist] [--force]\n'

export async function runCli(argv: string[], io: Io): Promise<number> {
  const writeErr = io.writeErr ?? io.write
  const positional: string[] = []
  const flags = new Set<string>()
  let preferredBackend: 'lume' | undefined
  let imagesOverride: string | undefined

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--backend') {
      const v = argv[++i]
      if (v !== 'lume') {
        writeErr(`unknown backend: ${v}\n`)
        writeErr(USAGE)
        return 2
      }
      preferredBackend = v
    } else if (arg === '--images') {
      const v = argv[++i]
      if (v === undefined) {
        writeErr('--images requires a path argument\n')
        writeErr(USAGE)
        return 2
      }
      imagesOverride = v
    } else if (arg.startsWith('--')) {
      flags.add(arg)
    } else {
      positional.push(arg)
    }
  }

  if (positional.length === 0) {
    writeErr(USAGE)
    return 2
  }

  const sitePath = positional[0]
  const ir = await buildIR(sitePath, { imagesOverride })

  if (flags.has('--dry-run')) {
    io.write(JSON.stringify(ir, null, 2) + '\n')
    return 0
  }

  io.write(summaryFor(ir))

  if (ir.collections.length === 0) {
    io.write('\nNothing to edit. Exiting.\n')
    return 0
  }

  const persist = flags.has('--persist')
  const force = flags.has('--force')

  // --persist on a js-literals site doesn't make sense: the shadow dir is intrinsic
  // to the round-trip and lives under .simplesiteedit/ by design.
  if (persist && ir.ssg === 'js-literals') {
    writeErr('\n--persist is unavailable on js-literals sites (the shadow dir is intrinsic to the round-trip).\n')
    return 1
  }

  const chosen = await chooseBackend(preferredBackend, [lume])
  if (chosen.kind === 'error') {
    writeErr(`\n${chosen.message}\n`)
    return 1
  }
  const backend = chosen.adapter

  // For js-literals sites: materialize shadow JSON files before launching.
  let shadowRoot: string | null = null
  if (ir.ssg === 'js-literals' && ir.jsSource) {
    shadowRoot = resolve(sitePath, '.SimpleSiteEdit', 'data')
    io.write(`\nExploding ${ir.jsSource} → ${shadowRoot}\n`)
    explode(ir.jsSource, shadowRoot)
  }

  // With --persist: emit configs at the site root so the user can commit them.
  // Otherwise: emit under .simplesiteedit/ (regenerated every run).
  const outDir = persist ? resolve(sitePath) : join(resolve(sitePath), '.SimpleSiteEdit')
  let watchHandle: WatchHandle | null = null
  try {
    // In ephemeral (.simplesiteedit/) mode, always overwrite — that dir is regenerated every run.
    // With --persist, refuse overwrites unless the user passed --force.
    await backend.emitConfig(ir, outDir, { force: persist ? force : true })
    if (persist) {
      io.write(`\nConfig written to ${outDir}.\n`)
    }
    io.write(`\nStarting backend (${backend.name})...\n`)
    const handle = await backend.launch(ir, outDir, { noOpen: flags.has('--no-open') })

    if (shadowRoot && ir.jsSource) {
      io.write(`Watching ${shadowRoot} → ${ir.jsSource} on save.\n`)
      watchHandle = await watchAndInject(ir.jsSource, shadowRoot, {
        onWrite: () => io.write(`✱ ${ir.jsSource} updated\n`),
        onConflict: () =>
          writeErr(
            `\n⚠ ${ir.jsSource} was modified outside SimpleSiteEdit.\n` +
            `  Skipping inject to avoid clobbering your edits.\n` +
            `  Stop SimpleSiteEdit (Ctrl+C) and re-run to re-sync.\n`,
          ),
      })
    }

    io.write(`\nOpen this URL in your browser:\n  ${handle.url}\n`)
    io.write(`\nPress Ctrl+C to stop.\n`)
    await new Promise<void>((res) => {
      const stop = async () => {
        if (watchHandle) await watchHandle.stop()
        await handle.stop()
        res()
      }
      process.on('SIGINT', stop)
      process.on('SIGTERM', stop)
    })
    return 0
  } catch (e) {
    if (watchHandle) await watchHandle.stop()
    writeErr(`\nLaunch failed: ${(e as Error).message}\n`)
    return 1
  }
}

function summaryFor(ir: {
  ssg: string
  siteRoot: string
  collections: Array<{ name: string; fields: unknown[] }>
  notes: string[]
}): string {
  const lines: string[] = []
  lines.push(`Detected: ${ir.ssg}  (root: ${ir.siteRoot})`)
  if (ir.collections.length === 0) {
    lines.push('No collections inferred.')
  } else {
    lines.push(`Collections (${ir.collections.length}):`)
    for (const c of ir.collections) {
      lines.push(`  - ${c.name}  (${c.fields.length} fields)`)
    }
  }
  if (ir.notes.length > 0) {
    lines.push('')
    lines.push(`Notes (${ir.notes.length}):`)
    for (const n of ir.notes) lines.push(`  - ${n}`)
  }
  return lines.join('\n') + '\n'
}
