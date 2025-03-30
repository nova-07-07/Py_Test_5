@echo off
SETLOCAL

IF "%~1"=="" (
    echo Usage: run_python_file.bat "<python_script>" "<env_path>" "<testType>"
    exit /b 1
)

SET FILE_PATH=%~1
SET ENV_DIR=%~2
SET TESTTYPT=%~3

if not exist "%FILE_PATH%" (
    echo Error: Python script not found -> %FILE_PATH%
    exit /b 1
)

if not exist "%ENV_DIR%" (
    echo Error: Virtual environment not found -> %ENV_DIR%
    exit /b 1
)

REM Get the original execution time
FOR /F "tokens=2 delims==" %%I IN ('wmic os get localdatetime /value') DO SET DateTime=%%I
SET Year=%DateTime:~0,4%
SET Month=%DateTime:~4,2%
SET Day=%DateTime:~6,2%
SET Hour=%DateTime:~8,2%
SET Minute=%DateTime:~10,2%
SET Second=%DateTime:~12,2%

REM Format the time for output
SET FormattedTime=%Hour%:%Minute%:%Second%
SET FormattedDate=%Day%/%Month%/%Year%

REM Get the weekday name
FOR /F "tokens=1-3 delims=/ " %%A IN ("%FormattedDate%") DO (
    FOR /F "skip=1 tokens=2-4 delims=," %%X IN ('wmic path win32_localtime get DayOfWeek^, Month^, Day /format:csv') DO (
        SET "WeekDay=Sunday Monday Tuesday Wednesday Thursday Friday Saturday"
        FOR /F "tokens=%%X" %%G IN ("%WeekDay%") DO SET DayName=%%G
    )
)

REM Print execution details
echo -----------------------
echo  Running in ENV_DIR: %ENV_DIR%
echo  Executing: %FILE_PATH%
echo  Execution Time: %FormattedTime% %DayName% %FormattedDate%
echo  Test type : %TESTTYPT%
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
