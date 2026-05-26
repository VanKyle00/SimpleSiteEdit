# Windows GUI Launcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a double-click Windows launcher that opens a native folder picker and starts the existing SimpleSiteEdit CLI against the chosen folder.

**Architecture:** A `.bat` shim at the repo root runs PowerShell against `scripts/start-simplesiteedit.ps1` with execution policy bypassed. The `.ps1` performs prereq checks (Node ≥ 22, Deno, `node_modules`), shows `System.Windows.Forms.FolderBrowserDialog`, remembers the last picked folder, then spawns the existing CLI in the same console window. No changes to `src/`; no new npm dependencies.

**Tech Stack:** Windows PowerShell 5.1, Windows Forms (built into Windows), existing Node 22+ / Deno SimpleSiteEdit stack.

**Spec:** `docs/superpowers/specs/2026-05-25-windows-gui-launcher-design.md`

---

## File Structure

| Path | Purpose | Status |
|---|---|---|
| `Start SimpleSiteEdit.bat` | Repo-root double-click target. One line: invoke PowerShell against the `.ps1`. | Create |
| `scripts/start-simplesiteedit.ps1` | All launcher logic: prereqs, folder dialog, last-folder memory, spawn CLI. | Create |
| `README.md` | Insert a "Quick start (Windows)" subsection at the top of Usage. | Modify |

The launcher logic lives entirely in one `.ps1` because it is small (~70 lines) and intrinsically a single linear script — splitting it would just spread one flow across files. The `.bat` is a 1-line shim, not logic.

The `.ps1` is built up across small tasks below. Each task adds one section and leaves the script runnable.

---

### Task 1: Create the `.bat` shim and an empty `.ps1` that the shim can invoke

**Files:**
- Create: `Start SimpleSiteEdit.bat`
- Create: `scripts/start-simplesiteedit.ps1`

- [ ] **Step 1: Verify the `scripts/` directory already exists**

Run (PowerShell):
```powershell
Test-Path "C:\Users\Administrator\SimpleSiteEdit\scripts"
```
Expected: `True`

- [ ] **Step 2: Create `Start SimpleSiteEdit.bat`**

Filename has a space — that's intentional, it's a user-facing double-click target. Use `%~dp0` so the shim works regardless of how it's invoked. The `%~dp0` expansion includes a trailing backslash, so no extra `\` between it and `scripts`.

Contents (exactly one line, no trailing blank line needed):
```bat
@powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0scripts\start-simplesiteedit.ps1"
```

- [ ] **Step 3: Create `scripts/start-simplesiteedit.ps1` with just a banner so we can verify the shim wiring**

Contents:
```powershell
$ErrorActionPreference = 'Stop'
Write-Host "SimpleSiteEdit launcher: shim OK (no work yet)"
Read-Host "Press Enter to close"
```

- [ ] **Step 4: Smoke test the shim by hand**

Double-click `Start SimpleSiteEdit.bat` in Explorer (or run `& "C:\Users\Administrator\SimpleSiteEdit\Start SimpleSiteEdit.bat"` from a PowerShell prompt — note the `&` call operator is required because of the space in the filename).

Expected: A console window opens, prints `SimpleSiteEdit launcher: shim OK (no work yet)`, and waits at `Press Enter to close`.

- [ ] **Step 5: Commit**

Note: the project README's Status section indicates this is a prototype; verify whether `git` is initialized before committing. If not, skip.

```powershell
git status
# if it's a repo:
git add "Start SimpleSiteEdit.bat" scripts/start-simplesiteedit.ps1
git commit -m "feat(launcher): add .bat shim and empty PowerShell launcher"
```

---

### Task 2: Add the prereq check for Node ≥ 22

**Files:**
- Modify: `scripts/start-simplesiteedit.ps1`

The launcher must run inside the repo root so `src\bin.ts` and `node_modules` resolve. Compute `$RepoRoot` from `$PSScriptRoot` (the directory containing the `.ps1`), then push-locate to it. Then check Node.

