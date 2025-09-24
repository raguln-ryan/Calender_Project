import React, { useState } from "react";
import { AppointmentProvider } from "./context/AppointmentContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import CalendarPage from "./pages/CalendarPage";
import "./App.css";
 import { ToastContainer } from 'react-toastify';

function AppContent() {
  const { dark, toggle } = useTheme();
  const [view, setView] = useState("day"); // "day" | "week" | "month"

  return (
    <AppointmentProvider>
      <div className={`app-container ${dark ? "dark" : ""}`}>
        <header className="app-header">
          <h1>📅 Smart Calendar</h1>
          <div className="header-actions">
            <button className="btn" onClick={toggle}>
              {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <select value={view} onChange={e => setView(e.target.value)}>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </header>
        <main className="app-main">
          <CalendarPage view={view} />
        </main>
      </div>
    </AppointmentProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
      <ToastContainer />
    </ThemeProvider>
  );
}
