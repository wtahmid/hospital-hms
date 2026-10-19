import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PatientBills() {
  const [bills, setBills] = useState([]);
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
        setBills(data.bills || []);
      } catch (err) {
        setError('Failed to load bills.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const payBill = async (billId) => {
    if (!window.confirm('Pay this bill?')) return;
    try {
      const res = await fetch(`/patient/bill/${billId}/pay`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
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
        <h1>My Bills</h1>
        <p className="text-muted">{bills.length} bills</p>
        <Link to="/patient" className="btn btn-outline">Back</Link>
      </div>
      <div className="card card-lg">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center text-muted">Loading...</td></tr>
                ) : (
                  bills.map((bill) => (
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
