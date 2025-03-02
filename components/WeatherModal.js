import React, { useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';

const WeatherModal = ({ id, data, units }) => {
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current && typeof window !== 'undefined') {
      bsModalRef.current = new Modal(modalRef.current);
    }
  }, []);

  useEffect(() => {
    if (data && bsModalRef.current) {
      bsModalRef.current.show();
    }
  }, [data]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!data) return null;

  return (
    <div className="modal fade" id={id} tabIndex="-1" ref={modalRef}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Weather Details for {data.name}, {data.sys.country}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="d-flex align-items-center mb-3">
              <img 
                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                alt={data.weather[0].description}
                width={64}
                height={64}
              />
              <div>
                <h4>{Math.round(data.main.temp)}°{units === 'metric' ? 'C' : 'F'}</h4>
                <p className="text-capitalize mb-0">{data.weather[0].description}</p>
              </div>
            </div>
            
            <div className="row">
              <div className="col-6">
                <p><strong>Feels like:</strong> {Math.round(data.main.feels_like)}°{units === 'metric' ? 'C' : 'F'}</p>
                <p><strong>Min Temp:</strong> {Math.round(data.main.temp_min)}°{units === 'metric' ? 'C' : 'F'}</p>
                <p><strong>Max Temp:</strong> {Math.round(data.main.temp_max)}°{units === 'metric' ? 'C' : 'F'}</p>
                <p><strong>Humidity:</strong> {data.main.humidity}%</p>
                <p><strong>Pressure:</strong> {data.main.pressure} hPa</p>
              </div>
              <div className="col-6">
                <p><strong>Wind Speed:</strong> {Math.round(data.wind.speed)} {units === 'metric' ? 'm/s' : 'mph'}</p>
                <p><strong>Wind Direction:</strong> {data.wind.deg}°</p>
                <p><strong>Cloudiness:</strong> {data.clouds.all}%</p>
                <p><strong>Sunrise:</strong> {formatTime(data.sys.sunrise)}</p>
                <p><strong>Sunset:</strong> {formatTime(data.sys.sunset)}</p>
              </div>
            </div>
            
            {data.rain && (
              <div className="weather-details mt-3">
                <h5>Precipitation</h5>
                <p><strong>Rain (1h):</strong> {data.rain['1h']} mm</p>
                {data.rain['3h'] && <p><strong>Rain (3h):</strong> {data.rain['3h']} mm</p>}
              </div>
            )}
            
            {data.snow && (
              <div className="weather-details mt-3">
                <h5>Snow</h5>
                <p><strong>Snow (1h):</strong> {data.snow['1h']} mm</p>
                {data.snow['3h'] && <p><strong>Snow (3h):</strong> {data.snow['3h']} mm</p>}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherModal; 