
import { Doctor, Clinic, Medicine } from './types';

export const DISTRICTS = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Nilphamari'];

export const SPECIALTIES = [
  { id: 'medicine', name: 'Medicine', icon: '💊', bnName: 'মেডিসিন' },
  { id: 'cardiology', name: 'Cardiology', icon: '🫀', bnName: 'হৃদরোগ' },
  { id: 'neuromedicine', name: 'Neuromedicine', icon: '🧠', bnName: 'নিউরোলজি' },
  { id: 'gynecology', name: 'Gynecology', icon: '🤰', bnName: 'গাইনী' },
  { id: 'orthopedics', name: 'Orthopedics', icon: '🦴', bnName: 'হাড়-জোড়া' },
  { id: 'pediatrics', name: 'Pediatrics', icon: '👶', bnName: 'শিশু' },
  { id: 'surgery', name: 'Surgery', icon: '🔪', bnName: 'সার্জারি' },
  { id: 'urology', name: 'Urology', icon: '💧', bnName: 'ইউরোলজি' },
  { id: 'endocrinology', name: 'Endocrinology', icon: '🩸', bnName: 'ডায়াবেটিস' },
  { id: 'ent', name: 'ENT', icon: '👂', bnName: 'নাক-কান-গলা' },
  { id: 'dermatology', name: 'Dermatology', icon: '✨', bnName: 'চর্ম-যৌন' },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: '👁️', bnName: 'চক্ষু' },
  { id: 'psychiatry', name: 'Psychiatry', icon: '🧘', bnName: 'মানসিক' },
  { id: 'dentistry', name: 'Dentistry', icon: '🦷', bnName: 'দন্ত' },
  { id: 'gastroenterology', name: 'Gastroenterology', icon: '🧪', bnName: 'পরিপাকতন্ত্র' },
];

