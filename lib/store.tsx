'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Appointment, Camp, Donor } from './types';

interface Store {
  donors: Donor[];
  camps: Camp[];
  appointments: Appointment[];
  addDonor: (d: Omit<Donor, 'id' | 'createdAt'>) => void;
  updateDonor: (id: string, patch: Partial<Donor>) => void;
  deleteDonor: (id: string) => void;
  addCamp: (c: Omit<Camp, 'id'>) => void;
  updateCamp: (id: string, patch: Partial<Camp>) => void;
  deleteCamp: (id: string) => void;
  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => string | null;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);
const KEY = 'bddc-store-v1';
const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): { donors: Donor[]; camps: Camp[]; appointments: Appointment[] } {
  const now = new Date().toISOString();
  const donors: Donor[] = [
    { id: uid(), name: 'Asha Rao', bloodGroup: 'O+', phone: '9822001122', email: 'asha@example.com', city: 'Pune', availability: 'available', lastDonation: '2026-06-10', donationsCount: 4, createdAt: now },
    { id: uid(), name: 'Rahul Verma', bloodGroup: 'B+', phone: '9811102233', email: 'rahul@example.com', city: 'Mumbai', availability: 'available', donationsCount: 2, createdAt: now },
    { id: uid(), name: 'Priya Nair', bloodGroup: 'A-', phone: '9745003344', email: '', city: 'Bengaluru', availability: 'deferred', donationsCount: 1, createdAt: now },
    { id: uid(), name: 'Imran Khan', bloodGroup: 'AB+', phone: '9650004455', email: 'imran@example.com', city: 'Delhi', availability: 'available', donationsCount: 6, createdAt: now },
    { id: uid(), name: 'Sara Thomas', bloodGroup: 'O-', phone: '9400005566', email: '', city: 'Kochi', availability: 'unavailable', donationsCount: 3, createdAt: now },
  ];
  const d = (days: number) => { const t = new Date(); t.setDate(t.getDate() + days); return t.toISOString().slice(0, 10); };
  const camps: Camp[] = [
    { id: uid(), title: 'City Hall Mega Camp', date: d(4), location: 'City Hall, Pune', capacity: 120, status: 'upcoming', notes: 'Need 8 volunteers, 3 beds.' },
    { id: uid(), title: 'College Youth Drive', date: d(11), location: 'Fergusson College', capacity: 80, status: 'upcoming' },
    { id: uid(), title: 'Corporate Park Camp', date: d(-6), location: 'Hinjawadi Phase 2', capacity: 60, status: 'completed' },
  ];
  const appointments: Appointment[] = [
    { id: uid(), donorId: donors[0].id, campId: camps[0].id, status: 'confirmed', createdAt: now },
    { id: uid(), donorId: donors[1].id, campId: camps[0].id, status: 'registered', createdAt: now },
    { id: uid(), donorId: donors[3].id, campId: camps[1].id, status: 'registered', createdAt: now },
  ];
  return { donors, camps, appointments };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setDonors(s.donors ?? []); setCamps(s.camps ?? []); setAppointments(s.appointments ?? []);
      } else {
        const s = seed();
        setDonors(s.donors); setCamps(s.camps); setAppointments(s.appointments);
      }
    } catch { const s = seed(); setDonors(s.donors); setCamps(s.camps); setAppointments(s.appointments); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ donors, camps, appointments }));
  }, [donors, camps, appointments, loaded]);

  const value = useMemo<Store>(() => ({
    donors, camps, appointments,
    addDonor: (d) => setDonors(p => [...p, { ...d, id: uid(), createdAt: new Date().toISOString() }]),
    updateDonor: (id, patch) => setDonors(p => p.map(x => x.id === id ? { ...x, ...patch } : x)),
    deleteDonor: (id) => { setDonors(p => p.filter(x => x.id !== id)); setAppointments(p => p.filter(a => a.donorId !== id)); },
    addCamp: (c) => setCamps(p => [...p, { ...c, id: uid() }]),
    updateCamp: (id, patch) => setCamps(p => p.map(x => x.id === id ? { ...x, ...patch } : x)),
    deleteCamp: (id) => { setCamps(p => p.filter(x => x.id !== id)); setAppointments(p => p.filter(a => a.campId !== id)); },
    addAppointment: (a) => {
      // prevent duplicate donor+camp; enforce capacity
      let err: string | null = null;
      setAppointments(prev => {
        if (prev.some(x => x.donorId === a.donorId && x.campId === a.campId && x.status !== 'cancelled')) { err = 'duplicate'; return prev; }
        return [...prev, { ...a, id: uid(), createdAt: new Date().toISOString() }];
      });
      return err;
    },
    updateAppointment: (id, patch) => setAppointments(p => p.map(x => x.id === id ? { ...x, ...patch } : x)),
    deleteAppointment: (id) => setAppointments(p => p.filter(x => x.id !== id)),
    reset: () => { const s = seed(); setDonors(s.donors); setCamps(s.camps); setAppointments(s.appointments); },
  }), [donors, camps, appointments]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
