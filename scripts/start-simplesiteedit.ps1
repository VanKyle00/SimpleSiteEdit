$ErrorActionPreference = 'Stop'

function Fail($message) {
    Write-Host ""
    Write-Host $message -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $RepoRoot

$MemoryDir = Join-Path $env:LOCALAPPDATA 'SimpleSiteEdit'
$MemoryFile = Join-Path $MemoryDir 'last-folder.txt'

# --- Prereq: Node >= 22 ---
$nodeVersion = $null
try { $nodeVersion = (& node --version) } catch {}
if (-not $nodeVersion) {
    Fail "Node.js is not installed or not on PATH.`nInstall Node.js 22+ from https://nodejs.org and reopen this launcher."
}
if ($nodeVersion -notmatch '^v(\d+)\.') {
    Fail "Could not parse Node version: '$nodeVersion'. Install Node.js 22+ from https://nodejs.org."
}
$nodeMajor = [int]$matches[1]
if ($nodeMajor -lt 22) {
    Fail "Node.js $nodeVersion found, but SimpleSiteEdit needs 22 or newer.`nInstall Node.js 22+ from https://nodejs.org."
}
Write-Host "Node $nodeVersion OK"

# --- Prereq: Deno ---
$denoVersion = $null
try {
    $denoLines = & deno --version 2>$null
    if ($denoLines) { $denoVersion = ($denoLines | Select-Object -First 1) }
} catch {}
if (-not $denoVersion) {
    Fail "Deno is not installed or not on PATH.`nInstall Deno from https://deno.com and reopen this launcher."
}
Write-Host "$denoVersion OK"

# --- Prereq: dependencies installed ---
if (-not (Test-Path (Join-Path $RepoRoot 'node_modules'))) {
    Fail "Dependencies are not installed.`nOpen a terminal in this folder and run: npm install"
}
Write-Host "node_modules OK"

# --- Folder picker ---
Add-Type -AssemblyName System.Windows.Forms | Out-Null

$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = "Select the site folder to edit"
$dialog.ShowNewFolderButton = $false

try {
    if (Test-Path $MemoryFile) {
        $lastFolder = (Get-Content $MemoryFile -Raw -ErrorAction Stop).Trim()
        if ($lastFolder -and (Test-Path $lastFolder)) {
            $dialog.SelectedPath = $lastFolder
        }
    }
} catch {
    # Ignore - pre-selection is a nicety.
}

$result = $dialog.ShowDialog()
if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
    exit 0
}
$siteFolder = $dialog.SelectedPath

try {
    if (-not (Test-Path $MemoryDir)) {
        New-Item -ItemType Directory -Path $MemoryDir -Force | Out-Null
    }
    Set-Content -Path $MemoryFile -Value $siteFolder -Encoding utf8
} catch {
    # Ignore - remembering is a nicety.
}

# --- Launch the CLI ---
Write-Host ""
Write-Host "Starting SimpleSiteEdit against $siteFolder..."
Write-Host "(Close this window or press Ctrl+C to stop)"
Write-Host ""

$binPath = Join-Path 'src' 'bin.ts'
& node --experimental-strip-types $binPath $siteFolder
$cliExit = $LASTEXITCODE

if ($cliExit -ne 0) {
    Write-Host ""
    Write-Host "SimpleSiteEdit exited with code $cliExit." -ForegroundColor Yellow
    Read-Host "Press Enter to close"
}
exit $cliExit
