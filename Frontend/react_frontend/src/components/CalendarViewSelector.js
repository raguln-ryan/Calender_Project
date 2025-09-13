import React from 'react';
import './CalendarViewSelector.css';

const CalendarViewSelector = ({ currentView, onViewChange }) => {
  return (
    <div className="calendar-view-selector">
      <button 
        className={`view-btn ${currentView === 'day' ? 'active' : ''}`}
        onClick={() => onViewChange('day')}
      >
        Day
      </button>
      <button 
        className={`view-btn ${currentView === 'week' ? 'active' : ''}`}
        onClick={() => onViewChange('week')}
      >
        Week
      </button>
      <button 
        className={`view-btn ${currentView === 'month' ? 'active' : ''}`}
        onClick={() => onViewChange('month')}
      >
        Month
      </button>
    </div>
  );
};

export default CalendarViewSelector;
