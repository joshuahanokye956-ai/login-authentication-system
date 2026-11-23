import { redirect } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import { LogoutButton } from '@/components/Controls';
import { currentUser, home } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function ChangePassword() {
  const u = await currentUser();
  if (!u) redirect('/login');
  if (!u.must_change_password) redirect(home[u.role]);
  return (
    <main className="auth-center">
      <div className="panel fade">
        <span className="brand-mark big"><KeyRound size={22} /></span>
        <h1>Choose your own password</h1>
        <p className="sub">An admin created your account with a temporary password. Set a new one that only you know to continue.</p>
        <ChangePasswordForm forced />
        <p className="switch"><LogoutButton /></p>
      </div>
    </main>
  );
}
