"use client"
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import 'chart.js/auto'

// Reusable Sensor Card Component
const SensorCard = ({ label, value, unit, borderColor }) => (
  <div className="border-b pb-2">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-xl font-semibold">
      {value !== undefined && value !== null ? 
        `${Number(value).toFixed(2)} ${unit}` : 
        'N/A'}
    </p>
  </div>
)

// Growth Status Indicator Component
const GrowthStatus = ({ status }) => {
  const statusColors = {
    normal: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
    optimal: 'bg-blue-100 text-blue-800',
  }
  
  const statusText = status?.toLowerCase() || 'normal'
  const colorClass = statusColors[statusText] || statusColors.normal

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
    </span>
  )
}

export default function Lettuce() {
  const [sensorData, setSensorData] = useState([])
  const [predictions, setPredictions] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedSensor, setSelectedSensor] = useState('temp_envi')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [sensorRes, predictionRes] = await Promise.all([
          fetch('/api/sensors-data'),
          fetch('/api/prediction-data')
        ])
        
        const [sensorData, predictionData] = await Promise.all([
          sensorRes.json(),
          predictionRes.json()
        ])
        
        setSensorData(sensorData)
        setPredictions(predictionData)
      } catch (err) {
        console.error('Data fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const latestSensor = sensorData[0] || {}
  const latestPrediction = predictions[0] || {}

  const sensors = [
    { label: 'Humidity', key: 'humidity', unit: '%' },
    { label: 'Air Temperature', key: 'temp_envi', unit: '°C' },
    { label: 'Water Temperature', key: 'temp_water', unit: '°C' },
    { label: 'TDS', key: 'tds', unit: 'ppm' },
    { label: 'Conductivity', key: 'ec', unit: 'µS/cm' },
    { label: 'Lux', key: 'lux', unit: 'lx' },
    { label: 'PPFD', key: 'ppfd', unit: 'µmol/m²/s' },
    { label: 'Reflectance 445nm', key: 'reflect_445', unit: '%' },
    { label: 'Reflectance 480nm', key: 'reflect_480', unit: '%' },
    { label: 'pH', key: 'ph', unit: '' },
  ]

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

  const growthStages = predictions.map(pred => ({
    date: formatDate(pred.stage_date),
    stage: pred.stage_name || 'Unknown Stage',
    yield: pred.yield_predicted ? Math.round(pred.yield_predicted) : 'N/A',
    status: pred.yield_status || 'normal'
  }))

  const trendLabels = sensorData.slice(0, 10).reverse().map(d => 
    formatTime(d.timestamp));
  
  const selectedSensorInfo = sensors.find(s => s.key === selectedSensor) || sensors[0];
  const selectedSensorData = {
    labels: trendLabels,
    datasets: [
      {
        label: `${selectedSensorInfo.label} (${selectedSensorInfo.unit})`,
        data: sensorData.slice(0, 10).reverse().map(d => 
          d[selectedSensor] ? Number(d[selectedSensor]).toFixed(2) : null),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.3,
        fill: true,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return `${value} ${selectedSensorInfo.unit}`
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`
          }
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">🌱 Lettuce Growth Stage, Yield Prediction and Sensor Data</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'bg-white border hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('predictions')} 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'predictions' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'bg-white border hover:bg-gray-100'
            }`}
          >
            Growth Timeline
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-500">Current Growth Stage</h3>
              <p className="text-2xl font-bold mt-2 text-green-700">
                {latestPrediction.stage_name || 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Since {formatDate(latestPrediction.stage_date)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-500">Predicted Yield</h3>
              <p className="text-2xl font-bold mt-2 text-blue-700">
                {latestPrediction.yield_predicted ? Math.round(latestPrediction.yield_predicted) : 'N/A'} heads
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Expected by {formatDate(latestPrediction.yield_date)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
              <h3 className="text-sm font-medium text-gray-500">Growth Status</h3>
              <div className="flex items-center mt-2">
                <GrowthStatus status={latestPrediction.yield_status} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${predictions.length > 0 ? 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sensor and Chart Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Current Sensor Readings</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sensors.map(sensor => (
                  <SensorCard
                    key={sensor.key}
                    label={sensor.label}
                    value={latestSensor[sensor.key]}
                    unit={sensor.unit}
                    borderColor="border-green-500"
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Sensor Trends</h2>
                <select
                  value={selectedSensor}
                  onChange={e => setSelectedSensor(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {sensors.map(sensor => (
                    <option key={sensor.key} value={sensor.key}>
                      {sensor.label} ({sensor.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-64">
                <Line data={selectedSensorData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Readings Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Recent Sensor Readings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                    {sensors.map(sensor => (
                      <th key={sensor.key} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                        {sensor.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sensorData.slice(0, 5).map((reading, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatTime(reading.timestamp)}
                      </td>
                      {sensors.map(sensor => (
                        <td key={sensor.key} className="px-4 py-3 whitespace-nowrap">
                          {reading[sensor.key] !== undefined && reading[sensor.key] !== null ? 
                            `${Number(reading[sensor.key]).toFixed(2)} ${sensor.unit}` : 
                            'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Growth Stage Timeline</h2>
          </div>
          <div className="p-6">
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
              {growthStages.length > 0 ? (
                growthStages.map((stage, idx) => (
                  <div key={idx} className="relative pl-12 pb-8 last:pb-0">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{stage.stage}</h3>
                          <p className="text-sm text-gray-500">{stage.date}</p>
                        </div>
                        <GrowthStatus status={stage.status} />
                      </div>
                      <div className="mt-2 flex items-center">
                        <span className="text-sm font-medium text-gray-700 mr-2">Yield Prediction:</span>
                        <span className="font-bold">{stage.yield} heads</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No growth stage predictions available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}