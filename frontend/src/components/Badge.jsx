// Hospital HMS — Badge component
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
