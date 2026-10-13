'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export default function LoginPage() {
  const { user, login, signup } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@blooddrive.org');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');

  if (user) {
    router.replace('/');
    return <div className="login-wrap"><div className="card">Signed in — redirecting…</div></div>;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = tab === 'login' ? login(email, password) : signup(name, email, password);
    if (msg) setErr(msg);
    else { setErr(''); router.replace('/'); }
  };

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <div className="login-drop">🩸</div>
        <h1>Blood Donation<br />Drive Coordinator</h1>
        <p>One platform for donors, camps, appointments, reports & AI outreach planning.</p>
        <ul>
          <li>📊 Live dashboard & statistics</li>
          <li>🏕️ Camp capacity & fill tracking</li>
          <li>✨ Gemini AI campaign planner</li>
        </ul>
      </div>
      <div className="login-card card">
        <div className="login-tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setErr(''); }}>Log in</button>
          <button className={tab === 'signup' ? 'active' : ''} onClick={() => { setTab('signup'); setErr(''); }}>Sign up</button>
        </div>
        <form onSubmit={submit}>
          {tab === 'signup' && (
            <div><label>Full name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
          )}
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          {err && <div className="login-err">{err}</div>}
          <button className="btn login-btn" type="submit">{tab === 'login' ? 'Log in →' : 'Create account →'}</button>
        </form>
        <div className="login-demo">
          <strong>Demo accounts</strong>
          <div className="row" style={{ marginTop: 6 }}>
            <button className="btn btn-ghost btn-small" onClick={() => { setEmail('admin@blooddrive.org'); setPassword('admin123'); setTab('login'); }}>Coordinator: admin123</button>
            <button className="btn btn-ghost btn-small" onClick={() => { setEmail('volunteer@blooddrive.org'); setPassword('volunteer123'); setTab('login'); }}>Volunteer: volunteer123</button>
          </div>
        </div>
      </div>
    </div>
  );
}
