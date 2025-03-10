import '../styles/globals.css';
import { useEffect } from 'react';
import Head from 'next/head';
import { WeatherProvider } from '../contexts/WeatherContext';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Import Bootstrap CSS
    import('bootstrap/dist/css/bootstrap.min.css');
    
    // Only import Bootstrap JS on the client side
    if (typeof window !== 'undefined') {
      // Dynamic import to ensure it only runs on client
      import('bootstrap/dist/js/bootstrap.bundle.min.js');
    }
  }, []);

  return (
    <WeatherProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </WeatherProvider>
  );
}

export default MyApp; 