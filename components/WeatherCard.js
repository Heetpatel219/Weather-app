import React from 'react';
import Image from 'next/image';

const WeatherCard = ({ data, isLocal = false, units, onDetailsClick }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="weather-card mb-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h3>{data.name}, {data.sys.country}</h3>
          <p className="mb-0">{Math.round(data.main.temp)}°{units === 'metric' ? 'C' : 'F'}</p>
          <p className="text-muted">{data.weather[0].description}</p>
        </div>
        <div className="text-center">
          <img 
            src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
            alt={data.weather[0].description}
            className="weather-icon"
            width={64}
            height={64}
          />
        </div>
      </div>
      
      <div className="row mt-3">
        <div className="col-6">
          <p><strong>Feels like:</strong> {Math.round(data.main.feels_like)}°{units === 'metric' ? 'C' : 'F'}</p>
          <p><strong>Humidity:</strong> {data.main.humidity}%</p>
        </div>
        <div className="col-6">
          <p><strong>Wind:</strong> {Math.round(data.wind.speed)} {units === 'metric' ? 'm/s' : 'mph'}</p>
          <p><strong>Pressure:</strong> {data.main.pressure} hPa</p>
        </div>
      </div>
      
      <div className="d-flex justify-content-between mt-2">
        <div>
          <p className="mb-0"><strong>Sunrise:</strong> {formatTime(data.sys.sunrise)}</p>
          <p className="mb-0"><strong>Sunset:</strong> {formatTime(data.sys.sunset)}</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => onDetailsClick(data)}
        >
          More Details
        </button>
      </div>
    </div>
  );
};

export default WeatherCard; 