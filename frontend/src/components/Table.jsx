// Hospital HMS — Generic table + badge components
export function Badge({ variant, children }) {
  const variants = {
    scheduled: 'badge-scheduled',
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    paid: 'badge-paid',
    completed: 'badge-completed',
    active: 'badge-active',
    cancelled: 'badge-cancelled',
    error: 'badge-error',
    info: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };
  return (
    <span className={variants[variant] || 'badge'}>{children}</span>
  );
}

export function Table({ headers, rows, renderCell }) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center text-muted">
                No records found
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                {renderCell(row)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
