
export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface Doctor {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  districts: string[];
  clinics: string[];
  schedule: string;
  availableToday: boolean;
  rating: number;
  image: string;
}

export interface Clinic {
  id: string;
  name: string;
  district: string;
  address: string;
  doctors: string[];
  image: string;
}

export interface Medicine {
  id: string;
  name: string;
  price: number;
  discount: number;
  image: string;
  description: string;
}

export interface LabTest {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  medicines: string[];
  tests: string[];
  notes: string;
}
