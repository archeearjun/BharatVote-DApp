# Weekly Progress Update Script
# This script helps create/update weekly progress reports

param(
    [Parameter(Mandatory=$true)]
    [int]$Week,
    
    [Parameter(Mandatory=$false)]
    [string]$Summary = ""
)

$ErrorActionPreference = "Stop"

# Get the repository root directory
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if ($Week -lt 1 -or $Week -gt 8) {
    Write-Host "Error: Week must be between 1 and 8" -ForegroundColor Red
    exit 1
}

$weekFolder = "weekly-progress\Week$Week"
$progressFile = "$weekFolder\WEEK${Week}_PROGRESS.md"
$summaryFile = "$weekFolder\WEEK${Week}_SUMMARY.md"

# Create week folder if it doesn't exist
if (-not (Test-Path $weekFolder)) {
    New-Item -ItemType Directory -Force -Path $weekFolder | Out-Null
    Write-Host "Created folder: $weekFolder" -ForegroundColor Green
}

# Get current date
$date = Get-Date -Format "yyyy-MM-dd"

# Create progress file if it doesn't exist
if (-not (Test-Path $progressFile)) {
    $template = Get-Content "weekly-progress\TEMPLATE.md" -Raw
    $template = $template -replace "Week X", "Week $Week"
    $template = $template -replace "\[Date\]", $date
    $template | Out-File -FilePath $progressFile -Encoding UTF8
    Write-Host "Created progress file: $progressFile" -ForegroundColor Green
}

# Create summary file
$summaryContent = @"
# Week $Week Summary

**Date:** $date
**Week:** $Week of 8

## Quick Summary

$Summary

## Key Achievements

- Achievement 1
- Achievement 2
- Achievement 3

## Files Changed

[Add list of key files changed this week]

## Next Steps

- Task 1
- Task 2
- Task 3

---
*This is an automated summary. Update WEEK${Week}_PROGRESS.md for detailed information.*
"@

$summaryContent | Out-File -FilePath $summaryFile -Encoding UTF8
Write-Host "Created/Updated summary file: $summaryFile" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Weekly progress files updated!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Edit $progressFile for detailed progress" -ForegroundColor Yellow
Write-Host "Edit $summaryFile for quick summary" -ForegroundColor Yellow
