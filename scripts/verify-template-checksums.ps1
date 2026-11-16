param(
    [switch]$Regenerate
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $repoRoot "template-source"
$manifestPath = Join-Path $repoRoot "docs\phase-01-template-source.sha256"

if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) {
    throw "Template source directory not found: $sourceRoot"
}
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw "Checksum manifest not found: $manifestPath"
}

$actualPaths = @(
    Get-ChildItem -LiteralPath $sourceRoot -Recurse -File |
        ForEach-Object { $_.FullName.Substring($sourceRoot.Length + 1).Replace("\", "/") }
)

if ($Regenerate) {
    $manifestLines = foreach ($relativePath in ($actualPaths | Sort-Object)) {
        $filePath = Join-Path $sourceRoot ($relativePath.Replace("/", "\"))
        $hash = (Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
        "$hash *$relativePath"
    }

    $utf8WithoutBOM = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText(
        $manifestPath,
        ($manifestLines -join "`n") + "`n",
        $utf8WithoutBOM
    )
    Write-Output "Regenerated manifest for $($actualPaths.Count) template-source files."
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

    $filePath = Join-Path $sourceRoot ($relativePath.Replace("/", "\"))
    $actualHash = (Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
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

Write-Output "Verified $($expected.Count) template-source files."
