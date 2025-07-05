"use client"
import React, { useEffect, useState } from 'react'
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
  parseISO
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
const StageDetailsModal = ({ isOpen, onClose, stages }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-800">Growth Stage Details</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {stages.length > 0 ? (
            <div className="space-y-4">
              {stages.map((stage, idx) => (
                <div key={idx} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg text-green-700">{stage.stage}</h4>
                    <GrowthStatus status={stage.status} />
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{format(new Date(stage.date), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Yield Prediction</p>
                      <p className="font-medium">{stage.yield} heads</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">
                      {stage.notes || 'No notes available'}
                    </p>
                  </div>
                </div>
              ))}
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
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4, 1)) // Start with May 2025
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Create a map of growth stages by stage_date
  const stagesByDate = {};
  predictions.forEach(pred => {
    if (pred.stage_date) {
      // Format stage_date to YYYY-MM-DD
      const date = new Date(pred.stage_date);
      const dateKey = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      
      if (!stagesByDate[dateKey]) {
        stagesByDate[dateKey] = [];
      }
      
      stagesByDate[dateKey].push({
        stage: pred.stage_name || 'Unknown Stage',
        yield: pred.yield_predicted ? Math.round(pred.yield_predicted) : 'N/A',
        status: pred.yield_status || 'normal',
        date: pred.stage_date,
        notes: pred.notes || ''
      });
    }
  });

  // Calendar generation with week-based layout
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Month navigation handlers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Handle date click
  const handleDateClick = (day) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    setSelectedDate({
      date: day,
      stages: stagesByDate[dayKey] || []
    });
    setIsModalOpen(true);
  };

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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen p-4 sm:p-6 ml-0 md:ml-20">
      {/* Stage Details Modal */}
      <StageDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stages={selectedDate?.stages || []}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0 ">
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
            Growth Calendar
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
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">
                Growth Calendar - {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={prevMonth}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Prev
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date(2025, 4, 1))}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  May 2025
                </button>
                <button 
                  onClick={goToToday}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Today
                </button>
                <button 
                  onClick={nextMonth}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Calendar Header - Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const stageList = stagesByDate[dayKey] || [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                
                return (
                  <div 
                    key={dayKey} 
                    onClick={() => handleDateClick(day)}
                    className={`
                      min-h-24 border rounded-lg p-2 cursor-pointer
                      ${isCurrentMonth ? 
                        (stageList.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200') : 
                        'bg-gray-100 text-gray-400'
                      }
                      hover:shadow-md transition-shadow
                      relative
                      ${stageList.length > 0 ? 'hover:bg-green-100' : 'hover:bg-gray-100'}
                    `}
                  >
                    <div className={`font-semibold mb-1 ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                      {format(day, 'd')}
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
                    
                    {/* Highlight today's date */}
                    {isSameDay(day, new Date()) && isCurrentMonth && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Growth Stage Legend */}
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
            </div>
            
            {/* Growth Summary */}
            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Growth Summary for {format(currentMonth, 'MMMM yyyy')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(stagesByDate).filter(key => {
                      const date = new Date(key);
                      return isSameMonth(date, currentMonth);
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Days with Growth Data</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(stagesByDate)
                      .flat()
                      .filter(stage => isSameMonth(new Date(stage.date), currentMonth))
                      .length}
                  </div>
                  <div className="text-sm text-gray-600">Total Growth Stages</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.values(stagesByDate)
                      .flat()
                      .filter(stage => 
                        isSameMonth(new Date(stage.date), currentMonth) && 
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