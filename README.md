# 🌬️ EcoVision

A modern, real-time air quality prediction system with machine learning models and a beautiful dark/light mode interface.

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **npm** or **yarn**

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Air_quality_prediction
   ```

2. **Run the application**
   ```bash
   # Windows
   start.bat
   
   # Linux/Mac
   chmod +x start.sh
   ./start.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Model Server: http://localhost:5000

## 📊 Data Collection

### Current Data Source
The system currently uses a **static dataset** with **16,697 data points** from various global locations containing:
- CO AQI Value
- Ozone AQI Value  
- NO2 AQI Value
- PM2.5 AQI Value
- Latitude/Longitude coordinates
- Overall AQI Value (target variable)

### Real-Time Data Collection

To collect real-time air quality data, you can integrate with these APIs:

#### 1. OpenWeatherMap API (Recommended)
```bash
# Get free API key from: https://openweathermap.org/api
export OPENWEATHER_API_KEY="your_api_key_here"
```

#### 2. AirVisual API
```bash
# Get API key from: https://www.airvisual.com/api
export AIRVISUAL_API_KEY="your_api_key_here"
```

#### 3. EPA AirNow API (US only)
```bash
# Get API key from: https://docs.airnowapi.org/
export AIRNOW_API_KEY="your_api_key_here"
```

### Collecting Real-Time Data

```bash
# Run the data collector
python data_collector.py
```

This will:
- Collect data from configured APIs
- Save real-time data to `real_time_air_quality.csv`
- Optionally update the training dataset

## 🏗️ Architecture

```
Air Quality Prediction Dashboard
├── Frontend (Next.js + TypeScript)
│   ├── Modern UI with dark/light mode
│   ├── Real-time charts and visualizations
│   ├── Interactive prediction form
│   └── Geographic map display
├── Backend (Flask + Python)
│   ├── Machine learning models (Random Forest + AdaBoost)
│   ├── REST API endpoints
│   └── Model training and prediction
└── Data Collection
    ├── Static CSV dataset
    ├── Real-time API integration
    └── Data preprocessing utilities
```

## 🤖 Machine Learning Models

### Current Models
1. **Random Forest Regressor**
   - Ensemble learning method
   - Good for handling non-linear relationships
   - Robust to outliers

2. **AdaBoost Regressor**
   - Adaptive boosting algorithm
   - Improves prediction accuracy
   - Combines multiple weak learners

### Model Performance
- **Training Data**: 16,697 samples
- **Features**: 6 input variables
- **Target**: AQI Value (0-500 scale)
- **Prediction Method**: Ensemble average of both models

## 🎨 Features

### UI/UX
- ✅ **Dark/Light Mode Toggle**
- ✅ **Responsive Design**
- ✅ **Modern Card-based Layout**
- ✅ **Interactive Charts**
- ✅ **Geographic Map Visualization**
- ✅ **Smooth Animations**

### Functionality
- ✅ **Real-time AQI Prediction**
- ✅ **Historical Data Analysis**
- ✅ **Multiple Location Support**
- ✅ **API Integration Ready**
- ✅ **Data Export Capabilities**

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Keys for real-time data
OPENWEATHER_API_KEY=your_openweather_api_key
AIRVISUAL_API_KEY=your_airvisual_api_key
AIRNOW_API_KEY=your_airnow_api_key

# Model Configuration
MODEL_UPDATE_INTERVAL=3600  # Update models every hour
DATA_COLLECTION_INTERVAL=300  # Collect data every 5 minutes
```

### Customization
- **Model Parameters**: Edit `model_server.py` to adjust ML model settings
- **UI Theme**: Modify `tailwind.config.js` for custom styling
- **Data Sources**: Add new APIs in `data_collector.py`

## 📈 Usage Examples

### Making Predictions
1. Enter pollutant values (CO, Ozone, NO2, PM2.5)
2. Provide latitude/longitude coordinates
3. Click "Predict AQI" to get results
4. View prediction with AQI category and color coding

### Data Analysis
- View average, max, and min AQI statistics
- Analyze pollutant distribution across locations
- Explore geographic patterns on the interactive map

## 🚀 Deployment

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Start development servers
python model_server.py  # Backend
npm run dev            # Frontend
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📝 API Endpoints

### Prediction API
```
POST /api/predict
Content-Type: application/json

{
  "co": 1,
  "ozone": 30,
  "no2": 5,
  "pm25": 25,
  "lat": 40.7128,
  "lng": -74.0060
}
```

### Health Check
```
GET /api/health
```

### Air Quality Data
```
GET /api/air-quality-data
GET /api/air-quality-data?lat=40.7128&lng=-74.0060
```

## 🔍 Troubleshooting

### Common Issues

1. **Model Server Not Starting**
   - Check if Python dependencies are installed
   - Verify CSV file exists in root directory
   - Check port 5000 availability

2. **Frontend Not Loading**
   - Ensure Node.js is installed
   - Run `npm install` to install dependencies
   - Check port 3000 availability

3. **API Integration Issues**
   - Verify API keys are set correctly
   - Check network connectivity
   - Review API rate limits

### Logs
- **Model Server**: Check console output for Flask logs
- **Frontend**: Check browser developer tools
- **Data Collection**: Review `data_collector.py` output

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Air quality data sources and APIs
- Machine learning libraries (scikit-learn)
- Frontend frameworks (Next.js, React)
- UI components (Tailwind CSS, Lucide React)

---

**Note**: This system is designed for educational and research purposes. For production use, ensure proper data validation, error handling, and security measures are implemented. 
