# Automated test runner for Arcade Hub games
param(
    [string]$gameDir = "D:\AI_Apps\ArcadeHub\games",
    [string]$reportDir = "D:\AI_Apps\ArcadeHub\test-reports"
)

# Create report directory
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

# Get all games
$games = Get-ChildItem -Path $gameDir -Directory

foreach ($game in $games) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "[TESTING] $($game.Name)" -ForegroundColor Yellow
    Write-Host "========================================`n"
    
    $reportFile = "$reportDir\$($game.Name)_$(Get-Date -Format 'yyyy-MM-dd_HH-mm').md"
    
    # Start report
    "# Test Report: $($game.Name)" | Out-File -FilePath $reportFile
    "**Date:** $(Get-Date)" | Out-File -FilePath $reportFile -Append
    "" | Out-File -FilePath $reportFile -Append
    
    # Check if game has required files
    $hasIndex = Test-Path "$($game.FullName)\index.html"
    $hasApp = Test-Path "$($game.FullName)\src\App.jsx"
    $hasPackage = Test-Path "$($game.FullName)\package.json"
    
    "## File Structure Check" | Out-File -FilePath $reportFile -Append
    "- index.html: $(if($hasIndex){'PASS'}else{'FAIL'})" | Out-File -FilePath $reportFile -Append
    "- App.jsx: $(if($hasApp){'PASS'}else{'FAIL'})" | Out-File -FilePath $reportFile -Append
    "- package.json: $(if($hasPackage){'PASS'}else{'FAIL'})" | Out-File -FilePath $reportFile -Append
    "" | Out-File -FilePath $reportFile -Append
    
    if ($hasIndex -or $hasApp) {
        # Check for premium standards compliance
        "## Premium Standards Check" | Out-File -FilePath $reportFile -Append
        
        # Read game files and check for key features
        $gameFiles = Get-ChildItem -Path $game.FullName -Recurse -Include *.js,*.jsx,*.ts,*.tsx
        $allContent = $gameFiles | ForEach-Object { Get-Content $_.FullName -Raw } | Out-String
        
        # Check for key features
        $hasPlatformHook = $allContent -match "usePlatform"
        $hasAchievements = $allContent -match "achievement"
        $hasLeaderboard = $allContent -match "leaderboard"
        $hasHaptics = $allContent -match "vibrate"
        $hasAudio = $allContent -match "Audio|sound|music"
        
        "- Platform Integration: $(if($hasPlatformHook){'PASS'}else{'FAIL'})" | Out-File -FilePath $reportFile -Append
        "- Achievements: $(if($hasAchievements){'PASS'}else{'FAIL'})" | Out-File -FilePath $reportFile -Append
        "- Leaderboard: $(if($hasLeaderboard){'PASS'}else{'FAIL'})" | Out-File -FilePath $reportFile -Append
        "- Haptics: $(if($hasHaptics){'PASS'}else{'FAIL'})" | Out-File -FilePath $reportFile -Append
        "- Audio: $(if($hasAudio){'PASS'}else{'FAIL'})" | Out-File -FilePath $reportFile -Append
        "" | Out-File -FilePath $reportFile -Append
        
        # Run npm test if package.json exists
        if ($hasPackage) {
            "## npm test output" | Out-File -FilePath $reportFile -Append
            Push-Location $game.FullName
            Write-Host "[INFO] Running npm test..." -ForegroundColor Green
            $testOutput = npm test 2>&1
            $testOutput | Out-File -FilePath $reportFile -Append
            Pop-Location
        }
    } else {
        "## Result: FAIL (Missing critical files)" | Out-File -FilePath $reportFile -Append
    }
    
    Write-Host "[OK] Report saved: $reportFile" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan  
Write-Host "[COMPLETE] All game tests finished!" -ForegroundColor Yellow
Write-Host "========================================`n"
