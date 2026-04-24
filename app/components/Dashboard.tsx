'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { Cloud, Wind, Thermometer, Activity, Sun, Moon, MapPin, ArrowRight } from 'lucide-react'
import Map from './Map'

interface AirQualityData {
  'AQI Value': number
  'CO AQI Value': number
  'Ozone AQI Value': number
  'NO2 AQI Value': number
  'PM2.5 AQI Value': number
  lat: number
  lng: number
}

interface PredictionForm {
  co: number
  ozone: number
  no2: number
  pm25: number
  lat: number
  lng: number
}

interface DashboardProps {
  onBack: () => void
}

const AQI_CATEGORIES = [
  { label: 'Good', max: 50, color: '#00e400' },
  { label: 'Moderate', max: 100, color: '#ffff00' },
  { label: 'Unhealthy (Sensitive)', max: 150, color: '#ff7e00' },
  { label: 'Unhealthy', max: 200, color: '#ff0000' },
  { label: 'Very Unhealthy', max: 300, color: '#8f3f97' },
  { label: 'Hazardous', max: Infinity, color: '#7e0023' },
]

const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return { category: 'Good', color: '#00e400', bgColor: 'bg-green-100', textColor: 'text-green-800' }
  if (aqi <= 100) return { category: 'Moderate', color: '#d4a017', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
  if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', color: '#ff7e00', bgColor: 'bg-orange-100', textColor: 'text-orange-800' }
  if (aqi <= 200) return { category: 'Unhealthy', color: '#ff0000', bgColor: 'bg-red-100', textColor: 'text-red-800' }
  if (aqi <= 300) return { category: 'Very Unhealthy', color: '#8f3f97', bgColor: 'bg-purple-100', textColor: 'text-purple-800' }
  return { category: 'Hazardous', color: '#7e0023', bgColor: 'bg-red-900/20', textColor: 'text-red-900' }
}

const POLLUTANT_COLORS = {
  CO: '#3b82f6',
  Ozone: '#10b981',
  NO2: '#f59e0b',
  'PM2.5': '#ef4444',
}

