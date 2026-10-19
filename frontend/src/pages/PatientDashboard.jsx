import { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import api from '../api';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ doctor_id: '', date: '', time: '', notes: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/patient', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();
      setPatient(data.patient);
      setAppointments(data.appointments || []);
      setPrescriptions(data.prescriptions || []);
      setBills(data.bills || []);
      setDoctors(data.doctors || []);
    } catch (err) {
      setError('Failed to load your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const res = await api.bookAppointment(form);
      if (res.success) {
        setForm({ doctor_id: '', date: '', time: '', notes: '' });
        load();
      } else {
        alert('Error: ' + res.error);
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  const payBill = async (billId) => {
    try {
      const res = await fetch(`/patient/bill/${billId}/pay`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (data.success) {
        load();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Patient Dashboard</h1>
        <p className="text-muted">Welcome, {patient ? patient.first_name : ''} {user?.first_name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{appointments.length}</span>
            <span className="stat-label">Appointments</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">💊</div>
          <div className="stat-info">
            <span className="stat-value">{prescriptions.length}</span>
            <span className="stat-label">Prescriptions</span>
          </div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{bills.length}</span>
            <span className="stat-label">Bills</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Book an Appointment */}
        <div className="card card-lg">
          <div className="card-header">
            <h2>Book an Appointment</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleBook}>
              <div className="form-group">
                <label>Select Doctor</label>
                <select
                  id="doctorSelect"
                  className="form-control"
                  value={form.doctor_id}
                  onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose a doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.first_name} {d.last_name} — {d.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    id="appointmentDate"
                    type="text"
                    className="form-control"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <select
                    id="appointmentTime"
                    className="form-control"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                  >
                    <option value="">-- Choose time --</option>
                    {['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  id="appointmentNotes"
                  className="form-control"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Reason for visit"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Book Appointment</button>
            </form>
          </div>
        </div>

        {/* My Appointments */}
        <div className="card">
          <div className="card-header">
            <h2>My Appointments</h2>
          </div>
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

      {/* Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>My Prescriptions</h2>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Medication</th><th>Dosage</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx) => (
                    <tr key={rx.id}>
                      <td>{rx.created_at || 'N/A'}</td>
                      <td>Dr. #{rx.doctor_id}</td>
                      <td className="text-muted">{rx.diagnosis}</td>
                      <td>{rx.medication}</td>
                      <td>{rx.dosage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bills */}
      {bills.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>My Bills</h2>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.created_at || 'N/A'}</td>
                      <td className="text-muted">{bill.description}</td>
                      <td><strong>${bill.amount.toFixed(2)}</strong></td>
                      <td><Badge variant={bill.status}>{bill.status}</Badge></td>
                      <td>
                        {bill.status === 'pending' ? (
                          <button className="btn btn-sm btn-primary" onClick={() => payBill(bill.id)}>
                            💳 Pay Now
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
    </div>
  );
}
