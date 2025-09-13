import React from 'react';
import './TimeSlotGrid.css';

const TimeSlotGrid = ({ appointments, selectedDate, onSlotClick, view }) => {
  // Render different views based on the 'view' prop
  if (view === 'week') {
    return renderWeekView(appointments, selectedDate, onSlotClick);
  } else if (view === 'month') {
    return renderMonthView(appointments, selectedDate, onSlotClick);
  } else {
    return renderDayView(appointments, selectedDate, onSlotClick);
  }
};

// Day view rendering
const renderDayView = (appointments, selectedDate, onSlotClick) => {
  // Generate time slots for the day (e.g., 9 AM to 5 PM)
  const timeSlots = [];
  for (let hour = 0; hour <= 23; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  // Filter appointments for the selected date
  const dateString = selectedDate.toISOString().split('T')[0];
  const appointmentsForDay = appointments.filter(
    appointment => appointment.date === dateString
  );

  return (
    <div className="time-slot-grid day-view">
      {timeSlots.map((timeSlot) => {
        const appointment = appointmentsForDay.find(
          app => app.time === timeSlot
        );
        
        return (
          <div 
            key={timeSlot}
            className={`time-slot ${appointment ? `appointment-${appointment.type || 'other'}` : ''}`}
            onClick={() => onSlotClick(timeSlot, appointment)}
          >
            <div className="time-label">{timeSlot}</div>
            {appointment && (
              <div className="appointment-info">
                <div className="appointment-title">{appointment.title}</div>
                {appointment.description && (
                  <div className="appointment-description">{appointment.description}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Week view rendering
const renderWeekView = (appointments, selectedDate, onSlotClick) => {
  // Get the start of the week (Sunday)
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
  
  // Generate days of the week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }
  
  // Generate time slots
  const timeSlots = [];
  for (let hour = 0; hour <= 23; hour++) {
    timeSlots.push(`${hour}:00`);
  }
  
  return (
    <div className="time-slot-grid week-view">
      <div className="week-header">
        <div className="time-column-header"></div>
        {weekDays.map((day, index) => (
          <div key={index} className="day-header">
            <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="day-date">{day.getDate()}</div>
          </div>
        ))}
      </div>
      
      <div className="week-body">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot} className="week-row">
            <div className="time-label">{timeSlot}</div>
            
            {weekDays.map((day, index) => {
              const dateString = day.toISOString().split('T')[0];
              const appointment = appointments.find(
                app => app.date === dateString && app.time === timeSlot
              );
              
              return (
                <div 
                  key={index}
                  className={`week-cell ${appointment ? `appointment-${appointment.type || 'other'}` : ''}`}
                  onClick={() => onSlotClick(timeSlot, appointment)}
                >
                  {appointment && (
                    <div className="appointment-info">
                      <div className="appointment-title">{appointment.title}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Month view rendering
const renderMonthView = (appointments, selectedDate, onSlotClick) => {
  // Get the first day of the month
  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  
  // Get the last day of the month
  const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  
  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();
  
  // Calculate total days to display (including days from previous/next months to fill the grid)
  const totalDays = 42; // 6 rows of 7 days
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add days from previous month
  const prevMonthLastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 0).getDate();
  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = prevMonthLastDay - firstDayOfWeek + i + 1;
    calendarDays.push({
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, day),
      isCurrentMonth: false
    });
  }
  
  // Add days from current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    calendarDays.push({
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i),
      isCurrentMonth: true
    });
  }
  
  // Add days from next month
  const remainingDays = totalDays - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, i),
      isCurrentMonth: false
    });
  }
  
  // Days of the week headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="time-slot-grid month-view">
      <div className="month-header">
        {weekDays.map((day, index) => (
          <div key={index} className="weekday-header">{day}</div>
        ))}
      </div>
      
      <div className="month-grid">
        {calendarDays.map((day, index) => {
          const dateString = day.date.toISOString().split('T')[0];
          const appointmentsForDay = appointments.filter(
            app => app.date === dateString
          );
          
          return (
            <div 
              key={index}
              className={`month-cell ${!day.isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => {
                // Set the selected date to this day when clicked
                onSlotClick(null, null);
              }}
            >
              <div className="date-number">{day.date.getDate()}</div>
              
              <div className="day-appointments">
                {appointmentsForDay.slice(0, 3).map((appointment, appIndex) => (
                  <div 
                    key={appIndex}
                    className={`month-appointment appointment-${appointment.type || 'other'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlotClick(appointment.time, appointment);
                    }}
                  >
                    {appointment.title}
                  </div>
                ))}
                
                {appointmentsForDay.length > 3 && (
                  <div className="more-appointments">
                    +{appointmentsForDay.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotGrid;
