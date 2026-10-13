'use client';
import { useStore } from '../lib/store';
import { RequireAuth, useAuth } from '../lib/auth';
import Link from 'next/link';

const GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const STATUSES = ['registered', 'confirmed', 'attended', 'cancelled', 'no-show'] as const;

function Inner() {
  const { user } = useAuth();
  const { donors, camps, appointments } = useStore();

  const available = donors.filter(d => d.availability === 'available').length;
  const upcoming = camps.filter(c => c.status === 'upcoming').sort((a, b) => a.date.localeCompare(b.date));
  const active = appointments.filter(a => a.status !== 'cancelled').length;
  const attended = appointments.filter(a => a.status === 'attended').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const showRate = active ? Math.round((attended / active) * 100) : 0;

  const countFor = (campId: string) => appointments.filter(a => a.campId === campId && a.status !== 'cancelled').length;
  const byGroup: Record<string, number> = {};
  donors.forEach(d => { byGroup[d.bloodGroup] = (byGroup[d.bloodGroup] ?? 0) + 1; });
  const maxGroup = Math.max(1, ...GROUPS.map(g => byGroup[g] ?? 0));
  const rare = ['AB-', 'B-', 'A-', 'O-'].filter(g => (byGroup[g] ?? 0) < 2);

  const byStatus: Record<string, number> = {};
  appointments.forEach(a => { byStatus[a.status] = (byStatus[a.status] ?? 0) + 1; });
  const totalAppt = Math.max(1, appointments.length);
  // donut via conic-gradient
  const seg = (s: string, color: string, acc: number) => {
    const v = (byStatus[s] ?? 0) / totalAppt;
    const r = `${color} ${(acc * 100).toFixed(1)}% ${((acc + v) * 100).toFixed(1)}%`;
    return { r, next: acc + v };
  };
  let acc = 0;
  const parts: string[] = [];
  const colors: Record<string, string> = { registered: '#f59e0b', confirmed: '#3b82f6', attended: '#16a34a', cancelled: '#9ca3af', 'no-show': '#ef4444' };
  STATUSES.forEach(s => { const o = seg(s, colors[s], acc); parts.push(o.r); acc = o.next; });

  const recent = appointments.slice().reverse().slice(0, 5);
  const nameOf = (id: string) => donors.find(d => d.id === id)?.name ?? '—';
  const campOf = (id: string) => camps.find(c => c.id === id)?.title ?? '—';
  const nextCamp = upcoming[0];

  const stats = [
    { icon: '🩸', num: donors.length, label: `Donors · ${available} available`, sub: `${donors.length - available} deferred/unavailable`, href: '/donors' },
    { icon: '🏕️', num: camps.length, label: `Camps · ${upcoming.length} upcoming`, sub: nextCamp ? `Next: ${nextCamp.title} (${nextCamp.date})` : 'No upcoming camps', href: '/camps' },
    { icon: '📝', num: active, label: 'Active registrations', sub: `${confirmed} confirmed · ${attended} attended`, href: '/appointments' },
    { icon: '✅', num: `${showRate}%`, label: 'Show-up rate', sub: `${attended} of ${active} attended`, href: '/reports' },
  ];

  return (
    <>
      <div className="dash-hero">
        <div>
          <div className="dash-hello">Welcome back, {user?.name?.split(' ')[0] ?? 'Coordinator'} 👋</div>
          <h1>Donation Drive Command Center</h1>
          <p className="muted">Live coordination status — donors, camps, appointments and AI outreach in one place.</p>
        </div>
        <div className="row">
          <Link className="btn" href="/appointments">+ New registration</Link>
          <Link className="btn btn-ghost" href="/ai">✨ AI campaign plan</Link>
        </div>
      </div>

      <div className="grid grid-4 stat-grid">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="card stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label"><strong>{s.label}</strong></div>
            <div className="muted stat-sub">{s.sub}</div>
          </Link>
        ))}
      </div>

      {rare.length > 0 && (
        <div className="alert" style={{ marginTop: 12 }}>
          ⚠️ Low-stock risk: rare groups with &lt; 2 donors — <strong>{rare.join(', ')}</strong>. Use <Link href="/ai">AI Planner</Link> for targeted outreach.
        </div>
      )}

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>🩸 Donors by blood group</h2>
          <div className="bars">
            {GROUPS.map(g => (
              <div className="bar-row" key={g}>
                <span className="bar-label">{g}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(((byGroup[g] ?? 0) / maxGroup) * 100)}%` }} /></div>
                <span className="bar-val">{byGroup[g] ?? 0}</span>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn btn-ghost btn-small" href="/donors">Manage donors</Link>
            <Link className="btn btn-ghost btn-small" href="/reports">Export Excel</Link>
          </div>
        </div>

        <div className="card">
          <h2>📋 Appointments by status</h2>
          <div className="row" style={{ alignItems: 'center' }}>
            <div className="donut" style={{ background: `conic-gradient(${parts.join(',')})` }}>
              <div className="donut-hole"><strong>{appointments.length}</strong><span className="muted">total</span></div>
            </div>
            <div className="legend">
              {STATUSES.map(s => (
                <div key={s} className="legend-row">
                  <span className="dot" style={{ background: colors[s] }} /> {s}
                  <strong style={{ marginLeft: 'auto' }}>{byStatus[s] ?? 0}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn btn-ghost btn-small" href="/appointments">Track appointments</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>🏕️ Upcoming camps & fill rate</h2>
          {upcoming.length === 0 && <p className="muted">No upcoming camps. <Link href="/camps">Create one</Link>.</p>}
          {upcoming.slice(0, 4).map(c => {
            const reg = countFor(c.id);
            const pct = Math.min(100, Math.round((reg / Math.max(1, c.capacity)) * 100));
            return (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{c.title}</strong>
                  <span className="badge blue">{reg}/{c.capacity} · {pct}%</span>
                </div>
                <div className="muted">{c.date} · {c.location}</div>
                <div className="progress" style={{ marginTop: 6 }}><div style={{ width: pct + '%' }} /></div>
              </div>
            );
          })}
          <Link className="btn btn-ghost btn-small" href="/camps">Manage camps</Link>
        </div>

        <div className="card">
          <h2>🕒 Recent registrations</h2>
          {recent.length === 0 && <p className="muted">No registrations yet.</p>}
          {recent.map(a => (
            <div key={a.id} className="recent-row">
              <span><strong>{nameOf(a.donorId)}</strong> <span className="muted">→ {campOf(a.campId)}</span></span>
              <span className={`badge ${a.status === 'attended' ? 'green' : a.status === 'confirmed' ? 'blue' : a.status === 'cancelled' ? 'gray' : 'amber'}`}>{a.status}</span>
            </div>
          ))}
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn btn-ghost btn-small" href="/reports">View reports</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return <RequireAuth><Inner /></RequireAuth>;
}
