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
    
    // Improved CSV parsing that handles quoted fields with commas
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
    }
    
    // Parse headers - handle quoted values
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
    const requiredHeaders = ['CO AQI Value', 'Ozone AQI Value', 'NO2 AQI Value', 'PM2.5 AQI Value', 'lat', 'lng', 'AQI Value'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }
    
    const data = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = parseCSVLine(line).map(v => v.replace(/^"|"$/g, '').trim());
        const row: any = {};
        headers.forEach((header, index) => {
          if (index < values.length) {
            const value = parseFloat(values[index]);
            row[header] = isNaN(value) ? null : value;
          }
        });
        return row;
      })
      .filter(row => {
        // Filter out rows with invalid coordinates
        const lat = row['lat'];
        const lng = row['lng'];
        return lat !== null && lng !== null && 
               !isNaN(lat) && !isNaN(lng) &&
               lat >= -90 && lat <= 90 &&
               lng >= -180 && lng <= 180;
      });
    
    console.log('Loaded data points:', data.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading air quality data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
} 