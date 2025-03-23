@echo off

REM @Check if a Python script is provided
IF "%~1"=="" (
    echo Usage: run_python_file.bat "<python_script>"
    exit /b
)

@REM  Define Virtual Environment Directory
set ENV_DIR=venv

@REM Check if Virtual Environment Exists
if not exist %ENV_DIR% (
    echo Creating virtual environment...
    python -m venv %ENV_DIR%
)

@REM Activate the Virtual Environment
call %ENV_DIR%\Scripts\activate.bat

@REM Install Pytest
pip install pytest

@REM Run the Python Script with Pytest
echo Running script pytest:
pytest %1 -s -v

@REM  Run the Script Normally
@REM echo Running script normally:
@REM python %1

@REM Deactivate Virtual Environment
echo Deactivating virtual environment...
call %ENV_DIR%\Scripts\deactivate