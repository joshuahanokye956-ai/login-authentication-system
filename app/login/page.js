'use client';
import { useState } from 'react';
export default function Login() {
  const [mode, setMode] = useState('login'), [f, setF] = useState({ name: '', email: '', password: '' });
  const [step, setStep] = useState(1), [pre, setPre] = useState(''), [qr, setQr] = useState(null), [code, setCode] = useState(''), [msg, setMsg] = useState(''), [ok, setOk] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const post = async (url, body) => { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return [r.ok, await r.json()]; };
  async function submit(e) {
    e.preventDefault(); setMsg('');
    if (step === 2) { const [g, d] = await post('/api/auth/verify', { pre, code }); return g ? (location.href = d.role === 'user' ? '/dashboard' : '/' + d.role) : setMsg(d.error); }
    if (mode === 'register') { const [g, d] = await post('/api/auth/register', f); if (!g) return setMsg(d.error); setOk(true); setMsg('Account created. Sign in to set up two-factor.'); return setMode('login'); }
    const [g, d] = await post('/api/auth/login', f); if (!g) return setMsg(d.error);
    setOk(false); setPre(d.pre); setQr(d.qr); setStep(2);
  }
  return (<main><form className="card" onSubmit={submit}>
    <h2>{step === 2 ? 'Two-factor check' : mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
    {step === 2 ? (<>{qr && <><p>Scan this with Google Authenticator, then enter the 6-digit code.</p><img src={qr} alt="2FA QR code" width="200" /></>}
      <label>Authentication code<input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} required /></label></>)
    : (<>{mode === 'register' && <label>Full name<input value={f.name} onChange={set('name')} required /></label>}
      <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
      <label>Password<input type="password" value={f.password} onChange={set('password')} minLength={8} required /></label></>)}
    {msg && <p className={ok ? 'ok' : 'err'}>{msg}</p>}
    <button style={{ width: '100%' }}>{step === 2 ? 'Verify' : mode === 'login' ? 'Continue' : 'Create account'}</button>
    {step === 1 && <p>{mode === 'login' ? 'New here? ' : 'Have an account? '}<a href="#" onClick={(e) => { e.preventDefault(); setMsg(''); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Create account' : 'Sign in'}</a></p>}
  </form></main>);
}
