import React, { createContext, useContext, useState, useEffect } from 'react';

const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  // Initialize visited cities from localStorage if available
  const [visitedCities, setVisitedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load visited cities from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCities = localStorage.getItem('visitedCities');
      if (storedCities) {
        setVisitedCities(JSON.parse(storedCities));
      }
      setLoading(false);
    }
  }, []);
  
  // Update localStorage when visitedCities changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      localStorage.setItem('visitedCities', JSON.stringify(visitedCities));
    }
  }, [visitedCities, loading]);
  
  // Add a city to visited cities (with caching)
  const addVisitedCity = (cityData) => {
    setVisitedCities(prev => {
      // Check if city already exists in the list
      const exists = prev.some(city => city.id === cityData.id);
      if (exists) {
        // Move to the top of the list if it exists
        return [
          cityData,
          ...prev.filter(city => city.id !== cityData.id)
        ];
      }
      
      // Add to the beginning of the list, limit to 10 cities
      const newList = [cityData, ...prev];
      if (newList.length > 10) {
        return newList.slice(0, 10);
      }
      return newList;
    });
  };
  
  // Get a city from cache by ID
  const getCityById = (id) => {
    return visitedCities.find(city => city.id === parseInt(id));
  };
  
  return (
    <WeatherContext.Provider value={{ 
      visitedCities, 
      addVisitedCity, 
      getCityById,
      loading
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  return useContext(WeatherContext);
} 