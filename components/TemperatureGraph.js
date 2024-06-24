"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Thermometer, Droplets } from 'lucide-react';

const Dashboard = () => {
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
          timestamp: new Date(d.timestamp).getTime(),
          temperature: parseFloat(d.temperature) - 9,
          humidity: parseFloat(d.humidity)
        })).sort((a, b) => a.timestamp - b.timestamp);

        setData(temperatureData);
        filterData(temperatureData, range);

        if (temperatureData.length > 0) {
          const latest = temperatureData[temperatureData.length - 1];
          setLatestTemp(Math.round(parseInt(latest.temperature)));
          setLatestHumidity(latest.humidity);
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  const filterData = (data, range) => {
    const now = Date.now();
    let filtered = [];
    let startTime;

    switch (range) {
      case '1H':
        startTime = now - 3600000;
        break;
      case '12H':
        startTime = now - 43200000;
        break;
      case '1D':
        startTime = now - 86400000;
        break;
      case '1W':
        startTime = now - 604800000;
        break;
      default:
        startTime = now - 43200000; // Default to 12H
    }

    // Ensure we have a data point at the start of the range
    const firstDataPoint = data.find(d => d.timestamp >= startTime);
    if (firstDataPoint) {
      filtered.push({ ...firstDataPoint, timestamp: startTime });
    }

    // Filter the rest of the data
    filtered = filtered.concat(data.filter(d => d.timestamp >= startTime && d.timestamp <= now));

    // Ensure we have a data point at the end of the range
    const lastDataPoint = data[data.length - 1];
    if (lastDataPoint && lastDataPoint.timestamp < now) {
      filtered.push({ ...lastDataPoint, timestamp: now });
    }

    console.log(`Filtered data for ${range}:`, filtered.length, "points");
    setFilteredData(filtered);
  };

  const handleRangeChange = (selectedRange) => {
    setRange(selectedRange);
    filterData(data, selectedRange);
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const formatTemperature = (temp) => `${temp.toFixed(0)}°F`;
  const formatHumidity = (humidity) => `${humidity.toFixed(1)}%`;

  const generateTicks = (data, range) => {
    if (data.length === 0) return [];
    const start = new Date(data[0].timestamp);
    const end = new Date(data[data.length - 1].timestamp);
    const ticks = [];
    let interval;

    switch (range) {
      case '1H':
        interval = 10 * 60 * 1000; // 10 minutes
        start.setMinutes(Math.floor(start.getMinutes() / 10) * 10, 0, 0);
        break;
      case '12H':
        interval = 60 * 60 * 1000; // 1 hour
        start.setMinutes(0, 0, 0);
        break;
      case '1D':
        interval = 2 * 60 * 60 * 1000; // 2 hours
        start.setMinutes(0, 0, 0);
        break;
      case '1W':
        interval = 24 * 60 * 60 * 1000; // 1 day
        start.setHours(0, 0, 0, 0);
        break;
      default:
        interval = 60 * 60 * 1000; // 1 hour
        start.setMinutes(0, 0, 0);
    }

    for (let d = start.getTime(); d <= end.getTime(); d += interval) {
      ticks.push(d);
    }
    return ticks;
  };

  const getTemperatureDomain = () => {
    if (filteredData.length === 0) return [0, 100];
    const temps = filteredData.map(d => d.temperature);
    const min = Math.floor(Math.min(...temps));
    const max = Math.ceil(Math.max(...temps));
    return [min - 5, max + 5];
  };

  const getHumidityDomain = () => {
    if (filteredData.length === 0) return [0, 100];
    const humidities = filteredData.map(d => d.humidity);
    const min = Math.floor(Math.min(...humidities));
    const max = Math.ceil(Math.max(...humidities));
    return [min - 5, max + 5];
  };

  const formatXAxisTick = (unixTime, range) => {
    const date = new Date(unixTime);
    switch (range) {
      case '1H':
        return date.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit' });
      case '12H':
      case '1D':
        return date.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit' });
      case '1W':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  console.log("Rendering chart with data:", filteredData);
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      const formattedTime = date.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });

      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#333',
          border: '1px solid #666',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <p style={{ color: '#fff', marginBottom: '2px', fontWeight: 'bold' }}>{formattedDate}</p>
          <p style={{ color: '#fff', marginBottom: '8px' }}>{formattedTime}</p>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <Thermometer size={16} style={{ color: '#8884d8', marginRight: '8px' }} />
            <span style={{ color: '#8884d8' }}>{payload[0].value.toFixed(0)}°F</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Droplets size={16} style={{ color: '#82ca9d', marginRight: '8px' }} />
            <span style={{ color: '#82ca9d' }}>{payload[1].value.toFixed(0)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };
  return (

    <Card className='pt-0 pl-0 pr-0 pb-4 border-gray-900'>
      {/* <CardHeader>
        <CardTitle className="text-2xl font-bold">Garage Temperature and Humidity Dashboard</CardTitle>
      </CardHeader> */}
      <CardContent className='p-0'>
        <div className="mb-4 pt-8 pl-4 pr-4 bg-gray-900">
          <Select onValueChange={handleRangeChange} defaultValue={range} className="bg-gray-900">
            <SelectTrigger className="bg-gray-900 text-white border-gray-600">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1H">Last 1 hour</SelectItem>
              <SelectItem value="12H">Last 12 hours</SelectItem>
              <SelectItem value="1D">Last 24 hours</SelectItem>
              <SelectItem value="1W">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 p-4">
          <Card className="border-gray-600">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Thermometer className="mr-2 " style={{ color: '#8884d8' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#8884d8' }}>Temperature</p>
                  <p className="text-2xl font-bold text-white">{latestTemp ? formatTemperature(latestTemp) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-600">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Droplets className="mr-2" style={{ color: '#82ca9d' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#82ca9d' }}>Humidity</p>
                  <p className="text-2xl font-bold text-white">{latestHumidity ? formatHumidity(latestHumidity) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredData} margin={{ top: 5, right: -20, left: -20, bottom: 5 }}>
            <CartesianGrid stroke="#666" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(unixTime) => formatXAxisTick(unixTime, range)}
              ticks={generateTicks(filteredData, range)}
              tick={{ fontSize: 10, fill: "#fff" }}
              axisLine={{ stroke: '#666' }}
            />
            <YAxis
              yAxisId="temp"
              orientation="left"
              domain={getTemperatureDomain()}
              tick={{ fontSize: 10, fill: "#fff" }}
              tickFormatter={(value) => `${value}°F`}
              axisLine={{ stroke: '#666' }}
            />
            <YAxis
              yAxisId="humidity"
              orientation="right"
              domain={getHumidityDomain()}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 10, fill: "#fff" }}
              axisLine={{ stroke: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature" dot={false} />
            <Line yAxisId="humidity" type="monotone" dataKey="humidity" stroke="#82ca9d" name="Humidity" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card >

  );
};

export default Dashboard;
