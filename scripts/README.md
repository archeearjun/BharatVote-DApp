# BharatVote Scripts

This folder contains utility scripts for managing the BharatVote project.

## Daily Push Script

**File:** `daily-push.ps1`

Automatically commits and pushes all changes to GitHub daily.

### Usage

```powershell
.\scripts\daily-push.ps1
```

### Features

- Checks for uncommitted changes
- Stages all changes
- Commits with timestamp
- Pushes to GitHub
- Handles errors gracefully

### Scheduling (Windows Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at your preferred time
4. Action: Start a program
5. Program: `powershell.exe`
6. Arguments: `-File "C:\Users\arche\Desktop\BharatVote\scripts\daily-push.ps1"`
7. Start in: `C:\Users\arche\Desktop\BharatVote`

## Weekly Progress Update Script

**File:** `update-weekly-progress.ps1`

Helps create and update weekly progress reports.

### Usage

```powershell
# Create/update Week 1 progress
.\scripts\update-weekly-progress.ps1 -Week 1 -Summary "Completed wallet integration and contract setup"

# Create/update Week 2 progress
.\scripts\update-weekly-progress.ps1 -Week 2 -Summary "Implemented admin controls and candidate management"
```

### Parameters

- `-Week` (Required): Week number (1-8)
- `-Summary` (Optional): Quick summary of the week's progress

## GitHub Actions

The repository also includes a GitHub Actions workflow (`.github/workflows/daily-push.yml`) that can automatically push changes daily. However, this requires the repository to have changes, which is better handled by the local script.

## Notes

- Make sure Git is installed and configured
- Ensure you have push access to the GitHub repository
- The scripts will fail gracefully if there are no changes to commit
