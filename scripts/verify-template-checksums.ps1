param(
    [switch]$Regenerate
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$staticRoot = Join-Path $repoRoot "frontend\static"
$htmlFile = Join-Path $repoRoot "frontend\templates\index-7-dark.html"
$manifestPath = Join-Path $repoRoot "docs\phase-01-template-source.sha256"

if (-not (Test-Path -LiteralPath $staticRoot -PathType Container)) {
    throw "Static assets directory not found: $staticRoot"
}
if (-not (Test-Path -LiteralPath $htmlFile -PathType Leaf)) {
    throw "Template HTML not found: $htmlFile"
}
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw "Checksum manifest not found: $manifestPath"
}

function Get-TemplateFilePath([string]$relativePath) {
    if ($relativePath -eq "index-7-dark.html") { return $htmlFile }
    return Join-Path $staticRoot ($relativePath.Replace("/", "\"))
}

$actualPaths = @(
    Get-ChildItem -LiteralPath $staticRoot -Recurse -File |
        ForEach-Object { $_.FullName.Substring($staticRoot.Length + 1).Replace("\", "/") }
)
$actualPaths += "index-7-dark.html"

if ($Regenerate) {
    $manifestLines = foreach ($relativePath in ($actualPaths | Sort-Object)) {
        $hash = (Get-FileHash -LiteralPath (Get-TemplateFilePath $relativePath) -Algorithm SHA256).Hash.ToLowerInvariant()
        "$hash *$relativePath"
    }

    $utf8WithoutBOM = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText(
        $manifestPath,
        ($manifestLines -join "`n") + "`n",
        $utf8WithoutBOM
    )
    Write-Output "Regenerated manifest for $($actualPaths.Count) files."
}

$expected = @{}
foreach ($line in Get-Content -LiteralPath $manifestPath) {
    if ($line -notmatch "^([0-9a-f]{64}) \*(.+)$") {
        throw "Invalid checksum manifest line: $line"
    }
    $expected[$Matches[2]] = $Matches[1]
}

$issues = [System.Collections.Generic.List[string]]::new()
foreach ($relativePath in $actualPaths) {
    if (-not $expected.ContainsKey($relativePath)) {
        $issues.Add("Unrecorded file: $relativePath")
        continue
    }

    $actualHash = (Get-FileHash -LiteralPath (Get-TemplateFilePath $relativePath) -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $expected[$relativePath]) {
        $issues.Add("Checksum mismatch: $relativePath")
    }
}

foreach ($relativePath in $expected.Keys) {
    if ($relativePath -notin $actualPaths) {
        $issues.Add("Missing file: $relativePath")
    }
}

if ($issues.Count -gt 0) {
    $issues | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output "Verified $($expected.Count) frontend template files."
