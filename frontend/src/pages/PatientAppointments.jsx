import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/patient', { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setAppointments(data.appointments || []);
      } catch (err) {
        setError('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>My Appointments</h1>
        <p className="text-muted">{appointments.length} appointments</p>
        <Link to="/patient" className="btn btn-outline">Back</Link>
      </div>
      <div className="card card-lg">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th><th>Time</th><th>Doctor</th><th>Notes</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center text-muted">Loading...</td></tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td><strong>{apt.date}</strong></td>
                      <td>{apt.time}</td>
                      <td>Dr. #{apt.doctor_id}</td>
                      <td className="text-muted">{apt.notes}</td>
                      <td><Badge variant={apt.status}>{apt.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
