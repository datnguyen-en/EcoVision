import requests
import pandas as pd
import time
import json
from datetime import datetime
import os
import logging
from typing import Optional, Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AirQualityDataCollector:
    def __init__(self):
        self.api_keys = {
            'openweather': os.getenv('OPENWEATHER_API_KEY', ''),
            'airvisual': os.getenv('AIRVISUAL_API_KEY', ''),
            'airnow': os.getenv('AIRNOW_API_KEY', '')
        }
        self.data_file = 'AQI-and-Lat-Long-of-Countries.csv'
        self.new_data_file = 'real_time_air_quality.csv'
        
        # Check if at least one API key is configured
        if not any(self.api_keys.values()):
            logger.warning("No API keys configured. Set environment variables: OPENWEATHER_API_KEY, AIRVISUAL_API_KEY, or AIRNOW_API_KEY")
        
    def get_openweather_data(self, lat: float, lng: float) -> Optional[Dict]:
        """Collect data from OpenWeatherMap Air Pollution API"""
        if not self.api_keys['openweather']:
            return None
        
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            logger.error(f"Invalid coordinates: lat={lat}, lng={lng}")
            return None
            
        try:
            url = "https://api.openweathermap.org/data/2.5/air_pollution"
            params = {
                'lat': lat,
                'lon': lng,
                'appid': self.api_keys['openweather']
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if 'list' not in data or len(data['list']) == 0:
                logger.warning("No data in OpenWeather response")
                return None
                
            components = data['list'][0].get('components', {})
            main = data['list'][0].get('main', {})
            
            return {
                'co': components.get('co', 0),
                'no2': components.get('no2', 0),
                'o3': components.get('o3', 0),
                'pm2_5': components.get('pm2_5', 0),
                'aqi': main.get('aqi', 0)
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching OpenWeather data: {e}")
        except (KeyError, IndexError) as e:
            logger.error(f"Error parsing OpenWeather response: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in get_openweather_data: {e}")
        return None
    
    def get_airvisual_data(self, lat: float, lng: float) -> Optional[Dict]:
        """Collect data from AirVisual API"""
        if not self.api_keys['airvisual']:
            return None
        
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            logger.error(f"Invalid coordinates: lat={lat}, lng={lng}")
            return None
            
        try:
            url = "https://api.airvisual.com/v2/nearest_city"
            params = {
                'lat': lat,
                'lon': lng,
                'key': self.api_keys['airvisual']
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if 'data' not in data or 'current' not in data['data']:
                logger.warning("No data in AirVisual response")
                return None
                
            current = data['data']['current']
            pollution = current.get('pollution', {})
            
            return {
                'co': pollution.get('co', 0),
                'no2': pollution.get('no2', 0),
                'o3': pollution.get('o3', 0),
                'pm2_5': pollution.get('pm25', 0),
                'aqi': pollution.get('aqius', 0)
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching AirVisual data: {e}")
        except (KeyError, IndexError) as e:
            logger.error(f"Error parsing AirVisual response: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in get_airvisual_data: {e}")
        return None
    
    def convert_to_aqi_values(self, data):
        """Convert raw pollutant values to AQI values"""
        # Simplified conversion - in practice, you'd use EPA standards
        return {
            'CO AQI Value': min(data['co'] * 10, 500),
            'Ozone AQI Value': min(data['o3'] * 2, 500),
            'NO2 AQI Value': min(data['no2'] * 5, 500),
            'PM2.5 AQI Value': min(data['pm2_5'] * 2, 500),
            'AQI Value': data['aqi']
        }
    
    def collect_data_for_location(self, lat: float, lng: float, location_name: str = "") -> Optional[Dict]:
        """Collect air quality data for a specific location"""
        logger.info(f"Collecting data for {location_name or f'({lat}, {lng})'}...")
        
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            logger.error(f"Invalid coordinates: lat={lat}, lng={lng}")
            return None
        
        # Try different APIs in order of preference
        data = None
        if self.api_keys['openweather']:
            data = self.get_openweather_data(lat, lng)
            if data:
                logger.info("Successfully collected data from OpenWeather")
        elif self.api_keys['airvisual']:
            data = self.get_airvisual_data(lat, lng)
            if data:
                logger.info("Successfully collected data from AirVisual")
        
        if data:
            aqi_data = self.convert_to_aqi_values(data)
            return {
                'AQI Value': aqi_data['AQI Value'],
                'CO AQI Value': aqi_data['CO AQI Value'],
                'Ozone AQI Value': aqi_data['Ozone AQI Value'],
                'NO2 AQI Value': aqi_data['NO2 AQI Value'],
                'PM2.5 AQI Value': aqi_data['PM2.5 AQI Value'],
                'lat': lat,
                'lng': lng,
                'timestamp': datetime.now().isoformat(),
                'source': 'real_time'
            }
        
        logger.warning(f"Failed to collect data for {location_name or f'({lat}, {lng})'}")
        return None
    
    def collect_data_for_multiple_locations(self, locations):
        """Collect data for multiple locations"""
        collected_data = []
        
        for location in locations:
            data = self.collect_data_for_location(
                location['lat'], 
                location['lng'], 
                location.get('name', '')
            )
            if data:
                collected_data.append(data)
            time.sleep(1)  # Rate limiting 
        
        return collected_data
    
    def update_training_dataset(self, new_data: List[Dict]) -> bool:
        """Add new data to the training dataset"""
        if not new_data:
            logger.warning("No new data to update")
            return False
            
        try:
            # Load existing data
            if os.path.exists(self.data_file):
                existing_df = pd.read_csv(self.data_file)
                logger.info(f"Loaded existing dataset with {len(existing_df)} records")
            else:
                existing_df = pd.DataFrame()
                logger.info("No existing dataset found, creating new one")
            
            # Convert new data to DataFrame
            new_df = pd.DataFrame(new_data)
            
            # Validate required columns
            required_columns = ['AQI Value', 'CO AQI Value', 'Ozone AQI Value', 
                               'NO2 AQI Value', 'PM2.5 AQI Value', 'lat', 'lng']
            missing_columns = [col for col in required_columns if col not in new_df.columns]
            if missing_columns:
                logger.error(f"Missing required columns in new data: {missing_columns}")
                return False
            
            # Combine datasets
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            
            # Remove duplicates based on lat/lng
            initial_count = len(combined_df)
            combined_df = combined_df.drop_duplicates(subset=['lat', 'lng'], keep='last')
            removed_count = initial_count - len(combined_df)
            
            if removed_count > 0:
                logger.info(f"Removed {removed_count} duplicate records")
            
            # Save updated dataset
            combined_df.to_csv(self.data_file, index=False)
            logger.info(f"Updated dataset with {len(new_data)} new records. Total records: {len(combined_df)}")
            
            return True
        except Exception as e:
            logger.error(f"Error updating dataset: {e}")
            return False
    
    def save_real_time_data(self, data: List[Dict]) -> bool:
        """Save real-time data to separate file"""
        if not data:
            logger.warning("No data to save")
            return False
            
        try:
            df = pd.DataFrame(data)
            df.to_csv(self.new_data_file, index=False)
            logger.info(f"Saved {len(data)} real-time records to {self.new_data_file}")
            return True
        except Exception as e:
            logger.error(f"Error saving real-time data: {e}")
            return False

# Example usage
if __name__ == "__main__":
    collector = AirQualityDataCollector()
    
    # Example locations (major cities)
    locations = [
        {'lat': 40.7128, 'lng': -74.0060, 'name': 'New York'},
        {'lat': 51.5074, 'lng': -0.1278, 'name': 'London'},
        {'lat': 48.8566, 'lng': 2.3522, 'name': 'Paris'},
        {'lat': 35.6762, 'lng': 139.6503, 'name': 'Tokyo'},
        {'lat': 39.9042, 'lng': 116.4074, 'name': 'Beijing'}
    ]
    
    logger.info("Starting air quality data collection...")
    logger.info("Note: Set API keys as environment variables for real data collection")
    logger.info("OPENWEATHER_API_KEY, AIRVISUAL_API_KEY, AIRNOW_API_KEY")
    
    # Collect data
    new_data = collector.collect_data_for_multiple_locations(locations)
    
    if new_data:
        # Save real-time data
        collector.save_real_time_data(new_data)
        
        # Update training dataset (optional - uncomment to enable)
        # collector.update_training_dataset(new_data)
        
        logger.info(f"Successfully collected data for {len(new_data)} locations")
    else:
        logger.warning("No data collected. Check API keys and network connection.")
