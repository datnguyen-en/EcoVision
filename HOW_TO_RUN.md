# 🚀 How to Run the Air Quality Prediction Dashboard

## Prerequisites

Before running, make sure you have:
- **Python 3.8+** installed ([Download Python](https://www.python.org/downloads/))
- **Node.js 16+** installed ([Download Node.js](https://nodejs.org/))
- **CSV data file** (`AQI-and-Lat-Long-of-Countries.csv`) in the project root

## Quick Start (Windows) - Recommended

### Option 1: Using the Batch Script (Easiest)

1. **Open Command Prompt or PowerShell** in the project directory
2. **Run the startup script:**
   ```bash
   start.bat
   ```

   This script will:
   - ✅ Check if Python and Node.js are installed
   - ✅ Install Python dependencies
   - ✅ Install Node.js dependencies
   - ✅ Start the Python model server (in a new window)
   - ✅ Start the Next.js frontend server

3. **Wait for both servers to start** (about 10-15 seconds)

4. **Open your browser** and go to:
   - **Frontend Dashboard:** http://localhost:3000
   - **Model Server API:** http://localhost:5000

### Option 2: Manual Setup (Step by Step)

If you prefer to run things manually or the batch script doesn't work:

#### Step 1: Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Step 2: Install Node.js Dependencies
```bash
npm install
```

#### Step 3: Start the Python Model Server
Open a **new terminal window** and run:
```bash
python model_server.py
```
You should see:
```
Models loaded successfully
Starting Flask server on http://0.0.0.0:5000
```

#### Step 4: Start the Next.js Frontend
In the **original terminal**, run:
```bash
npm run dev
```
You should see:
```
- ready started server on 0.0.0.0:3000
```

#### Step 5: Open the Application
Open your browser and navigate to:
- **http://localhost:3000** - Main dashboard

## Linux/Mac Users

If you're on Linux or Mac, you can create a similar script or run manually:

### Manual Steps:
```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install Node.js dependencies
npm install

# 3. Start Python server (in background or new terminal)
python model_server.py &

# 4. Start Next.js server
npm run dev
```

## Troubleshooting

### ❌ "Python is not recognized"
- Make sure Python is installed and added to PATH
- Try using `python3` instead of `python`
- Reinstall Python and check "Add Python to PATH" during installation

### ❌ "Node.js is not recognized"
- Make sure Node.js is installed
- Try using `nodejs` instead of `node` (on some Linux systems)
- Restart your terminal after installing Node.js

### ❌ "CSV file not found"
- Make sure `AQI-and-Lat-Long-of-Countries.csv` is in the project root directory
- Check the file name matches exactly (case-sensitive on Linux/Mac)

### ❌ "Port 5000 already in use"
- Another process is using port 5000
- Close other applications using that port
- Or modify `model_server.py` to use a different port

### ❌ "Port 3000 already in use"
- Another Next.js app might be running
- Close other applications using port 3000
- Or Next.js will automatically use the next available port

### ❌ "Models not loading"
- Check that the CSV file exists and is readable
- Check the console output for specific error messages
- The models will be trained automatically if they don't exist

### ❌ "Module not found" errors
- Make sure you ran `pip install -r requirements.txt`
- Make sure you ran `npm install`
- Try deleting `node_modules` and running `npm install` again

## Stopping the Servers

### Windows (using start.bat):
1. Press `Ctrl+C` in the terminal running Next.js
2. Close the "Model Server" window that opened separately

### Manual:
- **Python server:** Press `Ctrl+C` in its terminal
- **Next.js server:** Press `Ctrl+C` in its terminal

## What's Running?

When everything is working, you'll have:

1. **Python Flask Server** (Port 5000)
   - Handles ML model predictions
   - API endpoint: `http://localhost:5000/predict`
   - Health check: `http://localhost:5000/health`

2. **Next.js Development Server** (Port 3000)
   - Frontend dashboard
   - API routes for data access
   - Hot-reload enabled for development

## First Time Setup

On first run, the system will:
1. Load or train machine learning models (takes 10-30 seconds)
2. Save trained models as `.pkl` files for faster startup next time
3. Load air quality data from the CSV file

## Verifying Everything Works

1. **Check Model Server:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"healthy","models_loaded":true}`

2. **Check Frontend:**
   - Open http://localhost:3000
   - You should see the landing page
   - Click "Enter Dashboard" to see the main interface

3. **Test Prediction:**
   - Fill in the prediction form
   - Click "Predict AQI"
   - You should see a prediction result

## Environment Variables (Optional)

For real-time data collection, create a `.env` file:
```env
OPENWEATHER_API_KEY=your_key_here
AIRVISUAL_API_KEY=your_key_here
AIRNOW_API_KEY=your_key_here
```

This is optional - the app works with the static CSV data without API keys.

## Need Help?

- Check the console output for error messages
- Review `BUGS_AND_IMPROVEMENTS.md` for known issues
- Check `SETUP.md` for detailed setup instructions
- Make sure all prerequisites are installed correctly