- [ ] **Step 1: Replace `scripts/start-simplesiteedit.ps1` with the version that locates the repo and checks Node**

Contents (full file):
```powershell
$ErrorActionPreference = 'Stop'

function Fail($message) {
    Write-Host ""
    Write-Host $message -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}

# Resolve repo root as the parent of this script's directory.
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $RepoRoot

# --- Prereq: Node >= 22 ---
$nodeVersion = $null
try { $nodeVersion = (& node --version) 2>$null } catch {}
if (-not $nodeVersion) {
    Fail "Node.js is not installed or not on PATH.`nInstall Node.js 22+ from https://nodejs.org and reopen this launcher."
}
# $nodeVersion looks like "v22.4.1"
if ($nodeVersion -notmatch '^v(\d+)\.') {
    Fail "Could not parse Node version: '$nodeVersion'. Install Node.js 22+ from https://nodejs.org."
}
$nodeMajor = [int]$matches[1]
if ($nodeMajor -lt 22) {
    Fail "Node.js $nodeVersion found, but SimpleSiteEdit needs 22 or newer.`nInstall Node.js 22+ from https://nodejs.org."
}

Write-Host "Node $nodeVersion OK"
Read-Host "Press Enter to close (prereq checks not finished yet)"
```

- [ ] **Step 2: Smoke test — happy path**

Double-click `Start SimpleSiteEdit.bat`. Expected: window opens, prints `Node v22.x.x OK`, then pauses.

- [ ] **Step 3: Smoke test — Node missing**

Open a fresh PowerShell, temporarily mask `node` on PATH for that session:
```powershell
$env:PATH = ($env:PATH -split ';' | Where-Object { $_ -notmatch 'nodejs' }) -join ';'
& "C:\Users\Administrator\SimpleSiteEdit\Start SimpleSiteEdit.bat"
```
Expected: window opens, prints the red "Node.js is not installed..." message, pauses on `Press Enter to close`, exits 1.

(If you don't have `nodejs` in any PATH segment name, edit the launcher temporarily so the `node --version` call points at a non-existent binary, run the test, then revert. Verifying the failure path is the point.)

- [ ] **Step 4: Commit**

```powershell
git add scripts/start-simplesiteedit.ps1
git commit -m "feat(launcher): check Node 22+ on launch"
```

---

### Task 3: Add the prereq check for Deno

**Files:**
- Modify: `scripts/start-simplesiteedit.ps1`

- [ ] **Step 1: Add the Deno check below the Node check**

Insert immediately after the `Write-Host "Node $nodeVersion OK"` line and before the existing `Read-Host` placeholder:

```powershell
# --- Prereq: Deno ---
$denoVersion = $null
try { $denoVersion = (& deno --version 2>$null | Select-Object -First 1) } catch {}
if (-not $denoVersion) {
    Fail "Deno is not installed or not on PATH.`nInstall Deno from https://deno.com and reopen this launcher."
}
Write-Host "$denoVersion OK"
```

The first line of `deno --version` output looks like `deno 1.46.3 (...)` — we just need to confirm the command runs.

- [ ] **Step 2: Smoke test — happy path**

Double-click `Start SimpleSiteEdit.bat`. Expected: prints `Node v22.x.x OK` then `deno 1.x.x (...) OK`, then pauses.

- [ ] **Step 3: Smoke test — Deno missing**

Mask Deno on PATH the same way as in Task 2 step 3 (or temporarily edit the launcher to call `deno-nonexistent`). Expected: red "Deno is not installed..." message, pause, exit 1.

- [ ] **Step 4: Commit**

```powershell
git add scripts/start-simplesiteedit.ps1
git commit -m "feat(launcher): check Deno is installed on launch"
```

---

### Task 4: Add the prereq check for `node_modules`

**Files:**
- Modify: `scripts/start-simplesiteedit.ps1`

- [ ] **Step 1: Add the `node_modules` check below the Deno check**

Insert immediately after `Write-Host "$denoVersion OK"`:

```powershell
# --- Prereq: dependencies installed ---
if (-not (Test-Path (Join-Path $RepoRoot 'node_modules'))) {
    Fail "Dependencies are not installed.`nOpen a terminal in this folder and run: npm install"
}
Write-Host "node_modules OK"
```

- [ ] **Step 2: Smoke test — happy path**

Double-click `Start SimpleSiteEdit.bat`. Expected: all three checks print OK, then pause.

- [ ] **Step 3: Smoke test — `node_modules` missing**

```powershell
Rename-Item "C:\Users\Administrator\SimpleSiteEdit\node_modules" "C:\Users\Administrator\SimpleSiteEdit\node_modules.bak"
& "C:\Users\Administrator\SimpleSiteEdit\Start SimpleSiteEdit.bat"
# Verify the friendly error, press Enter to close, then restore:
Rename-Item "C:\Users\Administrator\SimpleSiteEdit\node_modules.bak" "C:\Users\Administrator\SimpleSiteEdit\node_modules"
```
Expected: red "Dependencies are not installed..." message, pause, exit 1.

- [ ] **Step 4: Commit**

```powershell
git add scripts/start-simplesiteedit.ps1
git commit -m "feat(launcher): check node_modules is installed on launch"
```

---

### Task 5: Add the native folder picker

**Files:**
- Modify: `scripts/start-simplesiteedit.ps1`

This task adds the `FolderBrowserDialog` and removes the temporary `Read-Host` placeholder — the script now ends after the picker (launch comes in Task 7).

- [ ] **Step 1: Replace the trailing placeholder with the folder picker**

Remove the existing `Read-Host "Press Enter to close (prereq checks not finished yet)"` line. Append the following at the end of the file:

```powershell
# --- Folder picker ---
Add-Type -AssemblyName System.Windows.Forms | Out-Null

