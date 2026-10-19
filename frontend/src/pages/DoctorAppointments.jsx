import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import api from '../api';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/doctor', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed to load appointments');
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Appointments</h1>
        <p className="text-muted">{appointments.length} appointments</p>
        <Link to="/doctor" className="btn btn-outline">Back</Link>
      </div>
      <div className="card card-lg">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th><th>Time</th><th>Patient</th><th>Notes</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-muted">Loading...</td></tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td><strong>{apt.date}</strong></td>
                      <td>{apt.time}</td>
                      <td>Patient #{apt.patient_id}</td>
                      <td className="text-muted">{apt.notes}</td>
                      <td><Badge variant={apt.status}>{apt.status}</Badge></td>
                      <td>
                        {apt.status === 'scheduled' || apt.status === 'confirmed' ? (
                          <button className="btn btn-sm btn-success" onClick={() => alert('Open the prescription form from the doctor dashboard.')}>
                            ✅ Complete
                          </button>
                        ) : null}
                      </td>
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
