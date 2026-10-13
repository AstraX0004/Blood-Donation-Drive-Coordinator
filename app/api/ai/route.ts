import { NextRequest, NextResponse } from 'next/server';

// POST /api/ai { mode, extra, donors, camps, appointments }
// Uses Gemini if GEMINI_API_KEY set, else deterministic local planner.
export async function POST(req: NextRequest) {
  const { mode = 'campaign-plan', extra = '', donors = [], camps = [], appointments = [] } = await req.json();

  const stats = summarize(donors, camps, appointments);
  const prompt = buildPrompt(mode, extra, stats);

  const key = process.env.GEMINI_API_KEY;
  if (key) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      const j = await r.json();
      const text = j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? JSON.stringify(j).slice(0, 2000);
      return NextResponse.json({ text, source: 'gemini' });
    } catch (e: any) {
      return NextResponse.json({ text: localPlan(mode, stats, extra), source: 'fallback', error: e.message });
    }
  }
  return NextResponse.json({ text: localPlan(mode, stats, extra), source: 'local-planner' });
}

function summarize(donors: any[], camps: any[], appointments: any[]) {
  const byGroup: Record<string, number> = {};
  donors.forEach((d: any) => { byGroup[d.bloodGroup] = (byGroup[d.bloodGroup] ?? 0) + 1; });
  const byStatus: Record<string, number> = {};
  appointments.forEach((a: any) => { byStatus[a.status] = (byStatus[a.status] ?? 0) + 1; });
  const upcoming = camps.filter((c: any) => c.status === 'upcoming');
  const gaps = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].filter(g => (byGroup[g] ?? 0) < 2);
  const fill = camps.map((c: any) => {
    const reg = appointments.filter((a: any) => a.campId === c.id && a.status !== 'cancelled').length;
    return { title: c.title, date: c.date, location: c.location, reg, cap: c.capacity, pct: Math.round(reg / Math.max(1, c.capacity) * 100) };
  });
  return { totalDonors: donors.length, available: donors.filter((d: any) => d.availability === 'available').length, byGroup, byStatus, upcoming: upcoming.length, gaps, fill };
}

function buildPrompt(mode: string, extra: string, s: any) {
  return `You are a blood donation drive coordination assistant (not a medical authority; never decide donor medical eligibility).
Mode: ${mode}. Goal/context: ${extra || 'general improvement'}.
Live stats: ${JSON.stringify(s)}.
Produce a concise, actionable markdown plan: 1) key gaps, 2) 7-day outreach timeline, 3) volunteer roles needed, 4) message templates (SMS/WhatsApp), 5) 3 metrics to track. Keep under 400 words.`;
}

function localPlan(mode: string, s: any, extra: string) {
  const head = `BLOOD DRIVE ${mode.toUpperCase()} — built from live data${extra ? ` | Goal: ${extra}` : ''}\n`;
  const gaps = s.gaps.length ? `Registration gaps: low donor counts in ${s.gaps.join(', ')}. Prioritize these groups in messaging.` : 'No critical blood-group gaps — all groups have ≥2 donors.';
  const fill = s.fill.map((f: any) => `• ${f.title} (${f.date}, ${f.location}): ${f.reg}/${f.cap} (${f.pct}%)`).join('\n') || '• No camps yet — create one first.';
  if (mode === 'summary') return `${head}\nDonors: ${s.totalDonors} total, ${s.available} available.\nBy group: ${JSON.stringify(s.byGroup)}\nBy status: ${JSON.stringify(s.byStatus)}\nUpcoming camps: ${s.upcoming}\n${gaps}\n\nCamp fill:\n${fill}\n\nRecommendation: confirm 'registered' → 'confirmed' 48h before each camp; overbook ~15% to cover no-shows.`;
  if (mode === 'outreach') return `${head}\n${gaps}\n\n1. Re-engage deferred/unavailable donors with a check-in call (eligibility decided only by medical staff on-site).\n2. College + corporate slots: morning batches convert best — offer 30-min slots.\n3. WhatsApp template: "Hi {name}, 🩸 {camp} on {date} at {location} needs {group} donors. Reply YES to reserve your slot."\n4. Reminder cadence: T-3 days, T-1 day, morning-of. Track confirm-rate and show-rate per camp.\n\nCamp fill:\n${fill}`;
  return `${head}\n${gaps}\n\n7-DAY PLAN\nDay 1-2: Publish camp posters + WhatsApp broadcast to available donors; assign 2 calling volunteers per 50 slots.\nDay 3-4: Confirm registrations (call 'registered' list); fill rare-group gaps via targeted outreach.\nDay 5: Volunteer briefing — roles: registration desk (2), donor care (2), refreshments (1), emergency liaison (1).\nDay 6: Camp day — hourly headcount vs capacity; mark attendance live in Appointments.\nDay 7: Thank-you SMS + report export (Reports page); log no-shows for next drive.\n\nCamp fill:\n${fill}\n\nMetrics: confirmation rate, show rate, units per volunteer-hour.`;
}
