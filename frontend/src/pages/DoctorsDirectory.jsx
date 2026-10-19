import { useState } from 'react';
import api from '../api';

export default function DoctorsDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (err) {
      setError('Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Doctors Directory</h1>
        <p className="text-muted">{doctors.length} doctors registered</p>
      </div>
      <button className="btn btn-primary" onClick={load}>
        ↻ Refresh
      </button>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card card-lg">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Phone</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center text-muted">Loading...</td></tr>
                ) : (
                  doctors.map((d) => (
                    <tr key={d.id}>
                      <td><strong>Dr. {d.first_name} {d.last_name}</strong></td>
                      <td><span className="doctor-spec">{d.specialization}</span></td>
                      <td>{d.phone}</td>
                      <td>{d.room_number}</td>
                      <td><Badge variant="success">Active</Badge></td>
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
