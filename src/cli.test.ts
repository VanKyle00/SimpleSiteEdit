import { describe, test, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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

describe('runCli --images', () => {
  test('--images overrides the detected folder and is reflected in --dry-run output', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'simplesiteedit-cli-img-'))
    try {
      writeFileSync(join(dir, '_config.yml'), '')
      mkdirSync(join(dir, '_posts'))
      writeFileSync(
        join(dir, '_posts', '2026-05-25-hello.md'),
        '---\ntitle: Hi\ndate: 2026-05-25\n---\nbody',
      )
      // assets/images exists on disk, but --images overrides to static/uploads.
      mkdirSync(join(dir, 'assets', 'images'), { recursive: true })

      const out: string[] = []
      const code = await runCli(
        [dir, '--dry-run', '--images', 'static/uploads'],
        { write: (s) => out.push(s) },
      )
      expect(code).toBe(0)
      const parsed = JSON.parse(out.join(''))
      expect(parsed.imageRoot).toEqual({
        storeFsPath: 'static/uploads',
        publicPath: '/uploads/',
      })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('--images requires an argument', async () => {
    const errs: string[] = []
    const code = await runCli(['some/path', '--images'], {
      write: () => {},
      writeErr: (s) => errs.push(s),
    })
    expect(code).toBe(2)
    expect(errs.join('')).toMatch(/--images requires/i)
  })
})
