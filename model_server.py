from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import numpy as np
from sklearn.ensemble import RandomForestRegressor, AdaBoostRegressor
import joblib
import os
import logging
from typing import Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS - restrict to localhost in production
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Global variables for models
m1 = None  # RandomForest
m2 = None  # AdaBoost

def load_or_train_models():
    """Load existing models or train new ones"""
    global m1, m2
    
    csv_file = 'AQI-and-Lat-Long-of-Countries.csv'
    
    # Check if CSV file exists
    if not os.path.exists(csv_file):
        logger.error(f"CSV file not found: {csv_file}")
        return False
    
    # Check if models exist
    if os.path.exists('random_forest_model.pkl') and os.path.exists('adaboost_model.pkl'):
        try:
            logger.info("Loading existing models...")
            m1 = joblib.load('random_forest_model.pkl')
            m2 = joblib.load('adaboost_model.pkl')
            logger.info("Models loaded successfully")
            return True
        except Exception as e:
            logger.warning(f"Error loading models: {e}. Will train new models.")
    
    # Train new models if they don't exist
    try:
        logger.info("Training new models...")
        air_quality_data = pd.read_csv(csv_file)
        
        # Validate CSV structure
        required_columns = ['CO AQI Value', 'Ozone AQI Value', 'NO2 AQI Value', 'PM2.5 AQI Value', 'lat', 'lng', 'AQI Value']
        missing_columns = [col for col in required_columns if col not in air_quality_data.columns]
        if missing_columns:
            logger.error(f"Missing required columns in CSV: {missing_columns}")
            return False
        
        # Check if data is empty
        if len(air_quality_data) == 0:
            logger.error("CSV file is empty")
            return False
        
        # Prepare training data
        train1 = air_quality_data.drop(['AQI Value'], axis=1)
        target = air_quality_data['AQI Value']
        
        # Remove any rows with NaN values
        mask = ~(train1.isna().any(axis=1) | target.isna())
        train1 = train1[mask]
        target = target[mask]
        
        if len(train1) == 0:
            logger.error("No valid training data after cleaning")
            return False
        
        logger.info(f"Training on {len(train1)} samples...")
        
        # Train Random Forest
        m1 = RandomForestRegressor(random_state=42, n_estimators=100)
        m1.fit(train1, target)
        
        # Train AdaBoost
        m2 = AdaBoostRegressor(random_state=42, n_estimators=50)
        m2.fit(train1, target)
        
        # Save models
        joblib.dump(m1, 'random_forest_model.pkl')
        joblib.dump(m2, 'adaboost_model.pkl')
        
        logger.info("Models trained and saved successfully")
        return True
    except Exception as e:
        logger.error(f"Error training models: {e}")
        return False

def validate_inputs(co: float, ozone: float, no2: float, pm25: float, lat: float, lng: float) -> Tuple[bool, Optional[str]]:
    """Validate input parameters"""
    # Check for required fields
    if co is None or ozone is None or no2 is None or pm25 is None or lat is None or lng is None:
        return False, "All fields are required"
    
    # Validate ranges
    if co < 0 or co > 500:
        return False, "CO AQI must be between 0 and 500"
    if ozone < 0 or ozone > 500:
        return False, "Ozone AQI must be between 0 and 500"
    if no2 < 0 or no2 > 500:
        return False, "NO2 AQI must be between 0 and 500"
    if pm25 < 0 or pm25 > 500:
        return False, "PM2.5 AQI must be between 0 and 500"
    if lat < -90 or lat > 90:
        return False, "Latitude must be between -90 and 90"
    if lng < -180 or lng > 180:
        return False, "Longitude must be between -180 and 180"
    
    return True, None

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Check if models are loaded
        if m1 is None or m2 is None:
            logger.error("Models not loaded")
            return jsonify({'error': 'Models not available. Please wait for models to load.'}), 503
        
        # Get and validate request data
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        try:
            co = float(data.get('co', 0))
            ozone = float(data.get('ozone', 0))
            no2 = float(data.get('no2', 0))
            pm25 = float(data.get('pm25', 0))
            lat = float(data.get('lat', 0))
            lng = float(data.get('lng', 0))
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid input type: {e}")
            return jsonify({'error': 'Invalid input type. All values must be numbers.'}), 400
        
        # Validate inputs
        is_valid, error_msg = validate_inputs(co, ozone, no2, pm25, lat, lng)
        if not is_valid:
            logger.warning(f"Invalid input: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        # Create input array
        input_data = np.array([[co, ozone, no2, pm25, lat, lng]])
        
        # Make predictions with both models
        try:
            rf_prediction = m1.predict(input_data)[0]
            adaboost_prediction = m2.predict(input_data)[0]
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return jsonify({'error': 'Failed to make prediction'}), 500
        
        # Average the predictions
        final_prediction = (rf_prediction + adaboost_prediction) / 2
        
        # Ensure prediction is within valid range
        final_prediction = max(0, min(500, final_prediction))
        
        logger.info(f"Prediction made: {final_prediction}")
        
        return jsonify({
            'prediction': round(final_prediction, 2),
            'rf_prediction': round(rf_prediction, 2),
            'adaboost_prediction': round(adaboost_prediction, 2),
            'inputs': {
                'co': co,
                'ozone': ozone,
                'no2': no2,
                'pm25': pm25,
                'lat': lat,
                'lng': lng
            }
        })
    except Exception as e:
        logger.error(f"Unexpected error in predict: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'models_loaded': m1 is not None and m2 is not None})

if __name__ == '__main__':
    # Load or train models on startup
    if load_or_train_models():
        logger.info("Starting Flask server on http://0.0.0.0:5000")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        logger.error("Failed to load or train models. Exiting.")
        exit(1) 