$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = "Select the site folder to edit"
$dialog.ShowNewFolderButton = $false

$result = $dialog.ShowDialog()
if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
    # User cancelled — exit silently.
    exit 0
}
$siteFolder = $dialog.SelectedPath

Write-Host ""
Write-Host "Selected folder: $siteFolder"
Read-Host "Press Enter to close (launch step not implemented yet)"
```

- [ ] **Step 2: Smoke test — happy path**

Double-click `Start SimpleSiteEdit.bat`. Expected: prereq lines print, folder dialog appears with description "Select the site folder to edit", you pick a folder, console prints `Selected folder: <path>` and pauses.

- [ ] **Step 3: Smoke test — cancel**

Run the launcher again; click Cancel in the dialog. Expected: window closes immediately, no error, no pause.

- [ ] **Step 4: Commit**

```powershell
git add scripts/start-simplesiteedit.ps1
git commit -m "feat(launcher): add native folder picker"
```

---

### Task 6: Remember the last picked folder

**Files:**
- Modify: `scripts/start-simplesiteedit.ps1`

Persist the chosen path to `$env:LOCALAPPDATA\SimpleSiteEdit\last-folder.txt`. Read it before showing the dialog and use it as `SelectedPath` if it still exists on disk. Failure to read/write the memory file is non-fatal.

- [ ] **Step 1: Add the memory file path constant after the `Set-Location $RepoRoot` line**

Insert:
```powershell
# Last-folder memory (best-effort; failures here are non-fatal).
$MemoryDir = Join-Path $env:LOCALAPPDATA 'SimpleSiteEdit'
$MemoryFile = Join-Path $MemoryDir 'last-folder.txt'
```

- [ ] **Step 2: Before `$result = $dialog.ShowDialog()`, pre-select the remembered folder if it still exists**

Insert just before that line:
```powershell
try {
    if (Test-Path $MemoryFile) {
        $lastFolder = (Get-Content $MemoryFile -Raw -ErrorAction Stop).Trim()
        if ($lastFolder -and (Test-Path $lastFolder)) {
            $dialog.SelectedPath = $lastFolder
        }
    }
} catch {
    # Ignore — pre-selection is a nicety.
}
```

- [ ] **Step 3: After `$siteFolder = $dialog.SelectedPath`, persist the new selection**

Insert:
```powershell
try {
    if (-not (Test-Path $MemoryDir)) {
        New-Item -ItemType Directory -Path $MemoryDir -Force | Out-Null
    }
    Set-Content -Path $MemoryFile -Value $siteFolder -Encoding utf8
} catch {
    # Ignore — remembering is a nicety, not required.
}
```

- [ ] **Step 4: Smoke test — first run picks any folder, second run pre-selects it**

Delete any existing memory: `Remove-Item "$env:LOCALAPPDATA\SimpleSiteEdit\last-folder.txt" -ErrorAction SilentlyContinue`.

Run the launcher, pick `C:\Users\Administrator\SimpleSiteEdit\fixtures\jekyll`, let it print + pause, then press Enter.

Run the launcher again. Expected: dialog opens already pointing at `C:\Users\Administrator\SimpleSiteEdit\fixtures\jekyll`.

- [ ] **Step 5: Smoke test — corrupted memory file is ignored**

```powershell
Set-Content -Path "$env:LOCALAPPDATA\SimpleSiteEdit\last-folder.txt" -Value "C:\does\not\exist"
& "C:\Users\Administrator\SimpleSiteEdit\Start SimpleSiteEdit.bat"
```
Expected: dialog opens at the default location (not the bogus path), no error message.

- [ ] **Step 6: Commit**

```powershell
git add scripts/start-simplesiteedit.ps1
git commit -m "feat(launcher): remember last picked folder across runs"
```

---

### Task 7: Launch the CLI and handle exit codes

**Files:**
- Modify: `scripts/start-simplesiteedit.ps1`

Replace the temporary `Read-Host "Press Enter to close (launch step not implemented yet)"` with the actual CLI spawn. Pause only if the CLI exits non-zero so users can read errors before the window closes; on clean exit (Ctrl+C / normal shutdown) the window closes immediately.

- [ ] **Step 1: Replace the launch placeholder with the real spawn**

Remove the line `Read-Host "Press Enter to close (launch step not implemented yet)"` and append:

```powershell
Write-Host ""
Write-Host "Starting SimpleSiteEdit against $siteFolder..."
Write-Host "(Close this window or press Ctrl+C to stop)"
Write-Host ""

