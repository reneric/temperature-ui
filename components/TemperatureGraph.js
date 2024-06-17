// components/TemperatureGraph.js

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

  useEffect(() => {
    axios.get('http://192.168.86.7:8000/temperature')
      .then(response => {
        const temperatureData = response.data.map(d => ({
          ...d,
          timestamp: new Date(d.timestamp)
        }));
        setData(temperatureData);

        if (temperatureData.length > 0) {
          const latest = temperatureData[temperatureData.length - 1];
          setLatestTemp(latest.temperature);
          setLatestHumidity(latest.humidity);
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const chartData = {
    labels: data.map(d => d.timestamp),
    datasets: [
      {
        label: 'Temperature (°F)',
        data: data.map(d => d.temperature),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.1,
        borderWidth: 1,
        pointRadius: 0,
        hitRadius: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
      {
        label: 'Humidity (%)',
        data: data.map(d => d.humidity),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
        tension: 0.1,
        borderWidth: 1,
        pointRadius: 0,
        hitRadius: 0,
        pointRadius: 0,
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

  return (
    <div className="container mx-auto">
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
