'use client';
import { useState } from 'react';
import { useStore } from '../../lib/store';
import { RequireAuth } from '../../lib/auth';

type Mode = 'campaign-plan' | 'summary' | 'outreach';

function AIInner() {
  const { donors, camps, appointments } = useStore();
  const [mode, setMode] = useState<Mode>('campaign-plan');
  const [extra, setExtra] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setOut('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, extra, donors, camps, appointments }),
      });
      const j = await res.json();
      setOut(j.text ?? 'No output.');
    } catch (e: any) { setOut('Error: ' + e.message); }
    setLoading(false);
  };

  return (
    <>
      <h1>✨ Gemini AI — Campaign Assistant</h1>
      <p className="muted">Generates campaign plans, summarizes registration data, and suggests ways to improve participation. Uses live operational data. Works offline with a built-in planner if no <code>GEMINI_API_KEY</code> is set.</p>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row">
          <select style={{ maxWidth: 240 }} value={mode} onChange={e => setMode(e.target.value as Mode)}>
            <option value="campaign-plan">Campaign plan</option>
            <option value="summary">Summarize registration data</option>
            <option value="outreach">Improve donor participation</option>
          </select>
          <button className="btn" onClick={run} disabled={loading}>{loading ? 'Thinking…' : 'Generate'}</button>
        </div>
        <label>Context / goal (optional)</label>
        <textarea rows={3} value={extra} onChange={e => setExtra(e.target.value)} placeholder="e.g. Target 200 units next month, focus on colleges, low O- stock…" />
        <p className="muted">⚕️ Safety: this tool never determines medical eligibility — final decisions rest with qualified healthcare personnel.</p>
      </div>
      {out && <pre className="ai" style={{ marginTop: 14 }}>{out}</pre>}
    </>
  );
}

export default function AIPage() {
  return <RequireAuth><AIInner /></RequireAuth>;
}
