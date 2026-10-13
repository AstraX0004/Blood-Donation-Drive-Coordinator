export type BloodGroup = 'A+'|'A-'|'B+'|'B-'|'AB+'|'AB-'|'O+'|'O-';
export type Availability = 'available'|'unavailable'|'deferred';
export type CampStatus = 'upcoming'|'ongoing'|'completed'|'cancelled';
export type ApptStatus = 'registered'|'confirmed'|'attended'|'cancelled'|'no-show';

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  city: string;
  availability: Availability;
  lastDonation?: string;
  donationsCount: number;
  createdAt: string;
}

export interface Camp {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  location: string;
  capacity: number;
  status: CampStatus;
  notes?: string;
}

export interface Appointment {
  id: string;
  donorId: string;
  campId: string;
  status: ApptStatus;
  notes?: string;
  createdAt: string;
}

export const BLOOD_GROUPS: BloodGroup[] = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
