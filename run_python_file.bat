@echo off
:: Ensure a Python file is provided as an argument
if "%~1"=="" (
    echo Usage: run_python.bat "<python_script>"
    exit /b
)

:: Remove quotes from the argument (if any)
set SCRIPT_PATH=%~1

:: Set up the virtual environment directory
set ENV_DIR=venv

:: Check if the virtual environment exists
if not exist %ENV_DIR% (
    echo Creating virtual environment...
    python -m venv %ENV_DIR%
)

:: Activate the virtual environment
call %ENV_DIR%\Scripts\activate

:: Install dependencies if requirements.txt exists
if exist requirements.txt (
    echo Installing dependencies...
    pip install -r requirements.txt
)

:: Run the Python script
python "%SCRIPT_PATH%"

:: Deactivate the virtual environment
deactivate

:: Pause to see output before exiting
pause
