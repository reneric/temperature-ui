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
          temperature: Math.round(parseFloat(d.temperature)) - 9,
          humidity: parseFloat(d.humidity)
        })).sort((a, b) => a.timestamp - b.timestamp);

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
    const now = Date.now();
    let filtered = [];

    switch (range) {
      case '1H':
        filtered = data.filter(d => now - d.timestamp <= 3600000);
        break;
      case '12H':
        filtered = data.filter(d => now - d.timestamp <= 43200000);
        break;
      case '1D':
        filtered = data.filter(d => now - d.timestamp <= 86400000);
        break;
      case '1W':
        filtered = data.filter(d => now - d.timestamp <= 604800000);
        break;
      default:
        filtered = data;
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

  const formatTemperature = (temp) => `${temp.toFixed(1)}°F`;
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
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '12H':
      case '1D':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1W':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  console.log("Rendering chart with data:", filteredData);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Garage Temperature and Humidity Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select onValueChange={handleRangeChange} defaultValue={range}>
              <SelectTrigger>
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
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <Thermometer className="mr-2" />
                  <div>
                    <p className="text-sm font-medium">Temperature</p>
                    <p className="text-2xl font-bold">{latestTemp ? formatTemperature(latestTemp) : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <Droplets className="mr-2" />
                  <div>
                    <p className="text-sm font-medium">Humidity</p>
                    <p className="text-2xl font-bold">{latestHumidity ? formatHumidity(latestHumidity) : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['auto', 'auto']}
                tickFormatter={(unixTime) => formatXAxisTick(unixTime, range)}
                ticks={generateTicks(filteredData, range)}
              />
              <YAxis
                yAxisId="temp"
                orientation="left"
                domain={getTemperatureDomain()}
                tickFormatter={(value) => `${value}°F`}
              />
              <YAxis
                yAxisId="humidity"
                orientation="right"
                domain={getHumidityDomain()}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value, name, props) => {
                  if (name === "Temperature") return [`${value.toFixed(1)}°F`, "Temperature"];
                  if (name === "Humidity") return [`${value.toFixed(1)}%`, "Humidity"];
                }}
              />
              <Legend />
              <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature" dot={false} />
              <Line yAxisId="humidity" type="monotone" dataKey="humidity" stroke="#82ca9d" name="Humidity" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
