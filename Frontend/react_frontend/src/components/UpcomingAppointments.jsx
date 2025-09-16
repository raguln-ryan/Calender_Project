import React, { useState, useEffect } from "react";
import { getUpcomingAppointments } from "../services/api";

const UpcomingAppointments = ({ refreshTrigger }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getUpcomingAppointments(3); // next 3 days
      setAppointments(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch upcoming appointments.");
      setLoading(false);
    }
  };

  // Fetch on mount and whenever refreshTrigger changes
  useEffect(() => {
    fetchAppointments();
  }, [refreshTrigger]);

  return (
    <div className="upcoming-appointments">
      <h3>Upcoming Appointments (Next 3 Days)</h3>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : appointments.length === 0 ? (
        <p>No upcoming appointments.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>
              <strong>{a.title}</strong> <br />
              {new Date(a.startTime).toLocaleString()} -{" "}
              {new Date(a.endTime).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingAppointments;