& node --experimental-strip-types (Join-Path 'src' 'bin.ts') $siteFolder
$cliExit = $LASTEXITCODE

if ($cliExit -ne 0) {
    Write-Host ""
    Write-Host "SimpleSiteEdit exited with code $cliExit." -ForegroundColor Yellow
    Read-Host "Press Enter to close"
}
exit $cliExit
```

Note: we pass `(Join-Path 'src' 'bin.ts')` rather than the literal `src\bin.ts` for clarity. Working directory is already `$RepoRoot` from earlier in the script, so the relative path resolves correctly.

- [ ] **Step 2: Smoke test — full happy path against a fixture**

Confirm a fixture exists:
```powershell
Test-Path "C:\Users\Administrator\SimpleSiteEdit\fixtures\jekyll"
```
Expected: `True` (per the README, the project ships 7 fixture sites including Jekyll).

If `True`: double-click `Start SimpleSiteEdit.bat`, pick `fixtures\jekyll`. Expected: prereq lines print, banner prints, `deno serve` starts on `localhost:8000`, the browser auto-opens to the admin UI, and the console keeps streaming server logs. Press Ctrl+C to stop — window closes without a pause.

If no fixture exists: pick any folder containing a `_config.yml` (Jekyll) or a `*.md` folder. Same expected behavior.

- [ ] **Step 3: Smoke test — CLI exits non-zero pauses**

Pick a folder that SimpleSiteEdit will reject. The CLI prints an error to stderr and exits non-zero. Expected: the yellow "SimpleSiteEdit exited with code N" line appears and the `Press Enter to close` pause holds the window open.

(If you can't easily force a non-zero exit, temporarily change the launch line to `& node --bogus-flag (Join-Path 'src' 'bin.ts') $siteFolder` to force a Node argument error, run the test, then revert.)

- [ ] **Step 4: Commit**

```powershell
git add scripts/start-simplesiteedit.ps1
git commit -m "feat(launcher): spawn SimpleSiteEdit CLI against picked folder"
```

---

### Task 8: Add the Windows quick-start to README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read the current Usage section to find the right insertion point**

Run: read lines 40–65 of `README.md`. The Usage heading is at line 40; the first code block (`node --experimental-strip-types ... --dry-run`) starts shortly after.

- [ ] **Step 2: Insert a "Quick start (Windows)" subsection immediately after the `## Usage` heading and before the existing `Look at a site without launching anything:` paragraph**

