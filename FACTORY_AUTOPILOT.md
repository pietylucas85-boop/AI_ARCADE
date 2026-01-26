# JULES AUTO-PILOT CONFIGURATION
# The Arcade Factory - Cloud Swarm Runner

## How It Works
1.  Jules (gemini-cli) runs tasks from the `TASKS` folder.
2.  When credits are exhausted, it pauses.
3.  A monitor script detects the pause/error and switches accounts.
4.  The next account continues the factory run.

## Account Rotation Pool
Add Google accounts here. The script will cycle through them.
accounts=(
    "pietylucas85@gmail.com"
    # "your.second.account@gmail.com"
    # "your.third.account@gmail.com"
)

## Usage
1.  Add accounts to the pool above (OAuth must be done manually once per account).
2.  Run: `./run_factory.ps1`

## Manual OAuth per Account (One-Time Setup)
For each account, run:
```powershell
# Set the active account
$env:GEMINI_ACCOUNT="your.account@gmail.com"
gemini
# Complete OAuth in browser
```

## Factory Script (run_factory.ps1)
```powershell
$accounts = @("pietylucas85@gmail.com")  # Add more accounts
$taskDir = "D:\AI_Apps\ArcadeHub\TASKS"

foreach ($account in $accounts) {
    Write-Host "Switching to account: $account"
    # Update the google_accounts.json
    $json = @{ active = $account; old = @() } | ConvertTo-Json
    $json | Out-File -FilePath "$env:USERPROFILE\.gemini\google_accounts.json" -Encoding utf8

    # Get all pending tasks
    $tasks = Get-ChildItem -Path $taskDir -Filter "*.md"
    foreach ($task in $tasks) {
        Write-Host "Running task: $($task.Name)"
        Get-Content $task.FullName | gemini
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Account likely out of credits or failed. Switching..."
            break
        }
    }
}
Write-Host "Factory run complete or all accounts exhausted."
```
