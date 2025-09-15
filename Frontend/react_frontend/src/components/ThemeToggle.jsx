import React from "react";

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <button className="theme-toggle-btn" onClick={toggleDarkMode}>
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;
