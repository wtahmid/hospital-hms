import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../auth';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAppointment, setModalAppointment] = useState(null);
  const [form, setForm] = useState({ diagnosis: '', medication: '', dosage: '', notes: '' });
  const modalRef = useRef(null);

  useEffect(() => {
    load();
    const onKey = (e) => { if (e.key === 'Escape') setModalAppointment(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/doctor', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();
      setAppointments(data.appointments || []);
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      setError('Failed to load doctor dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const openPrescription = (apt) => {
    setModalAppointment(apt);
    setForm({ diagnosis: '', medication: '', dosage: '', notes: '' });
  };

  const closeModal = () => setModalAppointment(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modalAppointment) return;
    try {
      const res = await api.createPrescription(modalAppointment.id, form);
      if (res.success) {
        setModalAppointment(null);
        load();
      } else {
        alert('Error: ' + res.error);
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Doctor Dashboard</h1>
        <p className="text-muted">Welcome, Dr. {user.first_name} {user.last_name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{appointments.length}</span>
            <span className="stat-label">My Appointments</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">💊</div>
          <div className="stat-info">
            <span className="stat-value">{prescriptions.length}</span>
            <span className="stat-label">Prescriptions</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* My Appointments */}
        <div className="card card-lg">
          <div className="card-header">
            <h2>My Appointments</h2>
            <a href="/doctor/appointments" className="btn btn-sm btn-outline">View All</a>
          </div>
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
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => openPrescription(apt)}
                            >
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

        {/* My Prescriptions */}
        <div className="card">
          <div className="card-header">
            <h2>My Prescriptions</h2>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th><th>Patient</th><th>Diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="text-center text-muted">Loading...</td></tr>
                  ) : (
                    prescriptions.map((rx) => (
                      <tr key={rx.id}>
                        <td>{rx.created_at || 'N/A'}</td>
                        <td>Patient #{rx.patient_id}</td>
                        <td className="text-muted">{rx.diagnosis ? rx.diagnosis.slice(0, 50) + '...' : ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {modalAppointment && (
        <div className="modal" ref={modalRef}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Prescription</h2>
              <span className="close-modal" onClick={closeModal}>&times;</span>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <input type="hidden" id="prescriptionAppointmentId" value={modalAppointment.id} />
                <div className="form-group">
                  <label>Diagnosis</label>
                  <textarea
                    id="prescriptionDiagnosis"
                    className="form-control"
                    rows={2}
                    value={form.diagnosis}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    placeholder="Brief diagnosis"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Medication</label>
                  <textarea
                    id="prescriptionMedication"
                    className="form-control"
                    rows={2}
                    value={form.medication}
                    onChange={(e) => setForm({ ...form, medication: e.target.value })}
                    placeholder="Medicine names"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    id="prescriptionDosage"
                    className="form-control"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder="e.g., 500mg twice daily for 7 days"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    id="prescriptionNotes"
                    className="form-control"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Create Prescription</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
