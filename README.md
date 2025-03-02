# Next.js Weather App

A weather application built with Next.js that allows users to check the weather for their current location and search for weather in other cities around the world.

## Features

- Display weather for user's current location
- Search for weather in any city worldwide
- Auto-suggestions for city search
- Toggle between Celsius and Fahrenheit
- Detailed weather information including temperature, humidity, wind speed, etc.
- Pagination for search results
- Responsive design

## Technologies Used

- Next.js
- React
- Bootstrap 5
- OpenWeatherMap API

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd weather-app-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your OpenWeatherMap API key:
   ```
   NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/pages` - Next.js pages
- `/components` - React components
- `/utils` - Utility functions and API helpers
- `/styles` - Global CSS styles
- `/public` - Static assets

## API Reference

This project uses the [OpenWeatherMap API](https://openweathermap.org/api) for weather data:

- Current Weather Data API
- Geocoding API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenWeatherMap](https://openweathermap.org/) for providing the weather data API
- [Next.js](https://nextjs.org/) for the React framework
- [Bootstrap](https://getbootstrap.com/) for the UI components 