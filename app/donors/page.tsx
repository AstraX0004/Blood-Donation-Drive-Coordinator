'use client';
import { useState } from 'react';
import { useStore } from '../../lib/store';
import { BLOOD_GROUPS } from '../../lib/types';
import { downloadExcel } from '../../lib/excel';
import { RequireAuth } from '../../lib/auth';

function DonorsInner() {
  const { donors, addDonor, updateDonor, deleteDonor } = useStore();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('');
  const [form, setForm] = useState({ name: '', bloodGroup: 'O+', phone: '', email: '', city: '', availability: 'available' as const });

  const filtered = donors.filter(d => {
    const s = (d.name + d.phone + d.city + d.bloodGroup).toLowerCase();
    return s.includes(q.toLowerCase()) && (!group || d.bloodGroup === group);
  });

  return (
    <>
      <h1>Donor Management</h1>
      <p className="muted">Register donors with blood group, contact details and availability.</p>
      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div className="card">
          <h2>Register donor</h2>
          <form onSubmit={e => { e.preventDefault(); if (!form.name || !form.phone) return alert('Name + phone required'); addDonor({ ...form, bloodGroup: form.bloodGroup as any, donationsCount: 0 }); setForm({ name: '', bloodGroup: 'O+', phone: '', email: '', city: '', availability: 'available' }); }}>
            <div className="two">
              <div><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
              <div><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" /></div>
            </div>
            <div className="two">
              <div><label>Blood group</label><select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>{BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}</select></div>
              <div><label>Availability</label><select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value as any })}><option value="available">available</option><option value="unavailable">unavailable</option><option value="deferred">deferred</option></select></div>
            </div>
            <div className="two">
              <div><label>Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="optional" /></div>
              <div><label>City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" /></div>
            </div>
            <div style={{ marginTop: 10 }}><button className="btn" type="submit">Add donor</button></div>
          </form>
        </div>
        <div className="card">
          <h2>Search & export</h2>
          <div className="row">
            <input style={{ maxWidth: 220 }} placeholder="Search name / phone / city" value={q} onChange={e => setQ(e.target.value)} />
            <select style={{ maxWidth: 130 }} value={group} onChange={e => setGroup(e.target.value)}><option value="">All groups</option>{BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}</select>
            <button className="btn btn-ghost btn-small" onClick={() => downloadExcel('donors.xlsx', filtered, 'Donors')}>Export Excel</button>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>{filtered.length} donor(s) shown · {donors.filter(d => d.availability === 'available').length} available overall</p>
        </div>
      </div>
      <div className="table-wrap" style={{ marginTop: 14 }}><table>
        <thead><tr><th>Name</th><th>Group</th><th>Contact</th><th>City</th><th>Availability</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map(d => (
            <tr key={d.id}>
              <td><strong>{d.name}</strong></td>
              <td><span className="badge">{d.bloodGroup}</span></td>
              <td className="muted">{d.phone}{d.email ? ` · ${d.email}` : ''}</td>
              <td>{d.city || '—'}</td>
              <td>
                <select style={{ maxWidth: 140 }} value={d.availability} onChange={e => updateDonor(d.id, { availability: e.target.value as any })}>
                  <option value="available">available</option><option value="unavailable">unavailable</option><option value="deferred">deferred</option>
                </select>
              </td>
              <td><button className="btn btn-ghost btn-small" onClick={() => confirm(`Delete ${d.name}?`) && deleteDonor(d.id)}>Delete</button></td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={6} className="muted">No donors found.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}

export default function DonorsPage() {
  return <RequireAuth><DonorsInner /></RequireAuth>;
}
