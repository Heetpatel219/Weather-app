import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { visitedCitiesAtom } from '../store/weatherStore';

const Layout = ({ children, title = 'Weather App' }) => {
  const [visitedCities] = useAtom(visitedCitiesAtom);
  const [mounted, setMounted] = useState(false);
  
  // Only show visited cities count after component has mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Next.js Weather Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="mb-4">
        <nav className="navbar navbar-expand-lg navbar-light bg-light rounded">
          <div className="container-fluid">
            <Link href="/" className="navbar-brand">
              Weather App
            </Link>
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link href="/" className="nav-link">
                    Home
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="visitedCitiesDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    Visited Cities ({mounted ? visitedCities.length : 0})
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="visitedCitiesDropdown">
                    {!mounted || visitedCities.length === 0 ? (
                      <li><span className="dropdown-item disabled">No cities visited yet</span></li>
                    ) : (
                      visitedCities.map(city => (
                        <li key={city.id}>
                          <Link href={`/city/${city.id}`} className="dropdown-item">
                            {city.name}, {city.sys.country}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </li>
                <li className="nav-item">
                  <Link href="/visited" className="nav-link">
                    All Visited Cities
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <main>{children}</main>
      
    </div>
  );
};

export default Layout; 