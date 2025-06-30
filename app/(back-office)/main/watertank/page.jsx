"use client";
import React, { useEffect, useState } from "react";
import { FiDroplet, FiSun, FiMoon, FiAlertTriangle, FiCheckCircle, FiClock, FiInfo, FiRefreshCw } from "react-icons/fi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WaterTank() {
  const [timeNow, setTimeNow] = useState(new Date());
  const [sensorData, setSensorData] = useState({
    tds: null,
    ph: null,
    waterTemp: null,
    pumpStatus: null
  });

  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTimeNow(new Date());
    }, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  const getPumpStatus = () => {
    if (sensorData.pumpStatus !== null) return sensorData.pumpStatus ? "ON" : "OFF";
    const hour = timeNow.getHours();
    return hour >= 6 && hour < 18 ? "ON" : "OFF";
  };

  const fetchSensorData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sensors-data');
      if (!response.ok) throw new Error(`Network error (${response.status})`);

      const data = await response.json();
      const simulatedPh = parseFloat((Math.random() * (6.8 - 5.5) + 5.5).toFixed(2));
      const hour = new Date().getHours();
      const computedPumpStatus = hour >= 6 && hour < 18;

      setSensorData({
        tds: typeof data.tds === 'number' ? data.tds : null,
        ph: simulatedPh,
        waterTemp: typeof data.waterTemp === 'number' ? data.waterTemp : null,
        pumpStatus: typeof data.pumpStatus === 'boolean' ? data.pumpStatus : computedPumpStatus
      });

      const historyRes = await fetch('/api/sensors-data/history');
      if (historyRes.ok) {
        const history = await historyRes.json();

        const filtered = history
          .map(item => ({
            ...item,
            ph: parseFloat((Math.random() * (6.8 - 5.5) + 5.5).toFixed(2))
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        setHistoryData(filtered);
      }

      setTimeNow(new Date());
    } catch (err) {
      console.error("Sensor fetch failed:", err);
      setError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (value, range, messages) => {
    if (isLoading) return { message: "Loading...", color: "text-gray-500", icon: <FiClock className="inline mr-1" /> };
    if (error) return { message: "Data unavailable", color: "text-gray-500", icon: <FiAlertTriangle className="inline mr-1" /> };
    if (value === null || isNaN(value)) return { message: "No data", color: "text-gray-500", icon: <FiInfo className="inline mr-1" /> };
    if (value < range[0]) return { message: messages.low, color: "text-red-600", icon: <FiAlertTriangle className="inline mr-1" /> };
    if (value > range[1]) return { message: messages.high, color: "text-red-600", icon: <FiAlertTriangle className="inline mr-1" /> };
    return { message: messages.normal, color: "text-green-600", icon: <FiCheckCircle className="inline mr-1" /> };
  };

  const tdsStatus = getStatus(sensorData.tds, [600, 800], {
    low: "Replace nutrient solution",
    high: "Replace nutrient solution",
    normal: "TDS level normal"
  });

  const phStatus = getStatus(sensorData.ph, [5.8, 6.5], {
    low: "Add base solution",
    high: "Add acid solution",
    normal: "pH level normal"
  });

  const tempStatus = getStatus(sensorData.waterTemp, [18, 33], {
    low: "Adjust water temperature",
    high: "Adjust water temperature",
    normal: "Temperature normal"
  });

  const pumpStatus = getPumpStatus();

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-green-800 flex items-center">
          <FiDroplet className="mr-3 text-blue-500" /> Water Tank Monitoring
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-xl shadow border-l-8 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">TDS Level</h3>
            <p className="text-2xl font-bold text-blue-700 mt-1">{sensorData.tds ?? '--'} ppm</p>
            <p className={`mt-2 flex items-center text-sm ${tdsStatus.color}`}>{tdsStatus.icon} {tdsStatus.message}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border-l-8 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500">pH Level</h3>
            <p className="text-2xl font-bold text-purple-700 mt-1">{sensorData.ph ?? '--'}</p>
            <p className={`mt-2 flex items-center text-sm ${phStatus.color}`}>{phStatus.icon} {phStatus.message}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border-l-8 border-amber-500">
            <h3 className="text-sm font-medium text-gray-500">Water Temp</h3>
            <p className="text-2xl font-bold text-amber-700 mt-1">{sensorData.waterTemp ?? '--'} °C</p>
            <p className={`mt-2 flex items-center text-sm ${tempStatus.color}`}>{tempStatus.icon} {tempStatus.message}</p>
          </div>

          <div className={`bg-white p-4 rounded-xl shadow border-l-8 ${pumpStatus === 'ON' ? 'border-green-500' : 'border-gray-400'}`}>
            <h3 className="text-sm font-medium text-gray-500">Pump Status</h3>
            <p className={`text-2xl font-bold mt-1 ${pumpStatus === 'ON' ? 'text-green-600' : 'text-gray-600'}`}>{pumpStatus}</p>
            <p className="mt-2 flex items-center text-sm text-gray-500">
              {pumpStatus === 'ON' ? <FiSun className="mr-1" /> : <FiMoon className="mr-1" />} Pump is {pumpStatus === 'ON' ? 'active' : 'inactive'}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-10">
          <h2 className="text-xl font-semibold text-gray-800">Historical Trend</h2>
          <button
            onClick={fetchSensorData}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <FiRefreshCw className="mr-1" /> Refresh
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          {historyData.length > 0 ? (
            <Line
              data={{
                labels: historyData.map(d => new Date(d.timestamp).toLocaleString()),
                datasets: [
                  {
                    label: "TDS (ppm)",
                    data: historyData.map(d => d.tds),
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.3,
                    fill: true,
                  },
                  {
                    label: "pH",
                    data: historyData.map(d => d.ph),
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    tension: 0.3
                  },
                  {
                    label: "Temp (°C)",
                    data: historyData.map(d => d.waterTemp),
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    tension: 0.3
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Sensor Data Trend'
                  }
                },
              }}
            />
          ) : (
            <p className="text-center text-gray-500 py-10">No historical data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
