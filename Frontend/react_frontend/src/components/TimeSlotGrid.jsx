import React from "react";
import "./TimeSlotGrid.css";

const TimeSlotGrid = ({ appointments, selectedDate, onSlotClick, view, onMoveAppointment }) => {
  // Normalize appointments so that each has "date": "YYYY-MM-DD" and "time": "HH:mm"
  const normalizedAppointments = normalizeAppointments(appointments);

  if (view === "week") {
    return renderWeekView(normalizedAppointments, selectedDate, onSlotClick, onMoveAppointment);
  } else if (view === "month") {
    return renderMonthView(normalizedAppointments, selectedDate, onSlotClick, onMoveAppointment);
  } else {
    return renderDayView(normalizedAppointments, selectedDate, onSlotClick, onMoveAppointment);
  }
};

// Helper to normalize the appointment objects
function normalizeAppointments(appts) {
  return appts.map((app) => {
    const start = new Date(app.startTime);
    const date = start.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const hours = start.getHours().toString().padStart(2, "0");
    const mins = start.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${mins}`; // "HH:mm"
    return {
      ...app,
      date,
      time,
    };
  });
}

// Day view rendering
const renderDayView = (appointments, selectedDate, onSlotClick, onMoveAppointment) => {
  // Generate time slots for the day: every hour and every 30 min between 00:00 to 23:30
  const timeSlots = [];
  for (let hour = 0; hour <= 23; hour++) {
    const hh = hour.toString().padStart(2, "0");
    timeSlots.push(`${hh}:00`);
    timeSlots.push(`${hh}:30`);
  }

  const dateString = selectedDate.toISOString().split("T")[0];
  const appointmentsForDay = appointments.filter((appointment) => appointment.date === dateString);

  const handleDrop = (e, newTime) => {
    e.preventDefault();
    removeDragOverClass(e.currentTarget);
    const appointmentId = e.dataTransfer.getData("appointmentId");
    if (appointmentId && onMoveAppointment) {
      onMoveAppointment(appointmentId, dateString, newTime);
    }
  };

  return (
    <div className="time-slot-grid day-view">
      {timeSlots.map((timeSlot) => {
        const appointment = appointmentsForDay.find((app) => app.time === timeSlot);

        return (
          <div
            key={timeSlot}
            className={`time-slot ${appointment ? `appointment-${(appointment.type || "other").toLowerCase()}` : ""}`}
            onClick={() => onSlotClick(timeSlot, appointment)}
            onDragOver={(e) => {
              e.preventDefault();
              addDragOverClass(e.currentTarget);
            }}
            onDragLeave={(e) => removeDragOverClass(e.currentTarget)}
            onDrop={(e) => handleDrop(e, timeSlot)}
          >
            <div className="time-label">{timeSlot}</div>
            {appointment && (
              <div
                className="appointment-info"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("appointmentId", appointment.id)}
              >
                <div className="appointment-title">{appointment.title}</div>
                {appointment.description && <div className="appointment-description">{appointment.description}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Week view rendering
const renderWeekView = (appointments, selectedDate, onSlotClick, onMoveAppointment) => {
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

  // Generate time slots: every hour
  const timeSlots = [];
  for (let hour = 0; hour <= 23; hour++) {
    const hh = hour.toString().padStart(2, "0");
    timeSlots.push(`${hh}:00`);
  }

  const handleDrop = (e, dateString, newTime) => {
    e.preventDefault();
    removeDragOverClass(e.currentTarget);
    const appointmentId = e.dataTransfer.getData("appointmentId");
    if (appointmentId && onMoveAppointment) {
      onMoveAppointment(appointmentId, dateString, newTime);
    }
  };

  return (
    <div className="time-slot-grid week-view">
      <div className="week-header">
        <div className="time-column-header"></div>
        {weekDays.map((day, index) => (
          <div key={index} className="day-header">
            <div className="day-name">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
            <div className="day-date">{day.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="week-body">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot} className="week-row">
            <div className="time-label">{timeSlot}</div>

            {weekDays.map((day, index) => {
              const dateString = day.toISOString().split("T")[0];
              const appointment = appointments.find((app) => app.date === dateString && app.time === timeSlot);

              return (
                <div
                  key={index}
                  className={`week-cell ${appointment ? `appointment-${(appointment.type || "other").toLowerCase()}` : ""}`}
                  onClick={() => onSlotClick(timeSlot, appointment)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    addDragOverClass(e.currentTarget);
                  }}
                  onDragLeave={(e) => removeDragOverClass(e.currentTarget)}
                  onDrop={(e) => handleDrop(e, dateString, timeSlot)}
                >
                  {appointment && (
                    <div
                      className="appointment-info"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("appointmentId", appointment.id)}
                    >
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
const renderMonthView = (appointments, selectedDate, onSlotClick, onMoveAppointment) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // First day of current month
  const firstDay = new Date(year, month, 1);
  // Last day of current month
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const totalDays = 42; // 6 rows * 7 days
  const calendarDays = [];

  // Days from previous month
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = 0; i < firstDayOfWeek; i++) {
    const dayNum = prevMonthLastDate - firstDayOfWeek + i + 1;
    calendarDays.push({
      date: new Date(year, month - 1, dayNum),
      isCurrentMonth: false,
    });
  }

  // Days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Days of next month to fill grid
  const remainingDays = totalDays - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDropOnMonthCell = (e, dateString) => {
    e.preventDefault();
    removeDragOverClass(e.currentTarget);
    const appointmentId = e.dataTransfer.getData("appointmentId");
    if (!appointmentId || !onMoveAppointment) return;

    // Try to preserve original appointment time if we can find it
    const appt = appointments.find((a) => String(a.id) === String(appointmentId));
    const timeToUse = appt ? appt.time : "09:00"; // fallback time if unknown

    onMoveAppointment(appointmentId, dateString, timeToUse);
  };

  return (
    <div className="time-slot-grid month-view">
      <div className="month-header">
        {weekDayNames.map((wd, idx) => (
          <div key={idx} className="weekday-header">
            {wd}
          </div>
        ))}
      </div>

      <div className="month-grid">
        {calendarDays.map((dayObj, index) => {
          const dateString = dayObj.date.toISOString().split("T")[0];
          const appointmentsForDay = appointments.filter((app) => app.date === dateString);

          return (
            <div
              key={index}
              className={`month-cell ${!dayObj.isCurrentMonth ? "other-month" : ""}`}
              onClick={() => onSlotClick(null, null)}
              onDragOver={(e) => {
                e.preventDefault();
                addDragOverClass(e.currentTarget);
              }}
              onDragLeave={(e) => removeDragOverClass(e.currentTarget)}
              onDrop={(e) => handleDropOnMonthCell(e, dateString)}
            >
              <div className="date-number">{dayObj.date.getDate()}</div>

              <div className="day-appointments">
                {appointmentsForDay.slice(0, 3).map((appointment, appIndex) => (
                  <div
                    key={appIndex}
                    className={`month-appointment appointment-${(appointment.type || "other").toLowerCase()}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlotClick(appointment.time, appointment);
                    }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("appointmentId", appointment.id)}
                  >
                    {appointment.title}
                  </div>
                ))}
                {appointmentsForDay.length > 3 && <div className="more-appointments">+{appointmentsForDay.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// helper DOM class toggles for drag feedback
function addDragOverClass(el) {
  if (!el) return;
  el.classList.add("drag-over");
}
function removeDragOverClass(el) {
  if (!el) return;
  el.classList.remove("drag-over");
}

export default TimeSlotGrid;
