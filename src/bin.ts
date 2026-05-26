import { runCli } from './cli.ts'

const code = await runCli(process.argv.slice(2), {
  write: (s) => process.stdout.write(s),
  writeErr: (s) => process.stderr.write(s),
})
process.exit(code)
