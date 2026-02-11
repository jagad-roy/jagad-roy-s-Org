
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

export interface Order {
  id?: string;
  created_at?: string;
  user_id: string;
  user_email: string;
  item_name: string;
  amount: number;
  shipping: number;
  payment_method: string;
  sender_name: string;
  sender_contact: string;
  trx_id: string;
  status: 'pending' | 'completed' | 'cancelled';
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
