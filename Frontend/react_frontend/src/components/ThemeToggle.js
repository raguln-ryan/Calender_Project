import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="theme-toggle">
      {/* ✅ Added label above */}
      <div className="theme-label">Theme</div>

      <label className="switch">
        <input 
          type="checkbox" 
          checked={darkMode} 
          onChange={toggleDarkMode} 
        />
        <span className="slider round">
          <span className="icon">
            {darkMode ? '🌙' : '☀️'}
          </span>
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
