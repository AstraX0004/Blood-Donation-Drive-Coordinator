'use client';
import { useState } from 'react';
import { useStore } from '../../lib/store';
import { RequireAuth } from '../../lib/auth';

function AppointmentsInner() {
  const { donors, camps, appointments, addAppointment, updateAppointment, deleteAppointment } = useStore();
  const [donorId, setDonorId] = useState('');
  const [campId, setCampId] = useState('');
  const [filter, setFilter] = useState('');
  const nameOf = (id: string) => donors.find(d => d.id === id)?.name ?? 'deleted donor';
  const campOf = (id: string) => camps.find(c => c.id === id);

  const filtered = appointments.filter(a => !filter || a.status === filter).slice().reverse();

  return (
    <>
      <h1>Appointment Tracking</h1>
      <p className="muted">Registrations → confirmations → attendance / cancellations.</p>
      <div className="card" style={{ marginTop: 12 }}>
        <h2>New registration</h2>
        <form className="row" onSubmit={e => {
          e.preventDefault();
          if (!donorId || !campId) return alert('Pick donor + camp');
          const camp = camps.find(c => c.id === campId);
          const active = appointments.filter(a => a.campId === campId && a.status !== 'cancelled').length;
          if (camp && active >= camp.capacity) return alert('Camp is full!');
          const err = addAppointment({ donorId, campId, status: 'registered' });
          if (err) alert('Donor already registered for this camp.');
          else { setDonorId(''); setCampId(''); }
        }}>
          <select style={{ maxWidth: 240 }} value={donorId} onChange={e => setDonorId(e.target.value)}>
            <option value="">Select donor</option>
            {donors.filter(d => d.availability === 'available').map(d => <option key={d.id} value={d.id}>{d.name} ({d.bloodGroup})</option>)}
          </select>
          <select style={{ maxWidth: 240 }} value={campId} onChange={e => setCampId(e.target.value)}>
            <option value="">Select camp</option>
            {camps.filter(c => c.status === 'upcoming' || c.status === 'ongoing').map(c => <option key={c.id} value={c.id}>{c.title} — {c.date}</option>)}
          </select>
          <button className="btn" type="submit">Register</button>
          <select style={{ maxWidth: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="registered">registered</option><option value="confirmed">confirmed</option>
            <option value="attended">attended</option><option value="cancelled">cancelled</option><option value="no-show">no-show</option>
          </select>
        </form>
      </div>
      <div className="table-wrap" style={{ marginTop: 14 }}><table>
        <thead><tr><th>Donor</th><th>Camp</th><th>Status</th><th>Change status</th><th></th></tr></thead>
        <tbody>
          {filtered.map(a => (
            <tr key={a.id}>
              <td><strong>{nameOf(a.donorId)}</strong></td>
              <td className="muted">{campOf(a.campId)?.title ?? 'deleted camp'} · {campOf(a.campId)?.date ?? ''}</td>
              <td><span className={`badge ${a.status === 'attended' ? 'green' : a.status === 'confirmed' ? 'blue' : a.status === 'cancelled' ? 'gray' : 'amber'}`}>{a.status}</span></td>
              <td>
                <div className="row">
                  {(['confirmed', 'attended', 'cancelled', 'no-show'] as const).map(s => (
                    <button key={s} className="btn btn-ghost btn-small" onClick={() => updateAppointment(a.id, { status: s })}>{s}</button>
                  ))}
                </div>
              </td>
              <td><button className="btn btn-ghost btn-small" onClick={() => deleteAppointment(a.id)}>✕</button></td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={5} className="muted">No appointments.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}

export default function AppointmentsPage() {
  return <RequireAuth><AppointmentsInner /></RequireAuth>;
}
