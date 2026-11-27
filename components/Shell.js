import { ShieldCheck, LayoutDashboard } from 'lucide-react';
import { LogoutButton } from './Controls';
import Greeting from './Greeting';
import Avatar from './Avatar';
import { BRAND } from '@/lib/brand';

const NAV = { admin: 'Administration', staff: 'User management', user: 'My account' };

export default function Shell({ role, user, subtitle, actions, banner, children }) {
  return (
    <div className="app" data-role={role}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><ShieldCheck size={20} /></span><span>{BRAND.name}</span></div>
        <nav className="nav" aria-label="Main"><a className="nav-item active" aria-current="page"><LayoutDashboard size={17} /> {NAV[role]}</a></nav>
        <div className="me">
          <Avatar name={user.name} size={38} />
          <div className="me-text"><strong>{user.name}</strong><span className="role-pill dark">{role}</span></div>
          <LogoutButton />
        </div>
      </aside>
      <main className="content">
        {banner || (
          <div className="page-head fade">
            <div><Greeting name={user.name} /><p className="sub">{subtitle}</p></div>
            <div className="head-actions">{actions}</div>
          </div>
        )}
        <div className="fade">{children}</div>
      </main>
    </div>
  );
}
