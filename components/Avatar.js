const TONES = ['#2563eb', '#0f766e', '#7c3aed', '#c2410c', '#be185d', '#4d7c0f'];

export default function Avatar({ name, size = 36 }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  const tone = TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
  return (
    <span className="avatar" aria-hidden="true" style={{ width: size, height: size, background: tone, fontSize: size * 0.38 }}>
      {initials}
    </span>
  );
}
