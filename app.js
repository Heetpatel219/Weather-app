class WeatherApp {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.getCurrentLocation();
        this.displayedCities = []; 
        this.weatherCache = new Map();
        this.currentPage = 1;
        this.itemsPerPage = 3;
        this.currentResults = [];
        this.totalPages = 0;
    }

    initializeElements() {
        this.citySearch = document.getElementById('city-search');
        this.suggestions = document.getElementById('suggestions');
        this.unitSelect = document.getElementById('unit-select');
        this.searchResults = document.getElementById('search-results');
        this.localWeather = document.getElementById('local-weather');
        this.errorMessage = document.getElementById('error-message');
        this.pagination = document.getElementById('pagination');
        this.weatherModal = new bootstrap.Modal(document.getElementById('weatherModal'));
        this.modalContent = document.getElementById('modal-content');
    }

    setupEventListeners() {
        this.citySearch.addEventListener('input', this.debounce(this.handleSearchInput.bind(this), 300));
        this.unitSelect.addEventListener('change', this.handleUnitChange.bind(this));
        
        document.addEventListener('click', (e) => {
            if (!this.citySearch.contains(e.target) && !this.suggestions.contains(e.target)) {
                this.suggestions.classList.remove('show');
            }
        });

        this.citySearch.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.suggestions.classList.remove('show');
            }
            if (e.key === 'Enter' && !this.suggestions.classList.contains('show')) {
                e.preventDefault();
                this.handleSearch(e.target.value);
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async handleSearchInput(e) {
        const searchText = e.target.value.trim();
        
        if (searchText.length < 2) {
            this.suggestions.classList.remove('show');
            return;
        }

        try {
            const response = await fetch(
                `${CONFIG.GEO_API_URL}/direct?q=${searchText}&limit=5&appid=${CONFIG.API_KEY}`
            );
            const cities = await response.json();
            
            if (cities.length > 0 && document.activeElement === this.citySearch) {
                this.displaySuggestions(cities);
            } else {
                this.suggestions.classList.remove('show');
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            this.suggestions.classList.remove('show');
        }
    }

    async handleSearch(searchText) {
        try {
            const response = await fetch(
                `${CONFIG.WEATHER_API_URL}/weather?q=${searchText}&units=${this.unitSelect.value}&appid=${CONFIG.API_KEY}`
            );
            const data = await response.json();
            
            if (response.ok) {
                if (!this.displayedCities.some(city => city.id === data.id)) {
                    this.displayedCities.push(data);
                }
                
                const additionalResponse = await fetch(
                    `${CONFIG.WEATHER_API_URL}/find?q=${searchText}&units=${this.unitSelect.value}&appid=${CONFIG.API_KEY}&cnt=20`
                );
                const additionalData = await additionalResponse.json();

                if (additionalResponse.ok) {
                    additionalData.list.forEach(city => {
                        if (!this.displayedCities.some(existingCity => existingCity.id === city.id)) {
                            this.displayedCities.push(city);
                        }
                    });
                }

                this.errorMessage.textContent = '';
                this.currentPage = 1;
                this.displayAllCities();
            } else {
                this.errorMessage.textContent = 'City not found. Please try again.';
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.errorMessage.textContent = 'Error fetching weather data. Please try again.';
        }
    }

    displaySuggestions(cities) {
        this.suggestions.innerHTML = '';
        
        cities.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <img src="https://flagcdn.com/24x18/${city.country.toLowerCase()}.png" 
                     alt="${city.country} flag" 
                     class="country-flag">
                <span>
                    ${city.name}
                    ${city.state ? `, ${city.state}` : ''}
                    , ${city.country}
                </span>
            `;
            div.addEventListener('click', () => {
                this.citySearch.value = `${city.name}, ${city.state ? `${city.state}, ` : ''}${city.country}`;
                this.suggestions.classList.remove('show');
                this.handleSearch(this.citySearch.value);
            });
            this.suggestions.appendChild(div);
        });

        this.suggestions.classList.add('show');
    }

    async handleUnitChange() {
        // Update the weather for the current location if available
        if (this.lastSearchedCoords) {
            await this.getWeather(
                this.lastSearchedCoords.lat, 
                this.lastSearchedCoords.lon
            );
        }

        // Update the weather for all displayed cities
        for (const city of this.displayedCities) {
            await this.getWeather(city.coord.lat, city.coord.lon);
        }

        // Re-render the displayed cities with the new units
        this.displayAllCities();
    }

    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    await this.getWeather(
                        position.coords.latitude,
                        position.coords.longitude,
                        true
                    );
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    }

    async getWeather(lat, lon, isLocal = false) {
        const cacheKey = `${lat},${lon},${this.unitSelect.value}`;
        
        if (this.weatherCache.has(cacheKey)) {
            const data = this.weatherCache.get(cacheKey);
            this.displayWeather(data, isLocal);
            return;
        }

        try {
            const response = await fetch(
                `${CONFIG.WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&units=${this.unitSelect.value}&appid=${CONFIG.API_KEY}`
            );
            const data = await response.json();

            this.weatherCache.set(cacheKey, data);
            this.displayWeather(data, isLocal);
            this.lastSearchedCoords = { lat, lon };
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.errorMessage.textContent = 'Error fetching weather data';
        }
    }

    displayWeather(data, isLocal = false) {
        this.currentTimezone = data.timezone;
        const weatherHtml = this.createWeatherCard(data);
        if (isLocal) {
            this.localWeather.innerHTML = weatherHtml;
        } else {
            this.searchResults.innerHTML = weatherHtml;
        }
    }

    displayAllCities() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedCities = this.displayedCities.slice(startIndex, endIndex);
        
        this.searchResults.innerHTML = `
            <div class="row g-4">
                ${paginatedCities.map(data => `
                    <div class="col-md-4">
                        ${this.createWeatherCard(data)}
                    </div>
                `).join('')}
            </div>
        `;
        
        this.totalPages = Math.ceil(this.displayedCities.length / this.itemsPerPage);
        this.updatePagination();
    }

    createWeatherCard(data) {
        const unit = this.unitSelect.value === 'metric' ? '°C' : '°F';
        const randomColor = this.getPastalColor();

        return `
            <div class="weather-card" style="background-color: ${randomColor};">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <h3 class="mb-0">${data.name}</h3>
                    <img src="https://flagcdn.com/24x18/${data.sys.country.toLowerCase()}.png" 
                         alt="${data.sys.country} flag">
                </div>
                <div class="text-center">
                    <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
                         alt="${data.weather[0].description}"
                         class="weather-icon">
                    <h2>${Math.round(data.main.temp)}${unit}</h2>
                    <p class="text-capitalize">${data.weather[0].description}</p>
                    <p>Coordinates: <a href="https://www.google.com/maps?q=${data.coord.lat},${data.coord.lon}" target="_blank">${data.coord.lat}, ${data.coord.lon}</a></p>
                </div>
                <div class="row g-2 mt-3">
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Wind Speed</div>
                            <div class="fw-bold">${data.wind.speed} ${unit === '°C' ? 'm/s' : 'mph'}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Humidity</div>
                            <div class="fw-bold">${data.main.humidity}%</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Pressure</div>
                            <div class="fw-bold">${data.main.pressure} hPa</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Feels Like</div>
                            <div class="fw-bold">${Math.round(data.main.feels_like)}${unit}</div>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-3">
                    <button class="btn btn-primary" onclick='app.showWeatherDetails(${JSON.stringify(data).replace(/'/g, "&#39;")})'>
                        More Details
                    </button>
                </div>
            </div>
        `;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        const timezoneOffset = this.currentTimezone * 1000;
        const adjustedDate = new Date(date.getTime() + timezoneOffset);
        const hours = adjustedDate.getUTCHours();
        const minutes = adjustedDate.getUTCMinutes();
        const displayHours = hours.toString().padStart(2, '0');
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes}`;
    }

    showWeatherDetails(data) {
        const unit = this.unitSelect.value === 'metric' ? '°C' : '°F';
        const speedUnit = this.unitSelect.value === 'metric' ? 'm/s' : 'mph';
        
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <div class="modal-body">
                <div class="row g-3">
                    <div class="col-12">
                        <div class="weather-details">
                            <div class="text-muted">Temperature</div>
                            <div class="fw-bold">
                                Current: ${Math.round(data.main.temp)}${unit}
                                (Min: ${Math.round(data.main.temp_min)}${unit} / 
                                 Max: ${Math.round(data.main.temp_max)}${unit})
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Wind Speed</div>
                            <div class="fw-bold">${data.wind.speed} ${speedUnit}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Humidity</div>
                            <div class="fw-bold">${data.main.humidity}%</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Pressure</div>
                            <div class="fw-bold">${data.main.pressure} hPa</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Feels Like</div>
                            <div class="fw-bold">${Math.round(data.main.feels_like)}${unit}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Sunrise</div>
                            <div class="fw-bold">${this.formatTime(data.sys.sunrise)}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="weather-details">
                            <div class="text-muted">Sunset</div>
                            <div class="fw-bold">${this.formatTime(data.sys.sunset)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('weatherModal'));
        modal.show();
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= this.totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${this.currentPage === i ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = i;
                this.displayAllCities();
            });
            pagination.appendChild(li);
        }
    }

    getPastalColor() {
        const colors = [ "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF","#E6E6FA", "#FFD1DC", "#C1E1C1", "#F4C2C2", "#B5EAD7","#C7CEEA", "#D5AAFF", "#FFDAC1", "#F7C6C7", "#D0F0C0","#F3E5AB", "#B4A7D6", "#AEC6CF", "#FFCBDB", "#FFABAB","#FFC3A0", "#D9A7C7", "#FEC8D8", "#D4A5A5", "#B2B2FF"];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new WeatherApp();
});