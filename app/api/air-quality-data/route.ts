import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Function to collect real-time air quality data
async function getRealTimeAirQuality(lat: number, lng: number) {
  try {
    // You can replace this with actual API calls
    // Example: OpenWeatherMap Air Pollution API
    // const API_KEY = process.env.OPENWEATHER_API_KEY;
    // const response = await fetch(
    //   `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${API_KEY}`
    // );
    // const data = await response.json();
    
    // For now, return mock real-time data
    return {
      co: Math.floor(Math.random() * 10) + 1,
      ozone: Math.floor(Math.random() * 50) + 10,
      no2: Math.floor(Math.random() * 20) + 1,
      pm25: Math.floor(Math.random() * 100) + 10,
      aqi: Math.floor(Math.random() * 200) + 20
    };
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');   
    
    // If coordinates are provided, get real-time data
    if (lat && lng) {
      const realTimeData = await getRealTimeAirQuality(parseFloat(lat), parseFloat(lng));
      if (realTimeData) {
        return NextResponse.json([{
          'AQI Value': realTimeData.aqi,
          'CO AQI Value': realTimeData.co,
          'Ozone AQI Value': realTimeData.ozone,
          'NO2 AQI Value': realTimeData.no2,
          'PM2.5 AQI Value': realTimeData.pm25,
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        }]);
      }
    }
    
    // Load static CSV data
    const csvPath = path.join(process.cwd(), 'AQI-and-Lat-Long-of-Countries.csv');
    
    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found:', csvPath);
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV data
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const row: any = {};
      headers.forEach((header, index) => {
        const value = parseFloat(values[index]);
        row[header] = isNaN(value) ? 0 : value;
      });
      return row;
    });
    
    console.log('Loaded data points:', data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading air quality data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
} 