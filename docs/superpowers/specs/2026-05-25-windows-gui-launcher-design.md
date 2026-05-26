# Windows GUI Launcher for SimpleSiteEdit

**Date:** 2026-05-25
**Status:** Approved (pending user review)

## Goal

Make day-to-day use of `SimpleSiteEdit` a double-click on Windows: pick a site folder via a native dialog, click OK, the Lume CMS editor opens in the browser. No remembered command lines, no `--experimental-strip-types` flags to type.

## Non-goals

- Cross-platform GUI (macOS/Linux users keep the CLI).
- Packaging / installer / Start Menu integration. Launcher lives in the repo; users double-click it from there.
- Replacing the CLI. The launcher is an additional entry point that wraps it.
- A custom UI for picking backends, flags, or collections. Just folder → start.
- Stopping the server from a button. Closing the console window or Ctrl+C is the stop mechanism.

## Form factor

Double-clickable launcher in the repo root that opens the native Windows folder dialog and spawns the existing CLI. Two files:

- `Start SimpleSiteEdit.bat` — one-line shim at the repo root. Runs PowerShell with `-ExecutionPolicy Bypass -NoProfile` against the `.ps1`. Exists so users don't have to fiddle with execution policy on first run.
- `scripts/start-simplesiteedit.ps1` — the launcher logic. Prereq checks, folder dialog, spawn the CLI.

No new dependencies, no install step, no changes to `src/`.

## Launcher flow

1. **Locate repo root** via `$PSScriptRoot\..` so the script works no matter where the `.bat` is invoked from.
2. **Prereq checks**, fail fast with a friendly message and `Read-Host "Press Enter to close"` so the console window doesn't vanish:
   - `node --version` ≥ 22 (parse the `vX.Y.Z` output; reject < 22). Missing → "Install Node.js 22+ from https://nodejs.org and reopen."
   - `deno --version` exists. Missing → "Install Deno from https://deno.com and reopen."
   - `<repo>\node_modules` directory exists. Missing → "Open a terminal in this folder and run `npm install` first."
3. **Folder picker** via `System.Windows.Forms.FolderBrowserDialog`:
   - Description: "Select the site folder to edit"
   - `ShowNewFolderButton = $false`
   - Pre-select the last-used folder if one is remembered and still exists on disk; otherwise leave the dialog at its default location.
   - If the user cancels (returns `Cancel`), exit silently with code 0.
4. **Persist last folder** to `$env:LOCALAPPDATA\SimpleSiteEdit\last-folder.txt` after a successful pick. Read on next launch to pre-select. Failure to read or write is non-fatal — silently skip.
5. **Launch the CLI** in the same console window:

   ```
   node --experimental-strip-types src\bin.ts "<folder>"
   ```

   Working directory: repo root. Print a one-line banner first: `Starting SimpleSiteEdit against <folder>... (close this window or press Ctrl+C to stop)`.
6. **Stopping** is handled by closing the console window or Ctrl+C. The existing CLI shuts down `deno serve` on Ctrl+C, and closing the window kills the process tree. No extra logic in the launcher.

## Error handling

| Failure | Behavior |
|---|---|
| Node missing or too old | Friendly message naming the requirement + URL; `Read-Host` pause; exit 1. |
| Deno missing | Friendly message naming the requirement + URL; pause; exit 1. |
| `node_modules` missing | Friendly message telling user to run `npm install`; pause; exit 1. |
| User cancels folder dialog | Exit 0, no message, window closes immediately. |
| CLI process exits non-zero | Pause via `Read-Host` so the user can read the CLI's error output before the window closes. |
| CLI process exits cleanly (Ctrl+C or normal shutdown) | Exit immediately, no pause. |
| Last-folder file unreadable / corrupt | Ignored; pick starts from default location. |

## File listing

| Path | Purpose |
|---|---|
| `Start SimpleSiteEdit.bat` | Repo-root double-click target. One line: `@powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0scripts\start-simplesiteedit.ps1"`. |
| `scripts/start-simplesiteedit.ps1` | All launcher logic. ~50 lines. |
| `README.md` | Add a "Quick start (Windows)" section near the top of Usage, pointing at `Start SimpleSiteEdit.bat`. Keep the existing CLI docs unchanged below it. |

## Testing

The launcher is a thin shim over the already-tested CLI; the value-add is the folder dialog + prereq checks, neither of which the existing vitest setup can drive. Plan:

- **Manual smoke test checklist**, run after build:
  1. Double-click `Start SimpleSiteEdit.bat` → folder picker appears.
  2. Cancel the picker → window closes silently, no error.
  3. Pick `fixtures/jekyll` → console shows the banner, `deno serve` starts, browser opens to the admin UI, an edit in the UI writes back to disk.
  4. Re-launch → picker pre-selects `fixtures/jekyll`.
  5. Temporarily rename `node_modules` → friendly "run npm install" message and pause on Enter.
  6. Simulate missing Deno (temporarily rename `deno.exe` on PATH for the session) → friendly Deno message and pause.
  7. Simulate Node < 22 (or missing) → friendly Node message and pause.
- **No automated tests** for the `.ps1`. A 50-line shell-out wrapper does not justify adding Pester or CI for it in a prototype.

## Out of scope (explicit)

- No Start Menu / Desktop shortcut installer.
- No tray icon, no log window beyond the console PowerShell opens.
- No multi-instance check. Second double-click will fail to bind port 8000; the existing CLI's error message is sufficient.
- No flag UI. `--dry-run`, `--persist`, `--force`, `--no-open`, `--backend` remain CLI-only.
- No macOS/Linux equivalent. Out of scope for this spec.

## Rollout

Single change set: add the two files, update the README. No migration, no flag, no compat shim. The existing CLI entry point is untouched.
