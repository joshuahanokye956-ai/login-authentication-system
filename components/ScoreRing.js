export default function ScoreRing({ score }) {
  const r = 48, c = 2 * Math.PI * r;
  const color = score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <svg width="124" height="124" viewBox="0 0 124 124" role="img" aria-label={`Security score ${score} out of 100`}>
      <circle cx="62" cy="62" r={r} fill="none" stroke="#e2e8f0" strokeWidth="11" />
      <circle cx="62" cy="62" r={r} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 62 62)" />
      <text x="62" y="62" textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="700" fill="#0f1c2e">{score}</text>
    </svg>
  );
}
