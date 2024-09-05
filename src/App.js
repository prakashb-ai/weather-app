import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import WeatherComponent from './Components/WheatherComponent'; // Ensure the path is correct

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    console.log('Theme applied:', theme); // Add this line for debugging
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="custom-background">
      <div className="container mt-4">
        <button
          className={`btn ${theme === 'light' ? 'btn-dark' : 'btn-light'} mb-4`}
          onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        </button>
        <button
          className="btn btn-blue mb-4"
          onClick={() => toggleTheme('blue')}
        >
          Blue Theme
        </button>
        <button
          className="btn btn-green mb-4"
          onClick={() => toggleTheme('green')}
        >
          Green Theme
        </button>
        <button
          className="btn btn-red mb-4"
          onClick={() => toggleTheme('red')}
        >
          Red Theme
        </button>
        <WeatherComponent theme={theme} />
      </div>
    </div>
  );
}

export default App;
