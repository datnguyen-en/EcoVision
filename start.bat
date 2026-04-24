@echo off
echo Starting Air Quality Prediction Dashboard...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and try again
    pause
    exit /b 1
)

REM Check if CSV file exists
if not exist "AQI-and-Lat-Long-of-Countries.csv" (
    echo WARNING: CSV file not found: AQI-and-Lat-Long-of-Countries.csv
    echo The model server may fail to start
    echo.
)

echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo Starting Python model server...
start "Model Server" cmd /k "python model_server.py"
if errorlevel 1 (
    echo ERROR: Failed to start model server
    pause
    exit /b 1
)

echo.
echo Waiting for model server to start...
timeout /t 8 /nobreak > nul

REM Check if model server is running
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Model server may not be ready yet
    echo Continuing anyway...
)

echo.
echo Starting Next.js development server...
echo.
echo Both servers are now running!
echo - Model server: http://localhost:5000
echo - Next.js app: http://localhost:3000
echo.
echo Press Ctrl+C to stop the Next.js server
echo Close the "Model Server" window to stop the Python server
echo.

call npm run dev 