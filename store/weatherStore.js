import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Use atomWithStorage for client-side persistence
export const visitedCitiesAtom = atomWithStorage('visitedCities', []);

// Atom for current units (metric/imperial)
export const unitsAtom = atom('metric');

// Derived atom for getting a city by ID
export const getCityByIdAtom = atom(
  (get) => (id) => {
    const cities = get(visitedCitiesAtom);
    return cities.find(city => city.id === parseInt(id));
  }
);

// Action atom for adding a visited city
export const addVisitedCityAtom = atom(
  null,
  (get, set, cityData) => {
    const cities = get(visitedCitiesAtom);
    
    // Check if city already exists
    const existingIndex = cities.findIndex(city => city.id === cityData.id);
    
    let newCities;
    if (existingIndex >= 0) {
      // Update existing city with new data
      newCities = [
        ...cities.slice(0, existingIndex),
        cityData,
        ...cities.slice(existingIndex + 1)
      ];
    } else {
      // Add new city to the beginning, limit to 10 cities
      newCities = [cityData, ...cities];
      if (newCities.length > 10) {
        newCities = newCities.slice(0, 10);
      }
    }
    
    // Update atom
    set(visitedCitiesAtom, newCities);
  }
); 