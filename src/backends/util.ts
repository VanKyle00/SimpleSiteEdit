import spawn from 'cross-spawn'
import { spawn as nodeSpawn } from 'node:child_process'
import { platform } from 'node:os'

/**
 * Check if a command is on PATH. Spawns `where` (Windows) or `which` (POSIX);
 * those are real executables, so no shell or cross-spawn is needed.
 */
export async function hasCommand(cmd: string): Promise<boolean> {
  const check = platform() === 'win32' ? 'where' : 'which'
  return await new Promise((res) => {
    const p = nodeSpawn(check, [cmd], { stdio: 'ignore' })
    p.on('error', () => res(false))
    p.on('exit', (code) => res(code === 0))
  })
}

/**
 * Re-exported wrapper so callers in this package don't have to import cross-spawn directly.
 * cross-spawn handles Windows .cmd/.bat resolution and quoting correctly without triggering
 * Node's DEP0190 deprecation warning.
 */
export { spawn }

export function openInBrowser(url: string): void {
  const p = platform()
  if (p === 'darwin') {
    spawn('open', [url], { stdio: 'ignore', detached: true }).unref()
    return
  }
  if (p === 'win32') {
    // `start` is a cmd.exe builtin. Empty quoted string before the URL prevents
    // it from being parsed as a window title.
    spawn('cmd.exe', ['/c', 'start', '""', url], { stdio: 'ignore', detached: true }).unref()
    return
  }
  spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref()
}
