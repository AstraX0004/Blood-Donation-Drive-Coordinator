'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/donors', label: 'Donors' },
  { href: '/camps', label: 'Camps' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/reports', label: 'Reports' },
  { href: '/ai', label: '✨ AI Planner' },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  if (path === '/login') return null;
  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="brand">🩸 Drive Coordinator</span>
        {user && links.map(l => (
          <Link key={l.href} href={l.href} className={path === l.href ? 'active' : ''}>{l.label}</Link>
        ))}
        <span style={{ marginLeft: 'auto' }} className="row">
          {user ? (
            <>
              <span className="nav-user" title={user.email}>👤 {user.name} <span className="badge blue">{user.role}</span></span>
              <button className="btn btn-small nav-logout" onClick={() => { logout(); router.replace('/login'); }}>Logout</button>
            </>
          ) : (
            <Link href="/login" className={path === '/login' ? 'active' : ''}>Login</Link>
          )}
        </span>
      </div>
    </nav>
  );
}
