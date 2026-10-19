import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
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
        setPrescriptions(data.prescriptions || []);
      } catch (err) {
        setError('Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>My Prescriptions</h1>
        <p className="text-muted">{prescriptions.length} prescriptions</p>
        <Link to="/patient" className="btn btn-outline">Back</Link>
      </div>
      <div className="card card-lg">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Medication</th><th>Dosage</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center text-muted">Loading...</td></tr>
                ) : (
                  prescriptions.map((rx) => (
                    <tr key={rx.id}>
                      <td>{rx.created_at || 'N/A'}</td>
                      <td>Dr. #{rx.doctor_id}</td>
                      <td className="text-muted">{rx.diagnosis}</td>
                      <td>{rx.medication}</td>
                      <td>{rx.dosage}</td>
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
