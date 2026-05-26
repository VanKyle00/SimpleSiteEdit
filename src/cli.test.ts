import { describe, test, expect } from 'vitest'
import { runCli } from './cli'

describe('runCli --dry-run', () => {
  test('prints the IR as JSON for the Jekyll fixture and returns exit code 0', async () => {
    const out: string[] = []
    const code = await runCli(['fixtures/jekyll-minimal', '--dry-run'], {
      write: (s) => out.push(s),
    })
    expect(code).toBe(0)
    const printed = out.join('')
    const parsed = JSON.parse(printed)
    expect(parsed.ssg).toBe('jekyll')
    expect(parsed.collections[0].name).toBe('posts')
  })

  test('returns exit code 2 when no path is given', async () => {
    const errs: string[] = []
    const code = await runCli([], {
      write: () => {},
      writeErr: (s) => errs.push(s),
    })
    expect(code).toBe(2)
    expect(errs.join('')).toMatch(/usage/i)
  })
})