export default function Dashboard({ onBack }: DashboardProps) {
  const [data, setData] = useState<AirQualityData[]>([])
  const [filteredData, setFilteredData] = useState<AirQualityData[]>([])
  const [prediction, setPrediction] = useState<number | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<PredictionForm>({
    co: 1,
    ozone: 30,
    no2: 5,
    pm25: 25,
    lat: 40.7128,
    lng: -74.0060
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/air-quality-data')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load data: ${res.statusText}`)
        return res.json()
      })
      .then(json => {
        if (Array.isArray(json)) {
          setData(json)
          setFilteredData(json.slice(0, 100))
        }
      })
      .catch(err => {
        console.error('Error loading data:', err)
        setData([])
        setFilteredData([])
      })
      .finally(() => setIsLoading(false))
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    document.documentElement.classList.toggle('dark', newMode)
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
  }

  const handlePrediction = async () => {
    try {
      if (!formData.co || !formData.ozone || !formData.no2 || !formData.pm25 ||
        formData.lat === undefined || formData.lng === undefined) {
        alert('Please fill in all fields')
        return
      }
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.statusText}`)
      }
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      setPrediction(result.prediction)
    } catch (error) {
      console.error('Prediction error:', error)
      alert(error instanceof Error ? error.message : 'Failed to make prediction. Please try again.')
      setPrediction(null)
    }
  }

  const aqiStats = {
    average: data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item['AQI Value'], 0) / data.length) : 0,
    max: data.length > 0 ? Math.max(...data.map(item => item['AQI Value'])) : 0,
    min: data.length > 0 ? Math.min(...data.map(item => item['AQI Value'])) : 0,
  }

  // Bar chart: average AQI per pollutant
  const pollutantAvgData = [
    { name: 'CO', 'Avg AQI': data.length > 0 ? Math.round(data.reduce((s, d) => s + (d['CO AQI Value'] || 0), 0) / data.length) : 5 },
    { name: 'Ozone', 'Avg AQI': data.length > 0 ? Math.round(data.reduce((s, d) => s + (d['Ozone AQI Value'] || 0), 0) / data.length) : 35 },
    { name: 'NO2', 'Avg AQI': data.length > 0 ? Math.round(data.reduce((s, d) => s + (d['NO2 AQI Value'] || 0), 0) / data.length) : 8 },
    { name: 'PM2.5', 'Avg AQI': data.length > 0 ? Math.round(data.reduce((s, d) => s + (d['PM2.5 AQI Value'] || 0), 0) / data.length) : 45 },
  ]

  // Pie chart: AQI category distribution
  const categoryDistribution = AQI_CATEGORIES.map(cat => {
    const prev = AQI_CATEGORIES[AQI_CATEGORIES.indexOf(cat) - 1]
    const min = prev ? prev.max + 1 : 0
    const count = data.filter(d => d['AQI Value'] >= min && d['AQI Value'] <= cat.max).length
    return { name: cat.label, value: count, color: cat.color }
  }).filter(d => d.value > 0)

  // Radar chart: pollutant profile
  const radarData = [
    { subject: 'CO', value: pollutantAvgData[0]['Avg AQI'], fullMark: 500 },
    { subject: 'Ozone', value: pollutantAvgData[1]['Avg AQI'], fullMark: 500 },
    { subject: 'NO2', value: pollutantAvgData[2]['Avg AQI'], fullMark: 500 },
    { subject: 'PM2.5', value: pollutantAvgData[3]['Avg AQI'], fullMark: 500 },
  ]

  const cardClass = `rounded-xl shadow-lg p-6 transition-all duration-300 ${isDarkMode ? 'bg-white/10 backdrop-blur-sm border border-white/20' : 'bg-white border border-gray-200 shadow-xl'}`
  const tickColor = isDarkMode ? '#d1d5db' : '#374151'
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb'
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDarkMode ? '#ffffff' : '#000000',
  }

  const ChartSkeleton = () => (
    <div className="h-[300px] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-2 w-full px-4">
        <div className={`h-4 w-1/3 rounded ${isDarkMode ? 'bg-white/20' : 'bg-gray-200'}`} />
        <div className={`h-48 w-full rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`} />
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 text-gray-900'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md'}`}
            >
              <ArrowRight className="h-6 w-6 rotate-180" />
            </motion.button>
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Air Quality Prediction Dashboard
              </h1>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Monitor and predict air quality using machine learning models
              </p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-yellow-400' : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md'}`}
          >
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Average AQI', value: aqiStats.average, icon: <Activity className="h-6 w-6 text-white" />, gradient: 'from-blue-500 to-blue-600' },
            { label: 'Max AQI', value: aqiStats.max, icon: <Thermometer className="h-6 w-6 text-white" />, gradient: 'from-red-500 to-red-600' },
            { label: 'Min AQI', value: aqiStats.min, icon: <Wind className="h-6 w-6 text-white" />, gradient: 'from-green-500 to-green-600' },
            { label: 'Data Points', value: data.length, icon: <Cloud className="h-6 w-6 text-white" />, gradient: 'from-purple-500 to-purple-600' },
          ].map(({ label, value, icon, gradient }) => (
            <motion.div key={label} whileHover={{ scale: 1.02, y: -5 }} className={cardClass}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>{icon}</div>
                <div className="ml-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {isLoading ? <span className="animate-pulse">—</span> : value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pollutant Average Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
            <h3 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Average AQI by Pollutant</h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mean AQI contribution per pollutant across all data points</p>
            {isLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pollutantAvgData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="coGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="ozoneGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="no2Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 13 }} />
                  <YAxis tick={{ fill: tickColor, fontSize: 12 }} label={{ value: 'AQI', angle: -90, position: 'insideLeft', fill: tickColor, fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [val, 'Avg AQI']} />
                  <Bar dataKey="Avg AQI" radius={[6, 6, 0, 0]}>
                    {pollutantAvgData.map((entry) => {
                      const gradMap: Record<string, string> = { CO: 'url(#coGrad)', Ozone: 'url(#ozoneGrad)', NO2: 'url(#no2Grad)', 'PM2.5': 'url(#pm25Grad)' }
                      return <Cell key={entry.name} fill={gradMap[entry.name]} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Prediction Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Predict Air Quality</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {([
                  { label: 'CO AQI', key: 'co' as const, placeholder: 'e.g. 5' },
                  { label: 'Ozone AQI', key: 'ozone' as const, placeholder: 'e.g. 30' },
                  { label: 'NO2 AQI', key: 'no2' as const, placeholder: 'e.g. 8' },
                  { label: 'PM2.5 AQI', key: 'pm25' as const, placeholder: 'e.g. 25' },
                ] as const).map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
                    <input
                      type="number"
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {([
                  { label: 'Latitude', key: 'lat' as const },
                  { label: 'Longitude', key: 'lng' as const },
                ] as const).map(({ label, key }) => (
                  <div key={key}>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <MapPin className="inline h-4 w-4 mr-1" />{label}
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrediction}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Predict AQI
              </motion.button>
              {prediction !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-4 p-6 rounded-lg border ${getAQICategory(prediction).bgColor} ${getAQICategory(prediction).textColor}`}
                >
                  <p className="text-sm font-medium mb-1">Predicted AQI:</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: getAQICategory(prediction).color }}>{prediction}</p>
                  <p className="text-sm opacity-90 font-medium">{getAQICategory(prediction).category}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AQI Category Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cardClass}>
            <h3 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>AQI Category Distribution</h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Breakdown of data points by AQI health category</p>
            {isLoading ? <ChartSkeleton /> : categoryDistribution.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [val, 'Data Points']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Pollutant Radar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={cardClass}>
            <h3 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Pollutant Profile</h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Radar view of average pollutant AQI levels</p>
            {isLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 13 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: tickColor, fontSize: 11 }} />
                  <Radar name="Avg AQI" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [val, 'Avg AQI']} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={cardClass}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Air Quality Map</h3>
          <Map data={filteredData} />
        </motion.div>
      </div>
    </div>
  )
}
