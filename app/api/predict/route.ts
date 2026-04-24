import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { co, ozone, no2, pm25, lat, lng } = body

    // Validate input - check for null/undefined and valid ranges
    if (co === undefined || co === null || ozone === undefined || ozone === null || 
        no2 === undefined || no2 === null || pm25 === undefined || pm25 === null || 
        lat === undefined || lat === null || lng === undefined || lng === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate numeric types and ranges
    if (typeof co !== 'number' || typeof ozone !== 'number' || typeof no2 !== 'number' || 
        typeof pm25 !== 'number' || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'All fields must be numbers' }, { status: 400 })
    }

    if (co < 0 || co > 500 || ozone < 0 || ozone > 500 || 
        no2 < 0 || no2 > 500 || pm25 < 0 || pm25 > 500) {
      return NextResponse.json({ error: 'AQI values must be between 0 and 500' }, { status: 400 })
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Invalid latitude or longitude' }, { status: 400 })
    }

    // Call Python model server
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ co, ozone, no2, pm25, lat, lng }),
      })

      if (!response.ok) {
        throw new Error(`Model server responded with status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return NextResponse.json(result)
    } catch (modelError) {
      console.error('Model server error:', modelError)
      
      // Check if it's a connection error
      if (modelError instanceof Error && modelError.message.includes('fetch')) {
        return NextResponse.json({ 
          error: 'Model server is not available. Please ensure the Python server is running on port 5000.',
          note: 'Start the model server with: python model_server.py'
        }, { status: 503 })
      }
      
      // For other errors, return the error from the model server
      return NextResponse.json({ 
        error: 'Failed to get prediction from model server',
        details: modelError instanceof Error ? modelError.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json({ error: 'Failed to make prediction' }, { status: 500 })
  }
} 