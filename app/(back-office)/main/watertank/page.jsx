"use client";
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { FiDroplet, FiSun, FiMoon, FiAlertTriangle, FiCheckCircle, FiClock, FiInfo, FiRefreshCw, FiActivity, FiTrendingUp, FiBarChart2, FiHome, FiThermometer, FiZap, FiDropletOff } from "react-icons/fi";

// Reusable Sensor Card Component
const SensorCard = ({ label, value, unit, status, icon }) => {
  const statusColors = {
    normal: 'bg-green-200 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
    optimal: 'bg-blue-100 text-blue-800',
  };

  const statusIcons = {
    normal: <FiCheckCircle className="mr-1" />,
    warning: <FiAlertTriangle className="mr-1" />,
    critical: <FiAlertTriangle className="mr-1" />,
    optimal: <FiCheckCircle className="mr-1" />,
  };

  const statusText = status?.toLowerCase() || 'normal';
  const colorClass = statusColors[statusText] || statusColors.normal;
  const statusIcon = statusIcons[statusText] || statusIcons.normal;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 transition-all duration-200 hover:shadow-md border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium flex items-center">
            {icon} <span className="ml-2">{label}</span>
          </p>
          <p className="text-2xl font-bold mt-2 text-gray-800">
            {value !== undefined && value !== null ?
              `${Number(value).toFixed(2)} ${unit}` :
              'N/A'}
          </p>
        </div>
        <div className={`${colorClass} px-3 py-1 rounded-full text-xs font-medium flex items-center`}>
          {statusIcon} {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl h-16 mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-200 rounded-xl h-64"></div>
        <div className="bg-gray-200 rounded-xl h-64"></div>
      </div>
      <div className="bg-gray-200 rounded-xl h-64"></div>
    </div>
  );
};

// Helper function to get current Manila time
const getManilaTime = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 8)); // UTC+8 for Manila
};

