import { CONFIG } from './config';

export const fetchWeatherByCoords = async (lat, lon, units = 'metric') => {
  try {
    const response = await fetch(
      `${CONFIG.WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${CONFIG.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather by coordinates:', error);
    throw error;
  }
};

export const fetchWeatherByCity = async (city, units = 'metric') => {
  try {
    const response = await fetch(
      `${CONFIG.WEATHER_API_URL}/weather?q=${city}&units=${units}&appid=${CONFIG.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    throw error;
  }
};

export const fetchWeatherById = async (id, units = 'metric') => {
  try {
    const response = await fetch(
      `${CONFIG.WEATHER_API_URL}/weather?id=${id}&units=${units}&appid=${CONFIG.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather by ID:', error);
    throw error;
  }
};

export const fetchCitiesByQuery = async (query, limit = 20, units = 'metric') => {
  try {
    const response = await fetch(
      `${CONFIG.WEATHER_API_URL}/find?q=${query}&units=${units}&appid=${CONFIG.API_KEY}&cnt=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.list || [];
  } catch (error) {
    console.error('Error fetching cities by query:', error);
    throw error;
  }
};

export const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}; 