import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/patients', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed to load patients');
      setPatients(await res.json());
    } catch (err) {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Patients Directory</h1>
        <p className="text-muted">{patients.length} patients registered</p>
        <Link to="/admin" className="btn btn-outline">Back</Link>
      </div>
      <div className="card card-lg">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Blood Group</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-muted">Loading...</td></tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.first_name} {p.last_name}</strong></td>
                      <td>{p.date_of_birth}</td>
                      <td>{p.gender}</td>
                      <td>{p.phone}</td>
                      <td><Badge variant="info">{p.blood_group}</Badge></td>
                      <td>{p.address}</td>
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
