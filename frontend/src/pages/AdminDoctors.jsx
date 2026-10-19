import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

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
        <Link to="/admin" className="btn btn-outline">Back</Link>
      </div>
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
