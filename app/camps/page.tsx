'use client';
import { useState } from 'react';
import { useStore } from '../../lib/store';
import { RequireAuth } from '../../lib/auth';

function CampsInner() {
  const { camps, appointments, addCamp, updateCamp, deleteCamp } = useStore();
  const [form, setForm] = useState({ title: '', date: '', location: '', capacity: 50, status: 'upcoming' as const, notes: '' });
  const countFor = (id: string) => appointments.filter(a => a.campId === id && a.status !== 'cancelled').length;

  return (
    <>
      <h1>Camp Management</h1>
      <p className="muted">Create camps with dates, locations and capacity. Status updates in real time.</p>
      <div className="card" style={{ marginTop: 12 }}>
        <h2>New camp</h2>
        <form onSubmit={e => { e.preventDefault(); if (!form.title || !form.date || !form.location) return alert('Title, date, location required'); addCamp({ ...form }); setForm({ title: '', date: '', location: '', capacity: 50, status: 'upcoming', notes: '' }); }}>
          <div className="two">
            <div><label>Camp title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. City Hall Mega Camp" /></div>
            <div><label>Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Venue, City" /></div>
          </div>
          <div className="two">
            <div><label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><label>Capacity</label><input type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
          </div>
          <div><label>Notes</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Volunteers, beds, partners…" /></div>
          <div style={{ marginTop: 10 }}><button className="btn" type="submit">Create camp</button></div>
        </form>
      </div>
      <div className="grid grid-2" style={{ marginTop: 14 }}>
        {camps.slice().sort((a, b) => a.date.localeCompare(b.date)).map(c => {
          const reg = countFor(c.id);
          const pct = Math.min(100, Math.round(reg / Math.max(1, c.capacity) * 100));
          return (
            <div className="card" key={c.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{c.title}</strong>
                <select style={{ maxWidth: 150 }} value={c.status} onChange={e => updateCamp(c.id, { status: e.target.value as any })}>
                  <option value="upcoming">upcoming</option><option value="ongoing">ongoing</option><option value="completed">completed</option><option value="cancelled">cancelled</option>
                </select>
              </div>
              <div className="muted">{c.date} · {c.location} · {reg}/{c.capacity} registered</div>
              <div className="progress" style={{ margin: '8px 0' }}><div style={{ width: pct + '%' }} /></div>
              {c.notes && <div className="muted">📝 {c.notes}</div>}
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn btn-ghost btn-small" onClick={() => confirm(`Delete ${c.title}?`) && deleteCamp(c.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
      {camps.length === 0 && <p className="muted">No camps yet.</p>}
    </>
  );
}

export default function CampsPage() {
  return <RequireAuth><CampsInner /></RequireAuth>;
}
