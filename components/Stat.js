import CountUp from './CountUp';

export default function Stat({ icon, label, value }) {
  return (
    <div className="stat">
      <span className="stat-icon">{icon}</span>
      <div>
        <div className="stat-value">{typeof value === 'number' ? <CountUp value={value} /> : value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
