'use client';
import { useStore } from '../../lib/store';
import { downloadExcel, downloadWorkbook } from '../../lib/excel';
import { RequireAuth } from '../../lib/auth';

function ReportsInner() {
  const { donors, camps, appointments, reset } = useStore();
  const rows = appointments.map(a => {
    const d = donors.find(x => x.id === a.donorId);
    const c = camps.find(x => x.id === a.campId);
    return { appointment_id: a.id, donor: d?.name ?? '', blood_group: d?.bloodGroup ?? '', phone: d?.phone ?? '', city: d?.city ?? '', camp: c?.title ?? '', camp_date: c?.date ?? '', location: c?.location ?? '', status: a.status, created: a.createdAt };
  });
  const byStatus: Record<string, number> = {};
  appointments.forEach(a => { byStatus[a.status] = (byStatus[a.status] ?? 0) + 1; });

  return (
    <>
      <h1>Reports & Export</h1>
      <p className="muted">Accurate, up-to-date summaries. Download registration data as Excel (.xlsx).</p>
      <div className="grid grid-4" style={{ marginTop: 12 }}>
        {['registered', 'confirmed', 'attended', 'cancelled'].map(s => (
          <div className="card" key={s}><div className="stat-num">{byStatus[s] ?? 0}</div><div className="stat-label">{s}</div></div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h2>Camp-wise fill rate</h2>
        {camps.map(c => {
          const reg = appointments.filter(a => a.campId === c.id && a.status !== 'cancelled').length;
          const att = appointments.filter(a => a.campId === c.id && a.status === 'attended').length;
          return <div key={c.id} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5d5d5' }}>
            <span><strong>{c.title}</strong> <span className="muted">· {c.date} · {c.location}</span></span>
            <span className="badge blue">{reg}/{c.capacity} reg · {att} attended</span>
          </div>;
        })}
        {camps.length === 0 && <p className="muted">No camps.</p>}
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn" onClick={() => downloadExcel('registrations.xlsx', rows, 'Registrations')}>⬇ Download registrations Excel</button>
        <button className="btn btn-ghost" onClick={() => downloadExcel('donors.xlsx', donors, 'Donors')}>⬇ Donors Excel</button>
        <button className="btn btn-ghost" onClick={() => downloadExcel('camps.xlsx', camps, 'Camps')}>⬇ Camps Excel</button>
        <button className="btn btn-ghost" onClick={() => downloadWorkbook('blood-drive-report.xlsx', { Registrations: rows, Donors: donors, Camps: camps })}>⬇ Full report workbook</button>
        <button className="btn btn-ghost" onClick={() => confirm('Reset demo data?') && reset()}>Reset demo data</button>
      </div>
    </>
  );
}

export default function ReportsPage() {
  return <RequireAuth><ReportsInner /></RequireAuth>;
}
