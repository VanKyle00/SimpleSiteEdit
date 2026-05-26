import type { BackendAdapter } from './types.ts'

export type ChooseResult =
  | { kind: 'ok'; adapter: BackendAdapter }
  | { kind: 'error'; message: string }

export async function chooseBackend(
  preferred: 'lume' | undefined,
  adapters: BackendAdapter[],
): Promise<ChooseResult> {
  if (preferred) {
    const adapter = adapters.find((a) => a.name === preferred)
    if (!adapter) {
      return { kind: 'error', message: `Unknown backend: ${preferred}.` }
    }
    if (!(await adapter.isAvailable())) {
      return { kind: 'error', message: installHint(adapter.name) }
    }
    return { kind: 'ok', adapter }
  }

  for (const adapter of adapters) {
    if (await adapter.isAvailable()) {
      return { kind: 'ok', adapter }
    }
  }

  const hints = adapters.map((a) => `  - ${installHint(a.name)}`).join('\n')
  return {
    kind: 'error',
    message: `No editor backend is installed. Install one of:\n${hints}`,
  }
}

function installHint(name: BackendAdapter['name']): string {
  switch (name) {
    case 'lume': return 'lume: install Deno from https://deno.com/'
  }
}
