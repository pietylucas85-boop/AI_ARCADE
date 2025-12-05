# DigiMaster AI Builder - Simple Version for Gemini CLI
# Just type 'gemini' and it works!

Write-Host "DigiMaster 3.0 - AI Build Assistant" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$promptFile = "AI_BUILD_PROMPT.md"
$outputFile = "BUILD_OUTPUT.md"

if (-not (Test-Path $promptFile)) {
    Write-Host "Error: $promptFile not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the d:\AI_Apps\DigiMaster_3.0 folder" -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading prompt from $promptFile..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Sending to Gemini (this may take 2-3 minutes)..." -ForegroundColor Green
Write-Host ""

# Send the prompt file to Gemini CLI and save output
Get-Content $promptFile | gemini | Out-File $outputFile -Encoding UTF8

Write-Host ""
Write-Host "Done! Response saved to $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Opening in VS Code..." -ForegroundColor Cyan

# Open the output file
code $outputFile

Write-Host ""
Write-Host "Review the code in $outputFile and copy it into your components!" -ForegroundColor Cyan
Write-Host ""
