import React from 'react';
import Layout from '../components/Layout';
import { useAtom } from 'jotai';
import { visitedCitiesAtom, unitsAtom } from '../store/weatherStore';
import Link from 'next/link';

export default function VisitedCities() {
  const [visitedCities] = useAtom(visitedCitiesAtom);
  const [units] = useAtom(unitsAtom);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title="Visited Cities">
      <div className="mb-4">
        <h1>Visited Cities</h1>
      </div>

      {visitedCities.length === 0 ? (
        <div className="alert alert-info">
          You haven't visited any cities yet. Search for a city to add it to your visited list.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>City</th>
                <th>Country</th>
                <th>Flag</th>
                <th>Weather</th>
                <th>Temperature</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitedCities.map(city => (
                <tr key={city.id}>
                  <td>{city.name}</td>
                  <td>{city.sys.country}</td>
                  <td>
                    <img 
                      src={`http://openweathermap.org/images/flags/${city.sys.country.toLowerCase()}.png`}
                      alt={`${city.sys.country} flag`}
                      width={24}
                      height={18}
                    />
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={`https://openweathermap.org/img/wn/${city.weather[0].icon}.png`}
                        alt={city.weather[0].description}
                        width={30}
                        height={30}
                      />
                      <span className="ms-2">{city.weather[0].description}</span>
                    </div>
                  </td>
                  <td>{Math.round(city.main.temp)}°{units === 'metric' ? 'C' : 'F'}</td>
                  <td>{new Date(city.dt * 1000).toLocaleString()}</td>
                  <td>
                    <Link href={`/city/${city.id}`} className="btn btn-sm btn-primary">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
} 