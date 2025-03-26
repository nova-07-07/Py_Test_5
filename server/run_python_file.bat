@echo off
SETLOCAL

IF "%~1"=="" (
    echo Usage: run_python_file.bat "<python_script>" "<env_path>"
    exit /b 1
)

SET FILE_PATH=%~1
SET ENV_DIR=%~2

if not exist "%FILE_PATH%" (
    echo Error: Python script not found -> %FILE_PATH%
    exit /b 1
)

if not exist "%ENV_DIR%" (
    echo Error: Virtual environment not found -> %ENV_DIR%
    exit /b 1
)

REM Print paths for debugging
echo -----------------------
echo  Running in ENV_DIR: %ENV_DIR%
echo  Executing: %FILE_PATH%
echo -----------------------

REM Activate virtual environment
CALL "%ENV_DIR%\Scripts\activate.bat"

REM Ensure pytest is installed
pip install --quiet pytest

REM Check if it's a pytest file or a normal script
echo %FILE_PATH% | findstr /I "test_" >nul && (
    echo Running as pytest...
    pytest "%FILE_PATH%" -s -v
) || (
    echo Running as normal script...
    python "%FILE_PATH%"
)

REM Deactivate environment
call deactivate

ENDLOCAL
exit /b 0
