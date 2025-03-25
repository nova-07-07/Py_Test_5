@echo off

IF "%~1"=="" (
    echo Usage: run_python_file.bat "<python_script>" "<env_path>"
    exit /b
)

set ENV_DIR=%~2

if not exist "%ENV_DIR%" (
    echo Virtual environment not found at %ENV_DIR%
    exit /b
)

echo ----------------ENV_DIR----------------
echo  %ENV_DIR%
echo ---------------------------------------

call "%ENV_DIR%\Scripts\activate.bat"

pip install pytest

echo Running script pytest:
pytest %1 -s -v

echo Deactivating virtual environment...
call "%ENV_DIR%\Scripts\deactivate.bat"