Use Edit with `old_string` matching:
```
## Usage

Look at a site without launching anything:
```

Replace with:
```
## Usage

### Quick start (Windows)

Double-click `Start SimpleSiteEdit.bat` at the repo root. A folder picker opens — choose your site folder and click OK. A console window stays open showing server logs; close it or press Ctrl+C to stop. The launcher checks for Node 22+, Deno, and that `npm install` has been run, and shows a friendly message if anything is missing. The last folder you picked is remembered for next time.

For more control (dry-run inspection, `--persist`, etc.), use the CLI directly:

Look at a site without launching anything:
```

- [ ] **Step 3: Verify the README still reads cleanly**

Read lines 40–80 of `README.md`. Expected: the new subsection sits above the CLI usage and the CLI sections that follow are unchanged.

- [ ] **Step 4: Commit**

```powershell
git add README.md
git commit -m "docs: document Windows double-click launcher in README"
```

---

### Task 9: Final manual smoke test pass

**Files:** none

Run through every row of the spec's testing checklist end-to-end, with all prior tasks in place, to confirm nothing regressed during the build-up.

- [ ] **Step 1: Happy path**

Delete the memory file: `Remove-Item "$env:LOCALAPPDATA\SimpleSiteEdit\last-folder.txt" -ErrorAction SilentlyContinue`.

Double-click `Start SimpleSiteEdit.bat`. Expected: three prereq OK lines, folder picker appears, pick `fixtures/jekyll`, browser opens to the Lume admin, an edit in the admin UI writes back to the file on disk.

- [ ] **Step 2: Cancel**

Re-launch, click Cancel in the dialog. Expected: window closes immediately, no error, no pause.

- [ ] **Step 3: Last-folder memory**

Re-launch. Expected: dialog pre-selects `fixtures/jekyll`.

- [ ] **Step 4: Missing `node_modules`**

```powershell
Rename-Item "C:\Users\Administrator\SimpleSiteEdit\node_modules" "C:\Users\Administrator\SimpleSiteEdit\node_modules.bak"
& "C:\Users\Administrator\SimpleSiteEdit\Start SimpleSiteEdit.bat"
# After verifying:
Rename-Item "C:\Users\Administrator\SimpleSiteEdit\node_modules.bak" "C:\Users\Administrator\SimpleSiteEdit\node_modules"
```
Expected: red "Dependencies are not installed..." message, pause, exit 1.

- [ ] **Step 5: Missing Deno**

Open a PowerShell with Deno masked off PATH and run the launcher from there. Expected: red Deno message, pause, exit 1.

- [ ] **Step 6: Missing / old Node**

Same approach as step 5 for Node. Expected: red Node message, pause, exit 1.

- [ ] **Step 7: No commit needed**

This task is verification-only. If any step fails, fix the relevant earlier task and re-run.
