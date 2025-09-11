import React from "react";
import AppointmentCard from "./AppointmentCard";
import "./MonthView.css";

const MonthView = ({ appointments, selectedDate }) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // first day of the month
  const firstDay = new Date(year, month, 1);
  // last day of the month
  const lastDay = new Date(year, month + 1, 0);

  // start from Sunday of the first week
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  // end on Saturday of the last week
  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  // generate all days in the grid
  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  return (
    <div className="month-view">
      {/* Weekday header */}
      <div className="month-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="month-day-header">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="month-grid">
        {days.map((d, i) => {
          const isCurrentMonth = d.getMonth() === month;
          return (
            <div
              key={i}
              className={`month-cell ${isCurrentMonth ? "" : "faded"}`}
            >
              <div className="date-number">{d.getDate()}</div>
              {appointments
                .filter(
                  (app) =>
                    new Date(app.start).toDateString() === d.toDateString()
                )
                .map((app) => (
                  <AppointmentCard
                    key={app.id}
                    appointment={app}
                    draggableProps={{}}
                  />
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
