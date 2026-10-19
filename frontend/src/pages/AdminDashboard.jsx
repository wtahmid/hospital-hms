import { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetch('/api/stats', { credentials: 'same-origin' });
      if (!data.ok) throw new Error('Failed to load stats');
      setStats(await data.json());
    } catch (err) {
      setError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="app-splash"><div className="spinner"></div><p>Loading dashboard...</p></div>;
  }

  if (error) return <div className="alert alert-error">{error}</div>;

  const { recent_appointments, doctors, patients } = stats;

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p className="text-muted">Hospital overview and management</p>
        <a href="/admin/add-patient" className="btn btn-primary">+ Add Patient</a>
      </div>

      <div className="stats-grid">
        <StatCard icon="👥" label="Total Patients" value={stats.total_patients} color="blue" />
        <StatCard icon="👨‍⚕️" label="Total Doctors" value={stats.total_doctors} color="green" />
        <StatCard icon="📅" label="Appointments" value={stats.total_appointments} color="purple" />
        <StatCard icon="⏳" label="Pending Appts" value={stats.pending_appointments} color="orange" />
        <StatCard icon="💰" label="Total Bills" value={stats.total_bills} color="red" />
        <StatCard icon="⚠️" label="Pending Bills" value={stats.pending_bills} color="yellow" />
      </div>

      <div className="dashboard-grid">
        {/* Recent Appointments */}
        <div className="card card-lg">
          <div className="card-header">
            <h2>Recent Appointments</h2>
            <a href="/admin/appointments" className="btn btn-sm btn-outline">View All</a>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_appointments.map((a) => (
                    <tr key={a.id}>
                      <td>Patient #{a.patient_id}</td>
                      <td>Dr. #{a.doctor_id}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td><Badge variant={a.status}>{a.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Doctors */}
        <div className="card">
          <div className="card-header">
            <h2>Doctors</h2>
            <a href="/admin/doctors" className="btn btn-sm btn-outline">Manage</a>
          </div>
          <div className="card-body">
            <div className="doctor-list">
              {doctors.map((d) => (
                <div className="doctor-item" key={d.id}>
                  <div className="doctor-avatar">👨‍⚕️</div>
                  <div className="doctor-info">
                    <strong>Dr. {d.first_name} {d.last_name}</strong>
                    <span className="text-muted">{d.specialization}</span>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Patients</h2>
            <a href="/admin/patients" className="btn btn-sm btn-outline">View All</a>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Blood</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td>{p.first_name} {p.last_name}</td>
                      <td>{p.phone}</td>
                      <td><Badge variant="info">{p.blood_group}</Badge></td>
                      <td>{p.created_at || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
