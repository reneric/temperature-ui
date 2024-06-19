"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const TemperatureGraph = () => {
  const [data, setData] = useState([]);
  const [latestTemp, setLatestTemp] = useState(null);
  const [latestHumidity, setLatestHumidity] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [range, setRange] = useState('12H');

  const fetchData = () => {
    axios.get('http://192.168.86.7:8000/temperature')
      .then(response => {
        const temperatureData = response.data.map(d => ({
          ...d,
          timestamp: new Date(d.timestamp)
        })).sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp

        setData(temperatureData);
        filterData(temperatureData, range);

        if (temperatureData.length > 0) {
          const latest = temperatureData[temperatureData.length - 1];
          setLatestTemp(latest.temperature);
          setLatestHumidity(latest.humidity);
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  const filterData = (data, range) => {
    const now = new Date();
    let filtered = [];

    switch (range) {
      case '1H':
        filtered = data.filter(d => now - d.timestamp <= 3600000); // Last 1 hour
        break;
      case '12H':
        filtered = data.filter(d => now - d.timestamp <= 43200000); // Last 12 hours
        break;
      case '1D':
        filtered = data.filter(d => now - d.timestamp <= 86400000); // Last 24 hours
        break;
      case '1W':
        filtered = data.filter(d => now - d.timestamp <= 604800000); // Last 1 week
        break;
      default:
        filtered = data;
    }

    setFilteredData(filtered);
  };

  const selectRange = (selectedRange) => {
    setRange(selectedRange);
    filterData(data, selectedRange);
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount

    const intervalId = setInterval(fetchData, 60000); // Fetch data every 60 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  const chartData = {
    labels: filteredData.map(d => d.timestamp),
    datasets: [
      {
        label: 'Temperature (°F)',
        data: filteredData.map(d => d.temperature),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.1,
        borderWidth: 0.5,
        pointRadius: 0,
        hitRadius: 0,
        pointHoverRadius: 0,
      },
      {
        label: 'Humidity (%)',
        data: filteredData.map(d => d.humidity),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
        tension: 0.1,
        borderWidth: 0.5,
        pointRadius: 0,
        hitRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Garage Temperature and Humidity',
      },
      tooltip: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          stepSize: 1,
          tooltipFormat: 'MMM dd, hh:mm a',
          displayFormats: {
            hour: 'h:mm a',
          },
        },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: false,
      },
    },
    elements: {
      line: {
        borderWidth: 0.5,
      },
    },
  };

  const getButtonClass = (buttonRange) => (
    `px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 
    ${range === buttonRange ? 'bg-gray-100  dark:bg-gray-500' : 'bg-white hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800'}
    focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 
    dark:border-gray-700 dark:text-white dark:hover:text-white 
    dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white`
  );

  return (
    <div className="container mx-auto">
      <div className="inline-flex justify-end rounded-md shadow-sm mt-14" role="group">
        <button
          type="button"
          className={`${getButtonClass('1H')} rounded-s-lg`}
          onClick={() => selectRange('1H')}
        >
          1H
        </button>
        <button
          type="button"
          className={getButtonClass('12H')}
          onClick={() => selectRange('12H')}
        >
          12H
        </button>
        <button
          type="button"
          className={getButtonClass('1D')}
          onClick={() => selectRange('1D')}
        >
          1D
        </button>
        <button
          type="button"
          className={`${getButtonClass('1W')} rounded-e-lg`}
          onClick={() => selectRange('1W')}
        >
          1W
        </button>
      </div>
      <div className='header mt-10 grid grid-cols-2 gap-4'>
        <div className='flex flex-col header-left'>
          <h1 className="text-2xl font-bold mb-4">
            {latestTemp}<span>°F</span>
          </h1>
        </div>
        <div className='flex flex-col header-right'>
          <h1 className="text-2xl font-bold mb-4">
            {latestHumidity}<span>%</span>
          </h1>
        </div>
      </div>

      <Line data={chartData} options={options} />
    </div>
  );
};

export default TemperatureGraph;
