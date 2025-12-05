@echo off
echo ===================================================
echo   ECHOFORGE PRO - BUILD SYSTEM
echo   Creating Standalone Executable for Distribution
echo ===================================================

echo.
echo [1/3] Installing Build Tools...
pip install pyinstaller

echo.
echo [2/3] Building Executable...
cd "d:\AI_Apps\echoforge-pro (1)"
python -m PyInstaller --onefile --name "EchoForge_Server" --add-data "voices;voices" server.py

echo.
echo [3/3] Packaging for Sale...
mkdir "dist\EchoForge_Release"
copy "dist\EchoForge_Server.exe" "dist\EchoForge_Release\"
copy "README.md" "dist\EchoForge_Release\"
echo. > "dist\EchoForge_Release\LICENSE_KEY_GOES_HERE.txt"

echo.
echo ===================================================
echo   BUILD COMPLETE!
echo   Your sellable product is in:
echo   d:\AI_Apps\echoforge-pro (1)\dist\EchoForge_Release
echo ===================================================
pause
