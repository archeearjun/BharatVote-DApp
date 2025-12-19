# Daily Push Script for BharatVote
# This script commits and pushes all changes to GitHub daily
# Run this script manually or schedule it with Windows Task Scheduler

$ErrorActionPreference = "Stop"

# Get the repository root directory
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "BharatVote Daily Push Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not a git repository" -ForegroundColor Red
    exit 1
}

# Get current date for commit message
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Daily push: $date"

Write-Host "Checking git status..." -ForegroundColor Yellow
$status = git status --porcelain

if ($status) {
    Write-Host "Changes detected. Staging files..." -ForegroundColor Yellow
    
    # Stage all changes
    git add -A
    
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m $commitMessage
    
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "Commit: $commitMessage" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Failed to push to GitHub" -ForegroundColor Red
        Write-Host "Please check your git credentials and network connection" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    
    # Still try to push in case there are commits from another machine
    Write-Host "Checking for remote updates..." -ForegroundColor Yellow
    git fetch origin
    
    $localCommits = git rev-list HEAD ^origin/main 2>$null
    if ($localCommits) {
        Write-Host "Pushing local commits..." -ForegroundColor Yellow
        git push origin main
        Write-Host "✓ Pushed local commits to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "Repository is up to date." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Daily push completed!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
