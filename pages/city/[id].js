import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { fetchWeatherById } from '../../utils/weatherUtils';
import { useAtom } from 'jotai';
import { unitsAtom, addVisitedCityAtom, getCityByIdAtom } from '../../store/weatherStore';

export default function CityDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [units] = useAtom(unitsAtom);
  const [, addVisitedCity] = useAtom(addVisitedCityAtom);
  const [getCityById] = useAtom(getCityByIdAtom);

  useEffect(() => {
    if (id) {
      fetchCityData();
    }
  }, [id, units]);

  const fetchCityData = async () => {
    setLoading(true);
    setError('');
    
    // First check if we have this city in our cache
    const cachedCity = getCityById(id);
    
    if (cachedCity && cachedCity.units === units) {
      setCityData(cachedCity);
      setLoading(false);
      return;
    }
    
    try {
      const data = await fetchWeatherById(id, units);
      data.units = units; // Store the units with the data for caching
      setCityData(data);
      addVisitedCity(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching city data:', error);
      setError('City not found. Please check the ID and try again.');
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title={cityData ? `Weather for ${cityData.name}` : 'City Detail'}>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h1>City Weather Details</h1>
      </div>

      {loading && <div className="text-center"><div className="spinner-border"></div></div>}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {cityData && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              {cityData.name}, {cityData.sys.country}
              <img 
                src={`http://openweathermap.org/images/flags/${cityData.sys.country.toLowerCase()}.png`}
                alt={`${cityData.sys.country} flag`}
                className="ms-2"
                width={24}
                height={18}
              />
            </h2>
            <span className="badge bg-info">ID: {cityData.id}</span>
          </div>
          
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <img 
                    src={`https://openweathermap.org/img/wn/${cityData.weather[0].icon}@2x.png`}
                    alt={cityData.weather[0].description}
                    width={80}
                    height={80}
                  />
                  <div>
                    <h3 className="mb-0">{Math.round(cityData.main.temp)}°{units === 'metric' ? 'C' : 'F'}</h3>
                    <p className="text-capitalize mb-0">{cityData.weather[0].description}</p>
                  </div>
                </div>
                
                <table className="table">
                  <tbody>
                    <tr>
                      <th>Feels like</th>
                      <td>{Math.round(cityData.main.feels_like)}°{units === 'metric' ? 'C' : 'F'}</td>
                    </tr>
                    <tr>
                      <th>Min Temperature</th>
                      <td>{Math.round(cityData.main.temp_min)}°{units === 'metric' ? 'C' : 'F'}</td>
                    </tr>
                    <tr>
                      <th>Max Temperature</th>
                      <td>{Math.round(cityData.main.temp_max)}°{units === 'metric' ? 'C' : 'F'}</td>
                    </tr>
                    <tr>
                      <th>Humidity</th>
                      <td>{cityData.main.humidity}%</td>
                    </tr>
                    <tr>
                      <th>Pressure</th>
                      <td>{cityData.main.pressure} hPa</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="col-md-6">
                <table className="table">
                  <tbody>
                    <tr>
                      <th>Wind Speed</th>
                      <td>{Math.round(cityData.wind.speed)} {units === 'metric' ? 'm/s' : 'mph'}</td>
                    </tr>
                    <tr>
                      <th>Wind Direction</th>
                      <td>{cityData.wind.deg}°</td>
                    </tr>
                    <tr>
                      <th>Cloudiness</th>
                      <td>{cityData.clouds.all}%</td>
                    </tr>
                    <tr>
                      <th>Sunrise</th>
                      <td>{formatTime(cityData.sys.sunrise)}</td>
                    </tr>
                    <tr>
                      <th>Sunset</th>
                      <td>{formatTime(cityData.sys.sunset)}</td>
                    </tr>
                    <tr>
                      <th>Last Updated</th>
                      <td>{new Date(cityData.dt * 1000).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
                
                {cityData.rain && (
                  <div className="weather-details mt-3">
                    <h5>Precipitation</h5>
                    <p><strong>Rain (1h):</strong> {cityData.rain['1h']} mm</p>
                    {cityData.rain['3h'] && <p><strong>Rain (3h):</strong> {cityData.rain['3h']} mm</p>}
                  </div>
                )}
                
                {cityData.snow && (
                  <div className="weather-details mt-3">
                    <h5>Snow</h5>
                    <p><strong>Snow (1h):</strong> {cityData.snow['1h']} mm</p>
                    {cityData.snow['3h'] && <p><strong>Snow (3h):</strong> {cityData.snow['3h']} mm</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="card-footer text-center">
            <button 
              className="btn btn-primary" 
              onClick={() => router.back()}
            >
              Back to Results
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
} 