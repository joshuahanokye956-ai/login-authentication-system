'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from './Controls';
import { useToast } from './Toast';

export default function ChangePasswordForm({ forced = false }) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form));
    setError('');
    if (f.next !== f.confirm) return setError('The new passwords don’t match.');
    setBusy(true);
    try {
      const d = await post('/api/auth/change-password', { current: f.current, next: f.next });
      toast('Password updated');
      form.reset();
      if (forced) router.push(d.redirect);
      router.refresh();
    } catch (err) { setError(err.message); }
    setBusy(false);
  }
  return (
    <form onSubmit={submit}>
      <label>{forced ? 'Temporary password' : 'Current password'}<input name="current" type="password" required autoComplete="current-password" /></label>
      <label>New password<input name="next" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" /></label>
      <label>Confirm new password<input name="confirm" type="password" required minLength={8} autoComplete="new-password" /></label>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn primary wide" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
    </form>
  );
}
