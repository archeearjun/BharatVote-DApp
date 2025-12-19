# GitHub Automation Setup Guide

This guide explains how to use the daily push automation and weekly progress tracking system for BharatVote.

## 📋 Overview

The project now includes:
1. **Daily Push Script** - Automatically commits and pushes changes to GitHub daily
2. **Weekly Progress Tracking** - Organized folders for weekly progress reports
3. **GitHub Actions Workflow** - Automated daily pushes (optional)

## 🚀 Quick Start

### Daily Push (Manual)

Run the PowerShell script manually:

```powershell
.\scripts\daily-push.ps1
```

This will:
- Check for uncommitted changes
- Stage all changes
- Commit with timestamp
- Push to GitHub

### Weekly Progress Update

Create/update weekly progress reports:

```powershell
# Example: Update Week 1 progress
.\scripts\update-weekly-progress.ps1 -Week 1 -Summary "Completed wallet integration"
```

## 📅 Setting Up Daily Automation

### Option 1: Windows Task Scheduler (Recommended)

1. Open **Task Scheduler** (search in Windows)
2. Click **Create Basic Task**
3. Name: `BharatVote Daily Push`
4. Trigger: **Daily** at your preferred time (e.g., 11:00 PM)
5. Action: **Start a program**
   - Program: `powershell.exe`
   - Arguments: `-File "C:\Users\arche\Desktop\BharatVote\scripts\daily-push.ps1"`
   - Start in: `C:\Users\arche\Desktop\BharatVote`
6. Check **"Run whether user is logged on or not"**
7. Save and test

### Option 2: GitHub Actions (Cloud-based)

The repository includes `.github/workflows/daily-push.yml` which runs daily at 11:59 PM UTC.

**Note:** This requires the repository to have changes, which is better handled by the local script.

## 📊 Weekly Progress Reports

### Structure

```
weekly-progress/
├── README.md                    # Overview
├── TEMPLATE.md                  # Template for new reports
├── Week1/
│   ├── WEEK1_PROGRESS.md        # Detailed progress
│   └── WEEK1_SUMMARY.md         # Quick summary
├── Week2/
│   └── ...
└── Week8/
    └── ...
```

### Creating a Weekly Report

1. **Use the script:**
   ```powershell
   .\scripts\update-weekly-progress.ps1 -Week 2 -Summary "Implemented admin controls"
   ```

2. **Or manually:**
   - Copy `weekly-progress/TEMPLATE.md`
   - Rename to `WEEK_X_PROGRESS.md`
   - Fill in the details
   - Create `WEEK_X_SUMMARY.md` for quick reference

### What to Include

- **Completed Tasks** - Checklist of what was done
- **Code Changes** - Files modified, LOC added
- **Testing** - Test results and coverage
- **Challenges** - Problems faced and solutions
- **Next Week** - Planned work
- **Metrics** - Commits, files changed, etc.

## 🔧 Troubleshooting

### Git Lock File Error

If you see "Unable to create .git/index.lock":

```powershell
Remove-Item -Force .git\index.lock
```

### Push Fails

1. Check your Git credentials:
   ```powershell
   git config --global user.name
   git config --global user.email
   ```

2. Verify remote URL:
   ```powershell
   git remote -v
   ```

3. Test connection:
   ```powershell
   git fetch origin
   ```

### Script Permission Error

If PowerShell blocks the script:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Best Practices

1. **Run daily push at end of day** - Ensures all work is backed up
2. **Update weekly progress every Friday** - Document the week's achievements
3. **Commit meaningful messages** - The script uses timestamps, but you can commit manually too
4. **Review before pushing** - Check `git status` before running the script

## 🎯 Roadmap Alignment

Weekly progress reports should align with:
- `BACKEND_8WEEK_ROADMAP.md` - Backend development plan
- `FRONTEND_8WEEK_ROADMAP.md` - Frontend development plan

Reference these files when creating weekly reports to ensure alignment.

## 📞 Support

If you encounter issues:
1. Check the script output for error messages
2. Verify Git is installed: `git --version`
3. Ensure you have push access to the repository
4. Check network connectivity

---

**Last Updated:** 2024-12-19
