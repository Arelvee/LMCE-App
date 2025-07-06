"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import 'chart.js/auto'
import {
  eachDayOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
  isValid
} from 'date-fns'

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

// Stage Details Modal Component
const StageDetailsModal = ({ isOpen, onClose, stages = [], sensorReading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-800">Growth Stage Details</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {stages.length > 0 ? (
            <div className="space-y-6">
              {stages.map((stage, idx) => (
                <div key={idx} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg text-green-700">{stage.stage}</h4>
                    <GrowthStatus status={stage.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {isValid(parseISO(stage.date)) ? format(parseISO(stage.date), 'MMM d, yyyy') : 'Invalid date'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Yield Prediction</p>
                      <p className="font-medium">{stage.yield} heads</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Status</p>
                      <GrowthStatus status={stage.status} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg min-h-[80px]">
                      {stage.notes || 'No notes available for this growth stage.'}
                    </p>
                  </div>

                  {stage.status !== 'normal' && stage.status !== 'optimal' && (
                    <div className="mt-4 bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-red-700 font-medium">Growth Issue Detected:</p>
                      <p className="text-red-600 mt-1">
                        {stage.notes || 'Abnormal growth conditions detected on this date. Please check sensor data below.'}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-6 border-t pt-6">
                <h4 className="font-bold text-lg text-blue-700 mb-3">Sensor Data on This Date</h4>

                {sensorReading ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600">Humidity</p>
                      <p className="font-bold text-lg">{sensorReading.humidity ? `${sensorReading.humidity}%` : 'N/A'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600">Air Temp</p>
                      <p className="font-bold text-lg">{sensorReading.temp_envi ? `${sensorReading.temp_envi}°C` : 'N/A'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600">Water Temp</p>
                      <p className="font-bold text-lg">{sensorReading.temp_water ? `${sensorReading.temp_water}°C` : 'N/A'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600">pH</p>
                      <p className="font-bold text-lg">{sensorReading.ph || 'N/A'}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600">Light</p>
                      <p className="font-bold text-lg">{sensorReading.lux ? `${sensorReading.lux}lx` : 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-yellow-700">No sensor data available for this date</p>
                    <p className="text-yellow-600 text-sm mt-1">
                      Sensor data might not have been recorded or uploaded for this date.
                    </p>
                  </div>
                )}

                {sensorReading?.timestamp && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Recorded at: {format(parseISO(sensorReading.timestamp), 'h:mm a')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No growth stage data available for this date
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Lettuce() {
  const [sensorData, setSensorData] = useState([])
  const [predictions, setPredictions] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedSensor, setSelectedSensor] = useState('temp_envi')
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch data from both APIs
        const [sensorRes, predictionRes] = await Promise.all([
          fetch('/api/sensors-data'),
          fetch('/api/prediction-data')
        ])

        if (!sensorRes.ok) throw new Error('Failed to fetch sensor data')
        if (!predictionRes.ok) throw new Error('Failed to fetch prediction data')

        const [sensorData, predictionData] = await Promise.all([
          sensorRes.json(),
          predictionRes.json()
        ])

        const processSensorData = (data) => {
          if (!Array.isArray(data)) return []
          return data
            .filter(item => item.timestamp && isValid(parseISO(item.timestamp)))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        }

        const processPredictionData = (data) => {
          if (!Array.isArray(data)) return []
          return data
            .filter(item => item.stage_date && isValid(parseISO(item.stage_date)))
            .sort((a, b) => new Date(a.stage_date) - new Date(b.stage_date))
        }

        setSensorData(processSensorData(sensorData))
        setPredictions(processPredictionData(predictionData))


      } catch (err) {
        console.error('Data fetch error:', err)
        setSensorData([])
        setPredictions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const sensors = useMemo(() => [
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
  ], [])

  const latestSensor = sensorData[0] || {}
  const today = new Date()
  const latestPrediction = [...predictions]
    .filter(p => {
      const stageDate = parseISO(p.stage_date)
      return isValid(stageDate) && stageDate <= today
    })
    .sort((a, b) => new Date(b.stage_date) - new Date(a.stage_date))[0] || {}
  const batchStartDate = predictions[0]?.batch_start || null

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = parseISO(dateString)
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date'
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = parseISO(timestamp)
    return isValid(date) ? format(date, 'h:mm a') : 'Invalid time'
  }

  // Create maps for growth stages and sensor readings
  const [stagesByDate, sensorDataByDate] = useMemo(() => {
    const stagesMap = {}
    const sensorMap = {}

    // Process predictions
    predictions.forEach(pred => {
      try {
        if (!pred?.stage_date) return
        const date = parseISO(pred.stage_date)
        if (!isValid(date)) return

        const dateKey = format(date, 'yyyy-MM-dd')
        if (!stagesMap[dateKey]) stagesMap[dateKey] = []

        stagesMap[dateKey].push({
          stage: pred.stage_name || 'Unknown Stage',
          yield: pred.yield_predicted ? Math.round(pred.yield_predicted) : 'N/A',
          status: pred.status || 'normal',
          date: pred.stage_date,
          notes: pred.notes || ''
        })
      } catch (error) {
        console.error('Error processing prediction:', error, pred)
      }
    })

    // Process sensor data
    sensorData.forEach(reading => {
      try {
        if (!reading?.timestamp) return
        const date = parseISO(reading.timestamp)
        if (!isValid(date)) return

        const dateKey = format(date, 'yyyy-MM-dd')
        if (!sensorMap[dateKey] || date > new Date(sensorMap[dateKey].timestamp)) {
          sensorMap[dateKey] = reading
        }
      } catch (error) {
        console.error('Error processing sensor reading:', error, reading)
      }
    })

    return [stagesMap, sensorMap]
  }, [predictions, sensorData])

  // Calendar generation
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentMonth])

  // Month navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  // Handle date click
  const handleDateClick = (day) => {
    const dayKey = format(day, 'yyyy-MM-dd')
    setSelectedDate({
      date: day,
      stages: stagesByDate[dayKey] || [],
      sensorReading: sensorDataByDate[dayKey] || null
    })
    setIsModalOpen(true)
  }

  // Chart data
  const trendData = useMemo(() => {
    const selectedSensorInfo = sensors.find(s => s.key === selectedSensor) || sensors[1]
    const slicedData = [...sensorData].reverse().slice(0, 10)

    return {
      labels: slicedData.map(d => formatTime(d.timestamp)),
      datasets: [{
        label: `${selectedSensorInfo.label} (${selectedSensorInfo.unit})`,
        data: slicedData.map(d => d[selectedSensor] !== undefined ?
          Number(d[selectedSensor]).toFixed(2) : null),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.3,
        fill: true,
      }]
    }
  }, [sensorData, selectedSensor, sensors])

  const chartOptions = useMemo(() => {
    const selectedSensorInfo = sensors.find(s => s.key === selectedSensor) || sensors[0]

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => `${value} ${selectedSensorInfo.unit}`
          }
        },
        x: { grid: { display: false } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw}`
          }
        }
      }
    }
  }, [selectedSensor, sensors])

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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen ml-0 md:ml-20">
      <StageDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stages={selectedDate?.stages || []}
        sensorReading={selectedDate?.sensorReading}
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">🌱 Lettuce Growth Monitoring</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-green-600 text-white shadow-md' : 'bg-white border hover:bg-gray-100'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'predictions' ? 'bg-green-600 text-white shadow-md' : 'bg-white border hover:bg-gray-100'
              }`}
          >
            Growth Calendar
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-500">Current Growth Stage</h3>
              <p className="text-2xl font-bold mt-2 text-green-700">
                {latestPrediction.stage_name || 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Since {batchStartDate ? formatDate(batchStartDate) : 'N/A'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-500">Predicted Yield</h3>
              <p className="text-2xl font-bold mt-2 text-blue-700">
                {latestPrediction.yield_predicted ? Math.round(latestPrediction.yield_predicted) : 'N/A'} heads
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Expected by {formatDate(latestPrediction.stage_date)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
              <h3 className="text-sm font-medium text-gray-500">Growth Status</h3>
              <div className="flex items-center mt-2">
                <GrowthStatus status={latestPrediction.status} />
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  Last updated: {latestPrediction.timestamp ? formatTime(latestPrediction.timestamp) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

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
                <Line data={trendData} options={chartOptions} />
              </div>
            </div>
          </div>

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
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-700">
                Growth Calendar - {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={prevMonth}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center"
                  aria-label="Previous month"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Prev
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  aria-label="Today"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center"
                  aria-label="Next month"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd')
                const stageList = stagesByDate[dayKey] || []
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const hasSensorData = !!sensorDataByDate[dayKey]
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={dayKey}
                    onClick={() => isCurrentMonth && handleDateClick(day)}
                    className={`
                      min-h-24 border rounded-lg p-2
                      ${isCurrentMonth ?
                        (stageList.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200') :
                        'bg-gray-100 text-gray-400'
                      }
                      ${isCurrentMonth ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
                      transition-shadow relative
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`font-semibold mb-1 ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                        {format(day, 'd')}
                      </div>
                      {hasSensorData && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
                      )}
                    </div>

                    {isCurrentMonth && stageList.length > 0 && (
                      <div className="text-xs space-y-1">
                        {stageList.slice(0, 2).map((stageData, idx) => (
                          <div key={idx} className="mb-1 last:mb-0">
                            <div className="font-medium text-green-800 truncate">
                              {stageData.stage}
                            </div>
                            <div className="text-gray-600 truncate">
                              Yield: <span className="font-semibold">{stageData.yield}</span>
                            </div>
                            <GrowthStatus status={stageData.status} />
                            {idx < stageList.length - 1 && idx < 1 && (
                              <div className="h-px bg-gray-200 my-1"></div>
                            )}
                          </div>
                        ))}
                        {stageList.length > 2 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{stageList.length - 2} more
                          </div>
                        )}
                      </div>
                    )}

                    {isToday && isCurrentMonth && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Growth Stage Recorded</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">No Data</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Other Month</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Today</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Sensor Data</span>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Growth Summary for {format(currentMonth, 'MMMM yyyy')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(stagesByDate).filter(key => {
                      const date = parseISO(key)
                      return isSameMonth(date, currentMonth)
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Days with Growth Data</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(stagesByDate)
                      .flat()
                      .filter(stage => isSameMonth(parseISO(stage.date), currentMonth))
                      .length}
                  </div>
                  <div className="text-sm text-gray-600">Total Growth Stages</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.values(stagesByDate)
                      .flat()
                      .filter(stage =>
                        isSameMonth(parseISO(stage.date), currentMonth) &&
                        stage.status === 'optimal'
                      ).length}
                  </div>
                  <div className="text-sm text-gray-600">Optimal Stages</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}