export const DOCTORS: Doctor[] = [
  // --- Medicine ---
  { id: 'med1', name: 'Dr. Md. Shariful Islam', degree: 'MBBS, BCS (Health), FCPS (Medicine)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 3 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=med1' },
  { id: 'med3', name: 'Dr. Amitav Roy', degree: 'MBBS, FCPS (Medicine)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Daily: 5 PM - 8 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=med3' },

  // --- Cardiology ---
  { id: 'card1', name: 'Dr. Md. Asad Alam', degree: 'MBBS, BCS (Health), CCD (BIRDEM), D-Card (BSMMU)', specialty: 'Cardiology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 3 PM - 9 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=card1' },
  { id: 'card2', name: 'Dr. Md. Mehfuz Ali', degree: 'MBBS, BCS (Health), FCPS (Medicine), D-Card', specialty: 'Cardiology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Sat-Thu: 3 PM - 10 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=card2' },

  // --- Neuromedicine ---
  { id: 'neuro1', name: 'Dr. Md. Asaduzzaman (Asad)', degree: 'MBBS, BCS (Health), FCPS (Medicine), MD (Neurology)', specialty: 'Neuromedicine', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Fri: 10 AM - 8 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=neuro1' },
  { id: 'neuro2', name: 'Dr. Md. Kaikobad Hossain', degree: 'MBBS, BCS, FCPS, MD (Neurology)', specialty: 'Neuromedicine', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Mon-Wed: 3 PM - 8 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=neuro2' },

  // --- Gynecology ---
  { id: 'gyn1', name: 'Dr. Obaida Nasnin (Mukta)', degree: 'MBBS, BCS (Health), DGO (DMC)', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=gyn1' },
  { id: 'gyn2', name: 'Dr. Rumana Afroz', degree: 'MBBS, PGT, EOCT, DMU, CCD, MPH', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Sat-Thu: 4 PM-10 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=gyn2' },
  { id: 'gyn3', name: 'Dr. Shahnaz Begum', degree: 'MBBS, FCPS, MS (Gynae)', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Daily: 10 AM - 2 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=gyn3' },

  // --- Orthopedics ---
  { id: 'orth2', name: 'Dr. Md. Golam Sarwar', degree: 'MBBS, BCS (Health), FCPS (Ortho)', specialty: 'Orthopedics', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Sun, Tue, Thu: 4 PM - 8 PM', availableToday: false, rating: 4.8, image: 'https://picsum.photos/200/200?doc=orth2' },
  { id: 'orth3', name: 'Dr. Md. Zakir Hossain', degree: 'MBBS, MS (Orthopedics)', specialty: 'Orthopedics', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Daily: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=orth3' },

  // --- Pediatrics ---
  { id: 'ped1', name: 'Dr. Shah Md. Moazzem', degree: 'MBBS, DCH (Child), BCS', specialty: 'Pediatrics', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 3 PM - 10 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=ped1' },

  // --- Surgery ---
  { id: 'sur1', name: 'Dr. Md. Emdadul Haque', degree: 'MBBS, FCPS (Surgery)', specialty: 'Surgery', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=sur1' },
  { id: 'sur2', name: 'Dr. Md. Zahidul Islam', degree: 'MBBS, MS (Surgery)', specialty: 'Surgery', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Daily: 5 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=sur2' },

  // --- Urology ---
  { id: 'uro2', name: 'Dr. Md. Nuruzzaman Mia', degree: 'MBBS, BCS (Health), MS (Urology)', specialty: 'Urology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=uro2' },

  // --- Endocrinology ---
  { id: 'end2', name: 'Dr. Ahmed Tanvir', degree: 'MBBS, MD (Endocrinology)', specialty: 'Endocrinology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Fri: 3 PM - 9 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=end2' },

  // --- ENT ---
  { id: 'ent2', name: 'Dr. Md. Rashedul Islam', degree: 'MBBS, DLO (ENT)', specialty: 'ENT', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Sat-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=ent2' },

  // --- Dermatology ---
  { id: 'derm1', name: 'Dr. Fahim Kiswar', degree: 'MBBS, DDV, CCD, FCPS', specialty: 'Dermatology', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Fri: 3 PM - 9 PM', availableToday: false, rating: 4.8, image: 'https://picsum.photos/200/200?doc=derm1' },
  { id: 'derm2', name: 'Dr. Md. Nurul Islam', degree: 'MBBS, DDV (Skin)', specialty: 'Dermatology', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Daily: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=derm2' },

  // --- Ophthalmology ---
  { id: 'eye2', name: 'Dr. S. M. Nazmul Haque', degree: 'MBBS, DO (Eye)', specialty: 'Ophthalmology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Sun-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=eye2' },

  // --- Psychiatry ---
  { id: 'psy2', name: 'Dr. Md. Enamul Hoque', degree: 'MBBS, MD (Psychiatry)', specialty: 'Psychiatry', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 6 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=psy2' },

  // --- Dentistry ---
  { id: 'dent2', name: 'Dr. Md. Al-Amin', degree: 'BDS (Dental)', specialty: 'Dentistry', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Daily: 4 PM - 10 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=dent2' },

  // --- Gastroenterology ---
  { id: 'gas2', name: 'Dr. Md. Mizanur Rahman', degree: 'MBBS, MD (Hepatology)', specialty: 'Gastroenterology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 4 PM - 8 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=gas2' },
];

export const EMERGENCY_SERVICES = [
  { id: 'e1', name: 'ECG (ইসিজি)', price: 600, icon: '💓', description: 'বাসায় গিয়ে ইসিজি করা হয়' },
  { id: 'e2', name: 'Blood Collection', price: 200, icon: '🩸', description: 'ল্যাব টেস্টের জন্য রক্ত সংগ্রহ' },
  { id: 'e3', name: 'Nurse Care', price: 1500, icon: '👩‍⚕️', description: 'দক্ষ নার্সিং সেবা (১২ ঘণ্টা)' },
  { id: 'e4', name: 'BP Check', price: 100, icon: '🩺', description: 'ব্লাড প্রেসার ও সুগার চেক' },
];

export const LAB_TESTS = [
  { id: 'lt1', name: 'RBS (রক্তের সুগার)', price: 200 },
  { id: 'lt2', name: 'FBS & 2HRS', price: 400 },
  { id: 'lt3', name: 'S.Creatinine (কিডনি)', price: 500 },
  { id: 'lt4', name: 'CBC (রক্ত পরীক্ষা)', price: 600 },
  { id: 'lt5', name: 'SGPT (লিভার)', price: 500 },
  { id: 'lt6', name: 'SGOT', price: 600 },
  { id: 'lt31', name: 'Troponin- I (হার্ট অ্যাটাক)', price: 1500 },
  { id: 'lt40', name: 'TSH (থাইরয়েড)', price: 1000 },
  { id: 'lt48', name: 'HBA1C (ডায়াবেটিস ৩ মাস)', price: 1200 },
  { id: 'lt73', name: 'USG Whole Abdomen', price: 750 },
  { id: 'lt79', name: 'ECG (ইসিজি)', price: 600 },
  { id: 'lt82', name: 'X-Ray Chest', price: 600 },
];

export const MEDICINES: Medicine[] = [
  { id: 'm1', name: 'Napa Extend', price: 20, discount: 5, image: 'https://picsum.photos/200/200?med=1', description: 'Pain relief' },
  { id: 'm2', name: 'Seclo 20', price: 150, discount: 10, image: 'https://picsum.photos/200/200?med=2', description: 'Acidity' },
  { id: 'm3', name: 'Fexo 120', price: 90, discount: 0, image: 'https://picsum.photos/200/200?med=3', description: 'Allergy' },
];

export const CLINICS: Clinic[] = [
  { id: 'c-madina', name: 'Madina Diagnostic Clinic & Consultation', district: 'Nilphamari', address: 'General Hospital Road, Hospital Mor, Nilphamari', doctors: ['med1','neuro2','orth2','uro2','end2','eye2','psy2','gas2'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-greensign', name: 'Green Sign Hospital', district: 'Nilphamari', address: 'Nilphamari Sadar', doctors: ['card1', 'card2', 'neuro1', 'gyn1', 'gyn2', 'ped1', 'sur1'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-ar', name: 'A.R. General Hospital', district: 'Nilphamari', address: 'Sadar Hospital Road, Nilphamari', doctors: ['med3','gyn3','ent2','derm1','dent2'], image: 'https://images.unsplash.com/photo-1587350859728-117699f8aee1?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-ibadat', name: 'Ibadat Hospital', district: 'Nilphamari', address: 'Old Station Road, Nilphamari', doctors: ['sur2','derm2','orth3'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800' },
];
