import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import WeatherModal from '../components/WeatherModal';
import Pagination from '../components/Pagination';
import { fetchWeatherByCoords, fetchWeatherByCity, fetchCitiesByQuery } from '../utils/weatherUtils';
import { useAtom } from 'jotai';
import { unitsAtom, addVisitedCityAtom } from '../store/weatherStore';

export default function Home() {
  const [localWeather, setLocalWeather] = useState(null);
  const [displayedCities, setDisplayedCities] = useState([]);
  const [units, setUnits] = useAtom(unitsAtom);
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentResults, setCurrentResults] = useState([]);
  const [error, setError] = useState('');
  const itemsPerPage = 3;
  const [, addVisitedCity] = useAtom(addVisitedCityAtom);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (displayedCities.length > 0) {
      updatePagination();
    }
  }, [displayedCities, currentPage]);

  useEffect(() => {
    if (localWeather && units) {
      refreshWeather();
    }
  }, [units]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await fetchWeatherByCoords(
              position.coords.latitude,
              position.coords.longitude,
              units
            );
            setLocalWeather(data);
          } catch (error) {
            console.error('Error getting local weather:', error);
            setError('Could not fetch local weather. Please try again later.');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Could not get your location. Please allow location access or search for a city manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSearch = async (searchText) => {
    setError('');
    try {
      // First, get the main city weather
      const mainCityData = await fetchWeatherByCity(searchText, units);
      
      // Check if this city is already in our list
      if (!displayedCities.some(city => city.id === mainCityData.id)) {
        setDisplayedCities(prev => [...prev, mainCityData]);
      }
      
      // Then get additional cities with similar names
      const additionalCities = await fetchCitiesByQuery(searchText, 20, units);
      
      // Combine and filter out duplicates
      const allCities = [mainCityData, ...additionalCities];
      const uniqueCities = allCities.filter((city, index, self) => 
        index === self.findIndex(c => c.id === city.id)
      );
      
      setDisplayedCities(uniqueCities);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching for city:', error);
      setError('City not found. Please check the spelling and try again.');
    }
  };

  const handleUnitChange = (newUnits) => {
    setUnits(newUnits);
  };

  const refreshWeather = async () => {
    try {
      // Refresh local weather
      if (localWeather) {
        const updatedLocalWeather = await fetchWeatherByCoords(
          localWeather.coord.lat,
          localWeather.coord.lon,
          units
        );
        setLocalWeather(updatedLocalWeather);
      }
      
      // Refresh all displayed cities
      if (displayedCities.length > 0) {
        const updatedCities = await Promise.all(
          displayedCities.map(city => 
            fetchWeatherByCoords(city.coord.lat, city.coord.lon, units)
          )
        );
        setDisplayedCities(updatedCities);
      }
    } catch (error) {
      console.error('Error refreshing weather:', error);
      setError('Failed to refresh weather data. Please try again later.');
    }
  };

  const updatePagination = () => {
    setTotalPages(Math.ceil(displayedCities.length / itemsPerPage));
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentResults(displayedCities.slice(startIndex, endIndex));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDetailsClick = (data) => {
    addVisitedCity(data);
    window.location.href = `/city/${data.id}`;
  };

  return (
    <Layout title="Weather App - Home">
      <div className="text-center my-4">
        <h1>Weather App</h1>
        <p className="lead">Check the weather for your current location or search for a city</p>
      </div>

      <SearchBar 
        onSearch={handleSearch} 
        units={units} 
        onUnitChange={handleUnitChange} 
      />

      {error && <div className="alert alert-danger">{error}</div>}

      {localWeather && (
        <div id="current-location" className="mb-4">
          <h2>My Location</h2>
          <WeatherCard 
            data={localWeather} 
            isLocal={true} 
            units={units}
            onDetailsClick={handleDetailsClick}
          />
        </div>
      )}

      <div id="search-results" className="row g-4">
        {currentResults.map(city => (
          <div key={city.id} className="col-md-12">
            <WeatherCard 
              data={city} 
              units={units}
              onDetailsClick={handleDetailsClick}
            />
          </div>
        ))}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <WeatherModal 
        id="weatherModal" 
        data={selectedWeather}
        units={units}
      />
    </Layout>
  );
} 