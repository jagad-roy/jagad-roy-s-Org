
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
  { id: 'med1', name: 'ডাঃ মোঃ শরিফুল ইসলাম', degree: 'MBBS, BCS (Health), FCPS (Medicine)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 3 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'med3', name: 'ডাঃ অমিতাভ রায়', degree: 'MBBS, FCPS (Medicine)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Daily: 5 PM - 8 PM', availableToday: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },

  // --- Cardiology ---
  { id: 'card1', name: 'ডাঃ মোঃ আসাদ আলম', degree: 'MBBS, BCS (Health), CCD (BIRDEM), D-Card (BSMMU)', specialty: 'Cardiology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 3 PM - 9 PM', availableToday: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', consultationFee: 600 },
  { id: 'card2', name: 'ডাঃ মোঃ মাহফুজ আলী', degree: 'MBBS, BCS (Health), FCPS (Medicine), D-Card', specialty: 'Cardiology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Sat-Thu: 3 PM - 10 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 600 },

  // --- Neuromedicine ---
  { id: 'neuro1', name: 'ডাঃ মোঃ আসাদুজ্জামান (আসাদ)', degree: 'MBBS, BCS (Health), FCPS (Medicine), MD (Neurology)', specialty: 'Neuromedicine', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Fri: 10 AM - 8 PM', availableToday: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200', consultationFee: 800 },
  { id: 'neuro2', name: 'ডাঃ মোঃ কায়কোবাদ হোসেন', degree: 'MBBS, BCS, FCPS, MD (Neurology)', specialty: 'Neuromedicine', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Mon-Wed: 3 PM - 8 PM', availableToday: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', consultationFee: 800 },

  // --- Gynecology ---
  { id: 'gyn1', name: 'ডাঃ ওবায়দা নাসনিন (মুক্তা)', degree: 'MBBS, BCS (Health), DGO (DMC)', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'gyn2', name: 'ডাঃ রুমানা আফরোজ', degree: 'MBBS, PGT, EOCT, DMU, CCD, MPH', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Sat-Thu: 4 PM-10 PM', availableToday: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'gyn3', name: 'ডাঃ শাহনাজ বেগম', degree: 'MBBS, FCPS, MS (Gynae)', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Daily: 10 AM - 2 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 600 },

  // --- Orthopedics ---
  { id: 'orth2', name: 'ডাঃ মোঃ গোলাম সারোয়ার', degree: 'MBBS, BCS (Health), FCPS (Ortho)', specialty: 'Orthopedics', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Sun, Tue, Thu: 4 PM - 8 PM', availableToday: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', consultationFee: 600 },
  { id: 'orth3', name: 'ডাঃ মোঃ জাকির হোসেন', degree: 'MBBS, MS (Orthopedics)', specialty: 'Orthopedics', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Daily: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', consultationFee: 600 },

  // --- Pediatrics ---
  { id: 'ped1', name: 'ডাঃ শাহ মোঃ মোয়াজ্জেম', degree: 'MBBS, DCH (Child), BCS', specialty: 'Pediatrics', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 3 PM - 10 PM', availableToday: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },

  // --- Surgery ---
  { id: 'sur1', name: 'ডাঃ মোঃ এমদাদুল হক', degree: 'MBBS, FCPS (Surgery)', specialty: 'Surgery', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 700 },
  { id: 'sur2', name: 'ডাঃ মোঃ জাহিদুল ইসলাম', degree: 'MBBS, MS (Surgery)', specialty: 'Surgery', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Daily: 5 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', consultationFee: 700 },

  // --- Urology ---
  { id: 'uro2', name: 'ডাঃ মোঃ নুরুজ্জামান মিয়া', degree: 'MBBS, BCS (Health), MS (Urology)', specialty: 'Urology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', consultationFee: 800 },

  // --- Endocrinology ---
  { id: 'end2', name: 'ডাঃ আহমেদ তানভীর', degree: 'MBBS, MD (Endocrinology)', specialty: 'Endocrinology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Fri: 3 PM - 9 PM', availableToday: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', consultationFee: 800 },

  // --- ENT ---
  { id: 'ent2', name: 'ডাঃ মোঃ রাশিদুল ইসলাম', degree: 'MBBS, DLO (ENT)', specialty: 'ENT', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Sat-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },

  // --- Dermatology ---
  { id: 'derm1', name: 'ডাঃ ফাহিম কিশওয়ার', degree: 'MBBS, DDV, CCD, FCPS', specialty: 'Dermatology', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Fri: 3 PM - 9 PM', availableToday: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200', consultationFee: 600 },
  { id: 'derm2', name: 'ডাঃ মোঃ নুরুল ইসলাম', degree: 'MBBS, DDV (Skin)', specialty: 'Dermatology', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Daily: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', consultationFee: 600 },

  // --- Ophthalmology ---
  { id: 'eye2', name: 'ডাঃ এস. এম. নাজমুল হক', degree: 'MBBS, DO (Eye)', specialty: 'Ophthalmology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Sun-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },

  // --- Psychiatry ---
  { id: 'psy2', name: 'ডাঃ মোঃ এনামুল হক', degree: 'MBBS, MD (Psychiatry)', specialty: 'Psychiatry', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 6 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 1000 },

  // --- Dentistry ---
  { id: 'dent2', name: 'ডাঃ মোঃ আল-আমিন', degree: 'BDS (Dental)', specialty: 'Dentistry', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Daily: 4 PM - 10 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', consultationFee: 400 },

  // --- Gastroenterology ---
  { id: 'gas2', name: 'ডাঃ মোঃ মিজানুর রহমান', degree: 'MBBS, MD (Hepatology)', specialty: 'Gastroenterology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 4 PM - 8 PM', availableToday: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', consultationFee: 800 },

  // --- Janata Clinic Doctors ---
  { id: 'j-gyn1', name: 'ডাঃ পারুল রানী রায়', degree: 'MBBS, DGO (Dhaka), FCPS (LP) Gynae & Obs', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 10 AM - 2 PM & 4 PM - 8 PM', availableToday: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'j-gyn2', name: 'ডাঃ ফারজানা আক্তার', degree: 'MBBS, BCS (Health), CMU, DMU (Ultrasonology)', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 3 PM - 8 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'j-gyn3', name: 'ডাঃ আফরোজা খানম', degree: 'MBBS (BUP), CMU, DMU (Ultra)', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 10 AM - 8 PM', availableToday: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 400 },
  { id: 'j-sur1', name: 'ডাঃ মোঃ সোহরাব হোসেন', degree: 'MBBS, FCPS (Surgery)', specialty: 'Surgery', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 3 PM - 8 PM (Fri Closed)', availableToday: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', consultationFee: 700 },
  { id: 'j-sur2', name: 'ডাঃ মোঃ আব্দুল্লাহেল মাফী', degree: 'MBBS, BCS (Health), FCPS Part-2 (Surgery)', specialty: 'Surgery', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 1 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'j-med1', name: 'ডাঃ মোঃ মাসুদ পারভেজ', degree: 'MBBS, BCS (Health), MD (Internal Medicine)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 4 PM - 8 PM (Fri Closed)', availableToday: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', consultationFee: 700 },
  { id: 'j-med2', name: 'ডাঃ তাওহীদা নাসরীন', degree: 'MBBS, BCS (Health), FCPS (Medicine) Final Part, DMU', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Fri: 10 AM - 8 PM', availableToday: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'j-med3', name: 'ডাঃ মোঃ আতিউর রহমান শেখ', degree: 'MBBS, BCS (Health)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 1 PM - 8 PM (Fri Closed)', availableToday: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'j-med4', name: 'ডাঃ নীহার রঞ্জন চৌধুরী', degree: 'MBBS, BCS (Health)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 3 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'j-ped1', name: 'ডাঃ কমলাকান্ত রায়', degree: 'MBBS, PGT, DCH (Child)', specialty: 'Pediatrics', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 5 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', consultationFee: 300 },
  { id: 'j-pain1', name: 'ডাঃ শাহরিয়ার আহমেদ শাকিল', degree: 'MBBS (Dhaka), ACPS (Pain, Psychology), PGT (Ortho)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Thu: 2 PM - 8 PM', availableToday: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', consultationFee: 500 },
  { id: 'j-orth1', name: 'ডাঃ মোঃ মোস্তফা আল বানী (রিক্কন)', degree: 'MBBS, BCS (Health), D-Ortho, MS, AO Spine (Switzerland)', specialty: 'Orthopedics', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Sat: 2 PM - 9 PM', availableToday: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200', consultationFee: 700 },
  { id: 'j-med5', name: 'ডাঃ ঋতুপর্ণা রায়', degree: 'MBBS (BUP), CMU (Ultra)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-janata'], schedule: 'Daily: 2 PM - 10 PM', availableToday: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200', consultationFee: 400 },
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
  { id: 'm1', name: 'Napa Extend', price: 20, discount: 5, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200', description: 'Pain relief' },
  { id: 'm2', name: 'Seclo 20', price: 150, discount: 10, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200', description: 'Acidity' },
  { id: 'm3', name: 'Fexo 120', price: 90, discount: 0, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200', description: 'Allergy' },
];

export const CLINICS: Clinic[] = [
  { id: 'c-madina', name: 'মদিনা ডায়াগনস্টিক ক্লিনিক এন্ড কনসালটেশন', district: 'Nilphamari', address: 'জেনারেল হাসপাতাল রোড, হাসপাতাল মোড়, নীলফামারী', doctors: ['med1','neuro2','orth2','uro2','end2','eye2','psy2','gas2'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-greensign', name: 'গ্রিন সাইন হাসপাতাল', district: 'Nilphamari', address: 'নীলফামারী সদর', doctors: ['card1', 'card2', 'neuro1', 'gyn1', 'gyn2', 'ped1', 'sur1'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-ar', name: 'এ.আর. জেনারেল হাসপাতাল', district: 'Nilphamari', address: 'সদর হাসপাতাল রোড, নীলফামারী', doctors: ['med3','gyn3','ent2','derm1','dent2'], image: 'https://images.unsplash.com/photo-1587350859728-117699f8aee1?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-ibadat', name: 'ইবাদত হাসপাতাল', district: 'Nilphamari', address: 'পুরাতন স্টেশন রোড, নীলফামারী', doctors: ['sur2','derm2','orth3'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-janata', name: 'জনতা ক্লিনিক এন্ড ডায়াগনস্টিক সেন্টার', district: 'Nilphamari', address: 'হাসপাতাল রোড, শান্তিনগর মোড় (ব্রিজ সংলগ্ন), নীলফামারী সদর, নীলফামারী।', doctors: ['j-gyn1', 'j-gyn2', 'j-gyn3', 'j-sur1', 'j-sur2', 'j-med1', 'j-med2', 'j-med3', 'j-med4', 'j-ped1', 'j-pain1', 'j-orth1', 'j-med5'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800' },
];
