// Hospital HMS — App shell with routing + auth
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider, ProtectedRoute } from './auth';
import { useAuth } from './auth';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsDirectory from './pages/DoctorsDirectory';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import AdminAppointments from './pages/AdminAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import PatientDashboard from './pages/PatientDashboard';
import PatientAppointments from './pages/PatientAppointments';
import PatientPrescriptions from './pages/PatientPrescriptions';
import PatientBills from './pages/PatientBills';

function AppShell({ children }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🏥</span>
          <span className="brand-text">Hospital HMS</span>
        </div>
        <div className="nav-links">
          <span className="nav-user">
            <span className="user-role">{user.role === 'admin' ? 'Administrator' : user.role}</span>
            <span className="user-name">{user.first_name} {user.last_name}</span>
          </span>
          <a href="/logout" className="btn-logout">Logout</a>
        </div>
      </nav>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <p>Hospital Management System &copy; {new Date().getFullYear()}</p>
      </footer>
      <div className="toast-container" id="toast-container"></div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<DoctorsDirectory />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRole="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/bills" element={<PatientBills />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
