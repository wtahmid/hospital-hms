// Hospital HMS — API client
// All requests use same-origin credentials (session cookies handled by the browser).

const api = {
  // Public
  async getDoctors() {
    const res = await fetch('/api/doctors');
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  async getPatient(id) {
    const res = await fetch(`/api/patients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch patient');
    return res.json();
  },

  // Auth
  login(credentials) {
    return fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'same-origin',
      body: new URLSearchParams(credentials).toString(),
    });
  },

  logout() {
    window.location.href = '/logout';
  },

  // Appointments
  async bookAppointment(data) {
    const res = await fetch('/patient/book-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Bills
  async payBill(billId) {
    const res = await fetch(`/patient/bill/${billId}/pay`, {
      method: 'POST',
      credentials: 'same-origin',
    });
    return res.json();
  },

  // Prescriptions
  async createPrescription(appointmentId, data) {
    const res = await fetch(`/doctor/create-prescription/${appointmentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export default api;
