import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCityData, get5DaysForecast } from "./WheatherSlice";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { appId } from "../config/config";
import { Line, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

// Import your weather images
import sunnyImage from '../images/sunny.jpeg';
import rainyImage from '../images/rain.jpeg';

const WeatherComponent = ({ theme }) => {
  const dispatch = useDispatch();
  const [city, setCity] = useState("");
  const [unit, setUnit] = useState("metric");
  const [viewType, setViewType] = useState("forecast");
  const { citySearchData, citySearchLoading, forecastData, forecastLoading, forecastError } = useSelector(
    (state) => state.weather
  );

  useEffect(() => {
    dispatch(getCityData({ city, unit }));
  }, [dispatch, city, unit]);

  useEffect(() => {
    if (citySearchData?.coord) {
      const { lat, lon } = citySearchData.coord;
      dispatch(get5DaysForecast({ lat, lon, unit }));
    }
  }, [citySearchData, dispatch, unit]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  const handleViewTypeChange = (e) => {
    setViewType(e.target.value);
  };

  const getCityNameFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`);
      const data = await response.json();
      return data.name;
    } catch (error) {
      console.error("Error fetching city name:", error);
      return null;
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await getCityNameFromCoords(latitude, longitude);
        if (cityName) {
          setCity(cityName);
          dispatch(getCityData({ city: cityName, unit }));
        }
      }, (error) => {
        console.error("Geolocation error:", error);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const getDailyForecast = (list) => {
    if (!list) return [];

    const dailyForecast = {};
    list.forEach(item => {
      const date = new Date(item.dt_txt).toDateString();
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          temp: 0,
          count: 0,
          weather: item.weather[0].description,
        };
      }
      dailyForecast[date].temp += item.main.temp;
      dailyForecast[date].count += 1;
    });

    // Convert to array and limit to 6 days
    return Object.keys(dailyForecast).slice(0, 6).map(date => ({
      date,
      temp: (dailyForecast[date].temp / dailyForecast[date].count).toFixed(1),
      weather: dailyForecast[date].weather,
    }));
  };

  const weatherCondition = citySearchData?.weather[0]?.main;

  // Prepare data for the temperature chart
  const forecastChartData = {
    labels: forecastData?.list?.slice(0, 6).map(item => new Date(item.dt_txt).toDateString()) || [],
    datasets: [
      {
        label: 'Temperature',
        data: forecastData?.list?.slice(0, 6).map(item => item.main.temp) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  // Prepare data for the humidity chart
  const humidityChartData = {
    labels: forecastData?.list?.slice(0, 6).map(item => new Date(item.dt_txt).toDateString()) || [],
    datasets: [
      {
        label: 'Humidity',
        data: forecastData?.list?.slice(0, 6).map(item => item.main.humidity) || [],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  };

  // Prepare data for the wind speed chart
  const windSpeedChartData = {
    labels: forecastData?.list?.slice(0, 6).map(item => new Date(item.dt_txt).toDateString()) || [],
    datasets: [
      {
        label: 'Wind Speed',
        data: forecastData?.list?.slice(0, 6).map(item => item.wind.speed) || [],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: true,
      },
    ],
  };

  // Prepare data for the weather condition pie chart
  const weatherConditionCounts = forecastData?.list?.reduce((acc, item) => {
    const condition = item.weather[0]?.main;
    if (condition) {
      acc[condition] = (acc[condition] || 0) + 1;
    }
    return acc;
  }, {});

  const weatherConditionData = {
    labels: weatherConditionCounts ? Object.keys(weatherConditionCounts) : [],
    datasets: [
      {
        data: weatherConditionCounts ? Object.values(weatherConditionCounts) : [],
        backgroundColor: [
          'rgba(255, 205, 86, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 205, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mt-4 weather-container shadow shadow-lg">
      <div className="d-flex justify-content-between mb-4">
        {/* Removed theme toggle button */}
      </div>

      {/* City Search Section */}
      <div className="row mb-4 justify-content-center">
        <div className="col-md-8">
          <div className="d-flex align-items-center mb-3">
            <div className="input-group me-2">
              <input
                type="text"
                className="form-control"
                placeholder="Enter the city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="City Name"
              />
              <div className="input-group-append">
                <button className="btn btn-primary" onClick={() => dispatch(getCityData({ city, unit }))}>
                  Search
                </button>
              </div>
            </div>
            <button className="btn btn-info ms-2" onClick={handleCurrentLocation} aria-label="Use Current Location">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span className="d-none d-md-inline ms-2">Use Current Location</span>
            </button>
          </div>

          <div className="mb-3">
            <label htmlFor="unit-select">Select Unit: </label>
            <select id="unit-select" className="form-select" onChange={handleUnitChange} value={unit}>
              <option value="metric">Celsius (°C)</option>
              <option value="imperial">Fahrenheit (°F)</option>
            </select>
          </div>

          {/* Dropdown to switch between graph and forecast views */}
          <div className="mb-3">
            <label htmlFor="view-select">View Type: </label>
            <select id="view-select" className="form-select" onChange={handleViewTypeChange} value={viewType}>
              <option value="forecast">Forecast</option>
              <option value="graph">Temperature Graph</option>
              <option value="humidity">Humidity Graph</option>
              <option value="windSpeed">Wind Speed Graph</option>
              <option value="conditions">Weather Conditions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {citySearchLoading && <div className="text-center spinner"></div>}

      {/* Background Image based on Weather Condition */}
      {citySearchData && citySearchData.main && (
        <div
          className="weather-background"
          style={{
            backgroundImage: `url(${weatherCondition === 'Rain' ? rainyImage : sunnyImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '300px', // Adjust the height as needed
            borderRadius: '8px',
          }}
        >
          <div className="weather-info text-center text-white">
            <h1>{citySearchData.name}</h1>
            <h2>{Math.round(citySearchData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}</h2>
            <p>{citySearchData.weather[0].description}</p>
            <p>Humidity: {citySearchData.main.humidity}%</p>
            <p>Wind Speed: {citySearchData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
          </div>
        </div>
      )}

      {/* Display Weather Data */}
      {forecastError && <div className="alert alert-danger">Error fetching forecast data.</div>}

      {forecastData && (
        <div>
          {viewType === "forecast" && (
            <div className="forecast-details">
              <h3>6-Day Forecast</h3>
              {getDailyForecast(forecastData.list).map((day, index) => (
                <div key={index} className="forecast-day">
                  <h4>{day.date}</h4>
                  <p>Temperature: {day.temp}°{unit === 'metric' ? 'C' : 'F'}</p>
                  <p>Weather: {day.weather}</p>
                </div>
              ))}
            </div>
          )}

          {viewType === "graph" && (
            <div className="forecast-chart">
              <Line data={forecastChartData} />
            </div>
          )}

          {viewType === "humidity" && (
            <div className="forecast-chart">
              <Line data={humidityChartData} />
            </div>
          )}

          {viewType === "windSpeed" && (
            <div className="forecast-chart">
              <Line data={windSpeedChartData} />
            </div>
          )}

          {viewType === "conditions" && (
            <div className="forecast-chart">
              <Pie data={weatherConditionData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherComponent;
