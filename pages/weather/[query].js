import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import WeatherCard from '../../components/WeatherCard';
import Pagination from '../../components/Pagination';
import { fetchWeatherByCity, fetchCitiesByQuery } from '../../utils/weatherUtils';
import { useAtom } from 'jotai';
import { unitsAtom } from '../../store/weatherStore';

export default function CityWeather() {
  const router = useRouter();
  const { query } = router.query;
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [units] = useAtom(unitsAtom);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentResults, setCurrentResults] = useState([]);
  const itemsPerPage = 3;

  useEffect(() => {
    if (query) {
      searchCity(query);
    }
  }, [query, units]);

  useEffect(() => {
    if (cities.length > 0) {
      updatePagination();
    }
  }, [cities, currentPage]);

  const searchCity = async (cityQuery) => {
    setLoading(true);
    setError('');
    try {
      // First, get the main city weather
      const mainCityData = await fetchWeatherByCity(cityQuery, units);
      
      // Then get additional cities with similar names
      const additionalCities = await fetchCitiesByQuery(cityQuery, 20, units);
      
      // Combine and filter out duplicates
      const allCities = [mainCityData, ...additionalCities];
      const uniqueCities = allCities.filter((city, index, self) => 
        index === self.findIndex(c => c.id === city.id)
      );
      
      setCities(uniqueCities);
      setCurrentPage(1);
      setLoading(false);
    } catch (error) {
      console.error('Error searching for city:', error);
      setError('City not found. Please check the spelling and try again.');
      setCities([]);
      setLoading(false);
    }
  };

  const updatePagination = () => {
    setTotalPages(Math.ceil(cities.length / itemsPerPage));
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentResults(cities.slice(startIndex, endIndex));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDetailsClick = (data) => {
    router.push(`/city/${data.id}`);
  };

  const handleUnitChange = (newUnits) => {
    // This function is no longer used in the new implementation
  };

  return (
    <Layout title={`Weather for ${query || 'City'}`}>
      <div className="mb-4">
        <h1>Weather for "{query}"</h1>
      </div>

      {loading && <div className="text-center"><div className="spinner-border"></div></div>}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!loading && cities.length === 0 && !error && (
        <div className="alert alert-info">No cities found matching "{query}"</div>
      )}

      <div id="search-results" className="row g-4">
        {currentResults.map(city => (
          <div key={city.id} className="col-md-12">
            <WeatherCard 
              data={city} 
              units={units}
            />
          </div>
        ))}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Layout>
  );
}