export default function WaterTank() {
  const [sensorData, setSensorData] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSensor, setSelectedSensor] = useState('tds');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const sensors = [
    { label: 'TDS Level', key: 'tds', unit: 'ppm', min: 600, max: 800, icon: <FiActivity className="text-blue-500" /> },
    { label: 'pH Level', key: 'ph', unit: '', min: 5.8, max: 6.5, icon: <FiBarChart2 className="text-purple-500" /> },
    { label: 'Water Temperature', key: 'temp_water', unit: '°C', min: 18, max: 33, icon: <FiThermometer className="text-orange-500" /> },
  ];

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      setFetchError(null);

      const response = await fetch(`/api/sensors-data?t=${new Date().getTime()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Parse timestamps to Manila time
      const parsedData = data.map(item => {
        // Convert server UTC time to Manila time (UTC+8)
        const serverDate = new Date(item.timestamp);
        const manilaTime = new Date(serverDate.getTime() + (8 * 60 * 60 * 1000));

        return {
          ...item,
          parsedTimestamp: manilaTime
        };
      }).sort((a, b) => b.parsedTimestamp - a.parsedTimestamp); // Sort descending

      setSensorData(parsedData);
      setLastUpdated(getManilaTime());
    } catch (err) {
      console.error('Data fetch error:', err);
      setFetchError(err.message || 'Failed to fetch sensor data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Function to get the latest reading
  const getLatestReading = () => {
    if (sensorData.length === 0) return {};
    return sensorData[0]; // First element is the latest
  };

  // Get latest reading
  const latestReading = getLatestReading();

  // Get readings for the last 24 hours for trends (in Manila time)
  // Modified getLast24HoursData function to only return last 10 hours
  const getLast24HoursData = () => {
    if (sensorData.length === 0) return [];

    const now = getManilaTime();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Group readings by hour in Manila time
    const hourlyData = {};

    sensorData.forEach(reading => {
      const readingTime = reading.parsedTimestamp;
      if (readingTime < twentyFourHoursAgo) return;

      // Create hour key in Manila time (YYYY-MM-DD-HH)
      const hourKey = readingTime.toISOString().slice(0, 13).replace('T', '-');

      // Only keep the latest reading for each hour
      if (!hourlyData[hourKey] ||
        readingTime > hourlyData[hourKey].parsedTimestamp) {
        hourlyData[hourKey] = reading;
      }
    });

    // Convert to array, sort descending, and take only last 10 hours
    return Object.values(hourlyData)
      .sort((a, b) => b.parsedTimestamp - a.parsedTimestamp)
      .slice(0, 10); // Only show last 10 hours
  };

  const last24HoursData = getLast24HoursData();

  const getPumpStatus = () => {
    const manilaTime = getManilaTime();
    const hour = manilaTime.getHours();
    return hour >= 6 && hour < 18 ? "ON" : "OFF";
  };

  const pumpStatus = getPumpStatus();

  const getSensorStatus = (value, min, max) => {
    if (value === null || value === undefined) return 'normal';
    if (value < min) return 'warning';
    if (value > max) return 'critical';
    return 'optimal';
  };

  // Format time in Manila time
  const formatTime = (date) => {
    if (!(date instanceof Date)) {
      try {
        date = new Date(date);
      } catch {
        return 'N/A';
      }
    }

    if (isNaN(date)) return 'N/A';

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila'
    });
  };

  // Format date in Manila time
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Manila'
    });
  };

  // Get recommendations based on sensor readings
  const getRecommendations = () => {
    const recommendations = [];

    // TDS recommendations
    const tdsValue = latestReading.tds;
    if (tdsValue !== undefined && tdsValue !== null) {
      if (tdsValue < 600) {
        recommendations.push({
          icon: <FiZap className="text-yellow-500" />,
          message: "TDS level is too low. Add nutrient solution to increase concentration.",
          action: "Add 50-100ml of TDS booster solution per 100L water",
          status: "critical"
        });
      } else if (tdsValue > 800) {
        recommendations.push({
          icon: <FiDropletOff className="text-red-500" />,
          message: "TDS level is too high. Change water or add fresh water to dilute.",
          action: "Replace 30-50% of tank water with fresh water",
          status: "critical"
        });
      }
    }

    // pH recommendations
    const phValue = latestReading.ph;
    if (phValue !== undefined && phValue !== null) {
      if (phValue < 5.8) {
        recommendations.push({
          icon: <FiBarChart2 className="text-purple-500" />,
          message: "pH level is too low (acidic). Add pH Up solution to balance.",
          action: "Add 5-10ml of pH Up solution per 100L water",
          status: "critical"
        });
      } else if (phValue > 6.5) {
        recommendations.push({
          icon: <FiBarChart2 className="text-purple-500" />,
          message: "pH level is too high (alkaline). Add pH Down solution to balance.",
          action: "Add 5-10ml of pH Down solution per 100L water",
          status: "critical"
        });
      }
    }

    // Temperature recommendations
    const tempValue = latestReading.temp_water;
    if (tempValue !== undefined && tempValue !== null) {
      if (tempValue < 18) {
        recommendations.push({
          icon: <FiThermometer className="text-blue-500" />,
          message: "Water temperature is too low. Check heater or insulate tank.",
          action: "Increase water heater temperature by 2-3°C",
          status: "warning"
        });
      } else if (tempValue > 33) {
        recommendations.push({
          icon: <FiThermometer className="text-red-500" />,
          message: "Water temperature is too high. Add ice or cool water.",
          action: "Add ice packs or replace 20% water with cooler water",
          status: "critical"
        });
      }
    }

    // If all readings are normal
    if (recommendations.length === 0) {
      recommendations.push({
        icon: <FiCheckCircle className="text-green-500" />,
        message: "All parameters are within optimal range. No action needed.",
        action: "Continue regular monitoring schedule",
        status: "normal"
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  // Prepare trend data for the chart (last 24 hours, hourly readings)
  const trendLabels = last24HoursData
    .map(d => {
      const manilaTime = new Date(d.parsedTimestamp);
      return manilaTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila'
      });
    }).reverse(); // Reverse for chart to show oldest to newest

  const selectedSensorInfo = sensors.find(s => s.key === selectedSensor) || sensors[0];
  const selectedSensorData = {
    labels: trendLabels,
    datasets: [
      {
        label: `${selectedSensorInfo.label} (${selectedSensorInfo.unit})`,
        data: last24HoursData
          .map(d => d[selectedSensor] ? Number(d[selectedSensor]).toFixed(2) : null)
          .reverse(), // Reverse data points to match labels
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#1e40af',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointRadius: 4,
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function (value) {
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
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 8,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 500
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 sm:p-6 ml-0 md:ml-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-800 p-3 rounded-xl shadow-md">
              <FiDroplet className="text-white text-2xl" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Water Tank Monitoring</h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <FiClock className="mr-1.5" />
                Last updated: {lastUpdated ?
                  `${formatDate(lastUpdated)} at ${lastUpdated.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Manila'
                  })} (Manila Time)` :
                  'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isRefreshing
                ? 'bg-gray-200 text-gray-500'
                : 'bg-white text-green-600 hover:bg-green-50 border border-green-200'
                }`}
            >
              <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>

            <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${activeTab === 'dashboard'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                <FiHome className="mr-2" /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${activeTab === 'trends'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                <FiTrendingUp className="mr-2" /> Trends
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {fetchError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex items-start">
              <FiAlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Data fetch error:</strong> {fetchError}
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Please check your network connection or try again later.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`bg-gradient-to-r ${pumpStatus === "ON"
                ? "from-yellow-500 to-orange-500 text-white"
                : "from-green-500 to-green-800 text-white"
                } p-6 rounded-xl shadow-md`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium">Pump Status</h3>
                    <p className="text-2xl font-bold mt-2">
                      {pumpStatus}
                    </p>
                    <p className="text-sm mt-1 flex items-center opacity-90">
                      {pumpStatus === "ON" ? (
                        <>
                          <FiSun className="mr-1.5" /> Active (6AM-6PM Manila Time)
                        </>
                      ) : (
                        <>
                          <FiMoon className="mr-1.5" /> Inactive (6PM-6AM Manila Time)
                        </>
                      )}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    {pumpStatus === "ON" ? (
                      <FiSun className="text-2xl" />
                    ) : (
                      <FiMoon className="text-2xl" />
                    )}
                  </div>
                </div>
              </div>

              {sensors.map(sensor => {
                const value = latestReading[sensor.key];
                const status = getSensorStatus(value, sensor.min, sensor.max);
                const bgColors = {
                  normal: 'from-gray-400 to-gray-500',
                  warning: 'from-yellow-500 to-amber-500',
                  critical: 'from-red-500 to-rose-500',
                  optimal: 'from-green-500 to-emerald-500',
                };

                const colorClass = bgColors[status] || bgColors.normal;

                return (
                  <div key={sensor.key} className={`bg-gradient-to-r ${colorClass} p-6 rounded-xl shadow-md text-white`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium">{sensor.label}</h3>
                        <p className="text-2xl font-bold mt-2">
                          {value !== undefined && value !== null ?
                            `${Number(value).toFixed(2)} ${sensor.unit}` :
                            'N/A'}
                        </p>
                        <p className="text-sm mt-1 flex items-center opacity-90">
                          {status === 'critical' ? (
                            <>
                              <FiAlertTriangle className="mr-1.5" />
                              {value < sensor.min ? 'Too low' : 'Too high'}
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="mr-1.5" />
                              Normal range
                            </>
                          )}
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                        {sensor.icon}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Readings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 col-span-2">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <FiActivity className="mr-2 text-blue-500" /> Current Sensor Readings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sensors.map(sensor => {
                    const value = latestReading[sensor.key];
                    const status = getSensorStatus(value, sensor.min, sensor.max);
                    return (
                      <SensorCard
                        key={sensor.key}
                        label={sensor.label}
                        value={value}
                        unit={sensor.unit}
                        status={status}
                        icon={sensor.icon}
                      />
                    );
                  })}
                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium flex items-center">
                          <FiSun className="text-amber-500" /> <span className="ml-2">Pump Status</span>
                        </p>
                        <p className="text-2xl font-bold mt-2 text-gray-800">{pumpStatus}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${pumpStatus === "ON"
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                        }`}>
                        {pumpStatus === "ON" ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Panel */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                  <FiInfo className="mr-2 text-blue-500" /> Recommended Actions
                </h2>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${rec.status === 'critical'
                        ? 'border-red-500 bg-red-50'
                        : rec.status === 'warning'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-green-500 bg-green-50'
                        }`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-0.5">
                          {rec.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{rec.message}</p>
                          <p className="text-sm mt-2 text-gray-600 bg-white p-2 rounded-md border border-gray-200">
                            <span className="font-medium">Action:</span> {rec.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Readings Table - Modified to only show last 10 readings */}
<div className="bg-white rounded-xl shadow-sm overflow-hidden">
  <div className="p-5 border-b">
    <h2 className="text-lg font-semibold text-gray-700 flex items-center">
      <FiClock className="mr-2 text-blue-500" /> Recent Sensor Readings (Last 10 Hours - Manila Time)
    </h2>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
          {sensors.map(sensor => (
            <th key={sensor.key} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {sensor.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {last24HoursData.map((reading, idx) => {
          const manilaTime = new Date(reading.parsedTimestamp);
          const formattedTime = manilaTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Manila'
          });
          
          // Highlight current hour row
          const currentHour = getManilaTime().getHours();
          const isCurrentHour = manilaTime.getHours() === currentHour;
          
          return (
            <tr key={idx} className={`hover:bg-blue-50 transition-colors ${isCurrentHour ? 'bg-blue-50' : ''}`}>
              <td className={`px-5 py-4 whitespace-nowrap font-medium ${isCurrentHour ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {formattedTime}
                {isCurrentHour && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Current</span>}
              </td>
              {sensors.map(sensor => {
                const value = reading[sensor.key];
                const status = getSensorStatus(value, sensor.min, sensor.max);
                const statusColors = {
                  critical: 'text-red-600',
                  warning: 'text-yellow-600',
                  normal: 'text-gray-800',
                  optimal: 'text-green-600',
                };

                return (
                  <td
                    key={sensor.key}
                    className={`px-5 py-4 whitespace-nowrap font-medium ${statusColors[status] || 'text-gray-800'}`}
                  >
                    {value !== undefined && value !== null ?
                      `${Number(value).toFixed(2)} ${sensor.unit}` :
                      'N/A'}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>

          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <FiTrendingUp className="mr-2 text-blue-500" /> Sensor Trends (Last 24 Hours - Manila Time)
              </h2>
            </div>
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="font-medium text-gray-700">{selectedSensorInfo.label} Trend</h3>
                  <p className="text-sm text-gray-500">Hourly readings from the last 24 hours</p>
                </div>
                <div className="mt-3 sm:mt-0">
                  <div className="flex flex-wrap gap-2">
                    {sensors.map(sensor => (
                      <button
                        key={sensor.key}
                        onClick={() => setSelectedSensor(sensor.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSensor === sensor.key
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {sensor.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-96">
                <Line data={selectedSensorData} options={chartOptions} />
              </div>
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start">
                  <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    The chart shows the hourly trend of {selectedSensorInfo.label.toLowerCase()} over the last 24 hours.
                    {selectedSensorInfo.min && selectedSensorInfo.max &&
                      ` Optimal range is between ${selectedSensorInfo.min}${selectedSensorInfo.unit} and ${selectedSensorInfo.max}${selectedSensorInfo.unit}.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Water Tank Monitoring System • Data updates every 1 hour • Manila Time (UTC+8)</p>
        </div>
      </div>
    </div>
  );
}