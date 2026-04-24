'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface AirQualityData {
  'AQI Value': number
  'CO AQI Value': number
  'Ozone AQI Value': number
  'NO2 AQI Value': number
  'PM2.5 AQI Value': number
  lat: number
  lng: number
}

interface MapComponentProps {
  data: AirQualityData[]
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#00e400' // Good
  if (aqi <= 100) return '#ffff00' // Moderate
  if (aqi <= 150) return '#ff7e00' // Unhealthy for Sensitive Groups
  if (aqi <= 200) return '#ff0000' // Unhealthy
  if (aqi <= 300) return '#8f3f97' // Very Unhealthy
  return '#7e0023' // Hazardous
}

export default function MapComponent({ data }: MapComponentProps) {
  useEffect(() => {
    // Force a re-render when data changes
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div className="h-96 w-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No data available for map</p>
      </div>
    )
  }

  // Calculate center from data (average of all coordinates)
  const center = data.length > 0 
    ? [
        data.reduce((sum, item) => sum + item.lat, 0) / data.length,
        data.reduce((sum, item) => sum + item.lng, 0) / data.length
      ] as [number, number]
    : [40.7128, -74.0060] as [number, number]

  return (
    <div className="h-96 w-full">
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        key={data.length} // Force re-render when data changes
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {data.slice(0, 100).map((point, index) => (
          <Marker
            key={index}
            position={[point.lat, point.lng]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div style="
                width: 12px; 
                height: 12px; 
                background-color: ${getAQIColor(point['AQI Value'])}; 
                border: 2px solid white; 
                border-radius: 50%; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold text-sm mb-2">Air Quality Data</h4>
                <div className="space-y-1 text-xs">
                  <p><strong>AQI:</strong> {point['AQI Value']}</p>
                  <p><strong>CO:</strong> {point['CO AQI Value']}</p>
                  <p><strong>Ozone:</strong> {point['Ozone AQI Value']}</p>
                  <p><strong>NO2:</strong> {point['NO2 AQI Value']}</p>
                  <p><strong>PM2.5:</strong> {point['PM2.5 AQI Value']}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
} 