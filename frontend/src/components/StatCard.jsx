// Hospital HMS — Stat card component
export function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'stat-blue',
    green: 'stat-green',
    purple: 'stat-purple',
    orange: 'stat-orange',
    red: 'stat-red',
    yellow: 'stat-yellow',
  };

  return (
    <div className={`stat-card ${colors[color] || 'stat-blue'}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}
