import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/appointments', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed to load appointments');
      setAppointments(await res.json());
    } catch (err) {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>All Appointments</h1>
        <p className="text-muted">{appointments.length} appointments</p>
        <Link to="/admin" className="btn btn-outline">Back</Link>
      </div>
      <div className="card card-lg">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-muted">Loading...</td></tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.date}</strong></td>
                      <td>{a.time}</td>
                      <td>Patient #{a.patient_id}</td>
                      <td>Dr. #{a.doctor_id}</td>
                      <td className="text-muted">{a.notes}</td>
                      <td><Badge variant={a.status}>{a.status}</Badge></td>
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
