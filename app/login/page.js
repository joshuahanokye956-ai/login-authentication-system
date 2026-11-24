'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Smartphone, KeyRound, Users, ArrowLeft } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import ThemeToggle from '@/components/ThemeToggle';

const TITLE = { login: 'Welcome back', register: 'Create your account', verify: 'Two-factor check', setup: 'Set up two-factor' };
const INTRO = {
  login: 'Sign in to continue to your dashboard.',
  register: 'Join as a user. An admin can change your role later.',
  verify: 'Enter the 6-digit code from your authenticator app.',
  setup: 'Scan this code with an authenticator app, then enter the 6-digit code it shows.',
};
const LABEL = { login: 'Sign in', register: 'Create account', verify: 'Verify code', setup: 'Verify and continue' };
const URLS = { login: '/api/auth/login', register: '/api/auth/register', verify: '/api/auth/2fa', setup: '/api/auth/2fa' };

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch(URLS[mode], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(d.error || 'Something went wrong.'); if (d.expired) setMode('login'); }
      else if (mode === 'register') { setMode('login'); setNotice('Account created. Sign in to set up two-factor authentication.'); }
      else if (mode === 'login') { if (d.step === 'setup') setQr(d); setMode(d.step); }
      else { router.push(d.redirect); router.refresh(); }
    } catch { setError('Network error. Try again.'); }
    setBusy(false);
  }
  const twoFactor = mode === 'verify' || mode === 'setup';
  const switchTo = (m) => { setError(''); setNotice(''); setMode(m); };

  return (
    <main className="split">
      <aside className="brand-panel">
        <div className="brand"><span className="brand-mark"><ShieldCheck size={20} /></span><span>{BRAND.name}</span></div>
        <div className="hero">
          <h2>{BRAND.tagline}</h2>
          <p>One place for your team, with the right level of access for every role.</p>
        </div>
        <ul className="points">
          <li><Smartphone size={18} /> Two-factor protection on every sign-in</li>
          <li><KeyRound size={18} /> Passwords salted, peppered and hashed</li>
          <li><Users size={18} /> Separate spaces for admins, staff and users</li>
        </ul>
      </aside>
      <section className="form-side">
        <div className="corner"><ThemeToggle className="on-light" /></div>
        <div className="panel fade" key={mode}>
          <h1>{TITLE[mode]}</h1>
          <p className="sub">{INTRO[mode]}</p>
          {mode === 'setup' && qr && (
            <div className="qr">
              <img src={qr.qr} alt="Two-factor setup QR code" width="176" height="176" />
              <p>Can’t scan? Enter this key manually:<br /><code>{qr.secret}</code></p>
            </div>
          )}
          <form onSubmit={submit}>
            {mode === 'register' && <label>Full name<input name="name" required minLength={2} autoComplete="name" placeholder="Ama Mensah" /></label>}
            {!twoFactor && (
              <>
                <label>Email<input name="email" type="email" required autoComplete="email" placeholder="you@organisation.com" /></label>
                <label>Password<input name="password" type="password" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} /></label>
              </>
            )}
            {twoFactor && <label>Authentication code<input className="code-input" name="code" inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus autoComplete="one-time-code" placeholder="123456" /></label>}
            {error && <p className="err" role="alert">{error}</p>}
            {notice && <p className="ok" role="status">{notice}</p>}
            <button className="btn primary wide" disabled={busy}>{busy ? 'Please wait…' : LABEL[mode]}</button>
          </form>
          {!twoFactor ? (
            <p className="switch">{mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button className="link" onClick={() => switchTo(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button>
            </p>
          ) : (
            <p className="switch"><button className="link" onClick={() => switchTo('login')}><ArrowLeft size={14} /> Back to sign in</button></p>
          )}
        </div>
      </section>
    </main>
  );
}
