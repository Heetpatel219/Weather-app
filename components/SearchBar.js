import React, { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../utils/config';
import { useRouter } from 'next/router';

const SearchBar = ({ units, onUnitChange }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' or 'id'
  const suggestionsRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchInput = async (e) => {
    const text = e.target.value;
    setSearchText(text);
    setError('');

    // If search type is ID, don't show suggestions
    if (searchType === 'id') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `${CONFIG.GEO_API_URL}/direct?q=${text}&limit=5&appid=${CONFIG.API_KEY}`
      );
      const cities = await response.json();
      
      if (cities.length > 0) {
        setSuggestions(cities);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    setSearchText(`${city.name}, ${city.country}`);
    setShowSuggestions(false);
    
    // Use dynamic routing to navigate to the city page
    router.push(`/weather/${city.name},${city.country}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchText.trim()) {
      setError('Please enter a city name or ID');
      return;
    }
    
    if (searchType === 'id') {
      // Check if ID is a number
      if (!/^\d+$/.test(searchText.trim())) {
        setError('City ID must be a number');
        return;
      }
      
      // Navigate to city ID page
      router.push(`/city/${searchText.trim()}`);
    } else {
      // Clean up the city name input (handle spaces, commas, etc.)
      const cleanedInput = searchText.trim().replace(/\s+,\s+/g, ',');
      
      // Navigate to city name page
      router.push(`/weather/${cleanedInput}`);
    }
  };

  return (
    <div className="search-section mb-4">
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-12">
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="searchType"
                id="searchByName"
                checked={searchType === 'name'}
                onChange={() => setSearchType('name')}
              />
              <label className="btn btn-outline-primary" htmlFor="searchByName">
                Search by City Name
              </label>
              
              <input
                type="radio"
                className="btn-check"
                name="searchType"
                id="searchById"
                checked={searchType === 'id'}
                onChange={() => setSearchType('id')}
              />
              <label className="btn btn-outline-primary" htmlFor="searchById">
                Search by City ID
              </label>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-8">
            <div className="input-group">
              <input
                type="text"
                id="city-search"
                className="form-control"
                placeholder={searchType === 'name' ? "Enter city name (e.g., London, GB)" : "Enter city ID"}
                value={searchText}
                onChange={handleSearchInput}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
              />
              <button type="submit" className="btn btn-primary">Search</button>
              
              {showSuggestions && suggestions.length > 0 && searchType === 'name' && (
                <div 
                  id="suggestions" 
                  className="dropdown-menu show w-100" 
                  ref={suggestionsRef}
                >
                  {suggestions.map((city, index) => (
                    <div 
                      key={`${city.name}-${city.country}-${index}`}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(city)}
                    >
                      <span>{city.name}, {city.country}</span>
                      {city.state && <span className="text-muted">({city.state})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && <div id="error-message" className="text-danger mt-2">{error}</div>}
          </div>
          <div className="col-md-4">
            <select 
              id="unit-select" 
              className="form-select"
              value={units}
              onChange={(e) => onUnitChange(e.target.value)}
            >
              <option value="metric">Celsius</option>
              <option value="imperial">Fahrenheit</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar; 