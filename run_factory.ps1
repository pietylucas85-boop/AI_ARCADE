# Run the Arcade Factory using Jules (Gemini CLI)
# Loops through tasks and rotates Google accounts on credit exhaustion.

param(
    [string[]]$accounts = @(
        "pietylucas85@gmail.com",
        "digimaster2025@gmail.com",
        "evezpulse@gmail.com"
    ),
    [string]$taskDir = "D:\AI_Apps\ArcadeHub\TASKS"
)

$geminiAccountsPath = "$env:USERPROFILE\.gemini\google_accounts.json"

foreach ($account in $accounts) {
    Write-Host "`n======================================" -ForegroundColor Cyan
    Write-Host "🔄 Switching to account: $account" -ForegroundColor Yellow
    Write-Host "======================================`n"

    # Update the google_accounts.json to switch the active account
    $json = @{ active = $account; old = @() } | ConvertTo-Json -Depth 3
    $json | Out-File -FilePath $geminiAccountsPath -Encoding utf8 -Force

    # Get all pending task files (*.md)
    $tasks = Get-ChildItem -Path $taskDir -Filter "*.md" | Sort-Object Name

    foreach ($task in $tasks) {
        Write-Host "`n▶ Running task: $($task.Name)" -ForegroundColor Green

        # Pipe the task content to gemini CLI
        $result = Get-Content $task.FullName -Raw | gemini 2>&1

        # Check for credit exhaustion or errors
        if ($LASTEXITCODE -ne 0 -or $result -match "quota|limit|exceeded|rate|429") {
            Write-Host "⚠ Account '$account' likely exhausted or rate-limited. Switching..." -ForegroundColor Red
            break
        }

        # Mark task as complete by renaming (optional)
        # Rename-Item -Path $task.FullName -NewName "$($task.BaseName)_DONE.md"

        Write-Host "✅ Task '$($task.Name)' completed." -ForegroundColor Green
    }
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "🏭 Factory run complete (or all accounts exhausted)." -ForegroundColor Yellow
Write-Host "======================================`n"
