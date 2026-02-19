
import { Doctor, Clinic, Medicine } from './types';

export const DISTRICTS = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Nilphamari'];

export const SPECIALTIES = [
  { id: 'medicine', name: 'Medicine', icon: '💊', bnName: 'মেডিসিন' },
  { id: 'cardiology', name: 'Cardiology', icon: '🫀', bnName: 'হৃদরোগ' },
  { id: 'neuromedicine', name: 'Neuromedicine', icon: '🧠', bnName: 'নিউরোলজি' },
  { id: 'gynecology', name: 'Gynecology', icon: '🤰', bnName: 'গাইনী' },
  { id: 'pediatrics', name: 'Pediatrics', icon: '👶', bnName: 'শিশু' },
  { id: 'orthopedics', name: 'Orthopedics', icon: '🦴', bnName: 'হাড়-জোড়া' },
  { id: 'surgery', name: 'Surgery', icon: '🔪', bnName: 'সার্জারি' },
  { id: 'ent', name: 'ENT', icon: '👂', bnName: 'নাক-কান-গলা' },
  { id: 'dermatology', name: 'Dermatology', icon: '✨', bnName: 'চর্ম-যৌন' },
  { id: 'urology', name: 'Urology', icon: '💧', bnName: 'ইউরোলজি' },
  { id: 'endocrinology', name: 'Endocrinology', icon: '🩸', bnName: 'ডায়াবেটিস' },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: '👁️', bnName: 'চক্ষু' },
  { id: 'psychiatry', name: 'Psychiatry', icon: '🧘', bnName: 'মানসিক' },
  { id: 'gastroenterology', name: 'Gastroenterology', icon: '🍔', bnName: 'লিভার-পরিপাক' },
  { id: 'nephrology', name: 'Nephrology', icon: '🧪', bnName: 'কিডনি' },
  { id: 'chest', name: 'Chest & Respiratory', icon: '🫁', bnName: 'বক্ষব্যাধি' },
  { id: 'physical_medicine', name: 'Physical Medicine', icon: '🏃', bnName: 'ফিজিওথেরাপি' },
  { id: 'dentistry', name: 'Dentistry', icon: '🦷', bnName: 'দন্ত' },
];

export const DOCTORS: Doctor[] = [
  // --- Cardiology ---
  { id: 'gs5', name: 'Dr. Md. Asad Alam', degree: 'MBBS, BCS (Health), CCD (BIRDEM), D-Card (BSMMU)', specialty: 'Cardiology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 3 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=1' },
  { id: 'gs6', name: 'Dr. Md. Mehfuz Ali', degree: 'MBBS, BCS (Health), FCPS (Medicine), D-Card', specialty: 'Cardiology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Sat-Thu: 3 PM - 10 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=2' },
  { id: 'ib7', name: 'Dr. Md. Al-Amin', degree: 'MBBS, BCS, MD (Cardiology)', specialty: 'Cardiology', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Fri: 9 AM - 5 PM', availableToday: false, rating: 4.8, image: 'https://picsum.photos/200/200?doc=3' },
  { id: 'c-new1', name: 'Dr. Sarah Johnson', degree: 'MBBS, MD, FCPS (Cardiology)', specialty: 'Cardiology', districts: ['Dhaka'], clinics: ['c-madina'], schedule: 'Mon, Wed: 5 PM - 8 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=4' },

  // --- Neuromedicine ---
  { id: 'gs4', name: 'Dr. Md. Asaduzzaman (Asad)', degree: 'MBBS, BCS (Health), FCPS (Medicine), MD (Neurology)', specialty: 'Neuromedicine', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Fri: 10 AM - 8 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=5' },
  { id: 'md2', name: 'Dr. Md. Kaikobad Hossain', degree: 'MBBS, BCS, FCPS, MD (Neurology)', specialty: 'Neuromedicine', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Mon-Wed: 3 PM - 8 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=6' },
  { id: 'nm-new1', name: 'Dr. Robert Miller', degree: 'MBBS, MD (Neurology), PhD', specialty: 'Neuromedicine', districts: ['Chattogram'], clinics: ['c-ar'], schedule: 'Sun, Tue: 4 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=7' },

  // --- Gynecology ---
  { id: 'gs1', name: 'Dr. Obaida Nasnin (Mukta)', degree: 'MBBS, BCS (Health), DGO (DMC)', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=8' },
  { id: 'gs7', name: 'Dr. Rumana Afroz', degree: 'MBBS, PGT, EOCT, DMU, CCD, MPH', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Sat-Thu: 4 PM-10 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=9' },
  { id: 'gyn-new1', name: 'Dr. Emily Watson', degree: 'MBBS, MS (Gynae & Obs)', specialty: 'Gynecology', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Daily: 5 PM - 8 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=10' },

  // --- Endocrinology (Diabetes) ---
  { id: 'end1', name: 'Dr. Ahmed Tanvir', degree: 'MBBS, FCPS (Medicine), MD (Endocrinology)', specialty: 'Endocrinology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Fri: 4 PM - 9 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=11' },
  { id: 'end2', name: 'Dr. Linda Garcia', degree: 'MBBS, CCD (BIRDEM), MD (Endo)', specialty: 'Endocrinology', districts: ['Dhaka'], clinics: ['c-ar'], schedule: 'Sat, Mon: 3 PM - 7 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=12' },

  // --- Gastroenterology ---
  { id: 'gas1', name: 'Dr. Michael Chen', degree: 'MBBS, MD (Gastroenterology)', specialty: 'Gastroenterology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Tue, Thu: 4 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=13' },
  { id: 'gas2', name: 'Dr. Md. Rafiqul Bari', degree: 'MBBS, FCPS (Gastro)', specialty: 'Gastroenterology', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Daily: 6 PM - 10 PM', availableToday: true, rating: 4.6, image: 'https://picsum.photos/200/200?doc=14' },

  // --- ENT ---
  { id: 'ent1', name: 'Dr. David Brown', degree: 'MBBS, DLO, MS (ENT)', specialty: 'ENT', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Mon-Thu: 3 PM - 8 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=15' },
  { id: 'ent2', name: 'Dr. Sophia Taylor', degree: 'MBBS, FCPS (ENT)', specialty: 'ENT', districts: ['Sylhet'], clinics: ['c-greensign'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=16' },

  // --- Orthopedics ---
  { id: 'ort1', name: 'Dr. James Wilson', degree: 'MBBS, MS (Orthopedics)', specialty: 'Orthopedics', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Sat-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=17' },
  { id: 'ort2', name: 'Dr. Patricia Moore', degree: 'MBBS, D-Ortho', specialty: 'Orthopedics', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 3 PM - 7 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=18' },

  // --- Surgery ---
  { id: 'sur1', name: 'Dr. William Anderson', degree: 'MBBS, FCPS (Surgery)', specialty: 'Surgery', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 4 PM - 10 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=19' },
  { id: 'sur2', name: 'Dr. Barbara Thomas', degree: 'MBBS, MS (General Surgery)', specialty: 'Surgery', districts: ['Khulna'], clinics: ['c-ibadat'], schedule: 'Fri: 10 AM - 5 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=20' },

  // --- Urology ---
  { id: 'uro1', name: 'Dr. Richard Jackson', degree: 'MBBS, MS (Urology)', specialty: 'Urology', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Mon, Wed: 3 PM - 8 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=21' },
  { id: 'uro2', name: 'Dr. Mary White', degree: 'MBBS, MD (Nephrology)', specialty: 'Urology', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Sun, Tue: 4 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=22' },

  // --- Ophthalmology (Eye) ---
  { id: 'eye1', name: 'Dr. Charles Harris', degree: 'MBBS, DO, MS (Eye)', specialty: 'Ophthalmology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 9 AM - 2 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=23' },
  { id: 'eye2', name: 'Dr. Elizabeth Clark', degree: 'MBBS, FCPS (Eye)', specialty: 'Ophthalmology', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Sat-Thu: 4 PM - 8 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=24' },

  // --- Psychiatry ---
  { id: 'psy1', name: 'Dr. Joseph Lewis', degree: 'MBBS, MD (Psychiatry)', specialty: 'Psychiatry', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Sat, Mon: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=25' },
  { id: 'psy2', name: 'Dr. Margaret Walker', degree: 'MBBS, FCPS (Mental Health)', specialty: 'Psychiatry', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 6 PM - 10 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=26' },

  // --- Nephrology ---
  { id: 'nep1', name: 'Dr. Thomas Hall', degree: 'MBBS, MD (Nephrology)', specialty: 'Nephrology', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Wed, Fri: 3 PM - 8 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=27' },

  // --- Chest & Respiratory ---
  { id: 'che1', name: 'Dr. Nancy Young', degree: 'MBBS, DTCD, MD (Chest)', specialty: 'Chest & Respiratory', districts: ['Nilphamari'], clinics: ['c-ibadat'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=28' },

  // --- Physical Medicine ---
  { id: 'phy1', name: 'Dr. Kevin Wright', degree: 'MBBS, FCPS (Physical Medicine)', specialty: 'Physical Medicine', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Sat-Thu: 10 AM - 5 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=29' },

  // --- Medicine (General) ---
  { id: 'med1', name: 'Dr. Brian King', degree: 'MBBS, BCS (Health), FCPS (Medicine)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 3 PM - 10 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=30' },
  { id: 'med2', name: 'Dr. Karen Scott', degree: 'MBBS, MD (Internal Medicine)', specialty: 'Medicine', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Sat-Thu: 4 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=31' },
];

export const EMERGENCY_SERVICES = [
  { id: 'e1', name: 'ECG (ইসিজি)', price: 600, icon: '💓', description: 'বাসায় গিয়ে ইসিজি করা হয়' },
  { id: 'e2', name: 'Blood Collection', price: 200, icon: '🩸', description: 'ল্যাব টেস্টের জন্য রক্ত সংগ্রহ' },
  { id: 'e3', name: 'Nurse Care', price: 1500, icon: '👩‍⚕️', description: 'দক্ষ নার্সিং সেবা (১২ ঘণ্টা)' },
  { id: 'e4', name: 'BP Check', price: 100, icon: '🩺', description: 'ব্লাড প্রেসার ও সুগার চেক' },
];

export const LAB_TESTS = [
  { id: 'lt1', name: 'RBS', price: 200 },
  { id: 'lt2', name: 'FBS & 2HRS', price: 400 },
  { id: 'lt3', name: 'S.Creatinine', price: 500 },
  { id: 'lt4', name: 'CBC', price: 600 },
  { id: 'lt5', name: 'SGPT', price: 500 },
  { id: 'lt6', name: 'SGOT', price: 600 },
  { id: 'lt7', name: 'S. Albumin', price: 600 },
  { id: 'lt8', name: 'S. Electrolyte', price: 1200 },
  { id: 'lt9', name: 'HBsAg', price: 400 },
  { id: 'lt10', name: 'HIV', price: 400 },
  { id: 'lt11', name: 'HCV', price: 400 },
  { id: 'lt12', name: 'MP', price: 400 },
  { id: 'lt13', name: 'VDRL', price: 400 },
  { id: 'lt14', name: 'Alkaline Phosphate', price: 500 },
  { id: 'lt15', name: 'Anti HAV-IgM', price: 1200 },
  { id: 'lt16', name: 'Anti HBc- IgM', price: 1500 },
  { id: 'lt17', name: 'Anti HBc-(Total)', price: 1200 },
  { id: 'lt18', name: 'Anti –TPO Ab', price: 1200 },
  { id: 'lt19', name: 'Anti CCP', price: 1800 },
  { id: 'lt20', name: 'Anti -TG Ab', price: 1200 },
  { id: 'lt21', name: 'APTT', price: 800 },
  { id: 'lt22', name: 'ASO Titre', price: 600 },
  { id: 'lt23', name: 'Blood- HCG', price: 1500 },
  { id: 'lt24', name: 'Total + Direct Bilirubin', price: 600 },
  { id: 'lt25', name: 'Total Bilirubin', price: 500 },
  { id: 'lt26', name: 'BT, CT', price: 400 },
  { id: 'lt27', name: 'Blood Grouping & RH Factor', price: 100 },
  { id: 'lt28', name: 'CRP', price: 700 },
  { id: 'lt29', name: 'CA-125', price: 1200 },
  { id: 'lt30', name: 'CA-15-3', price: 1200 },
  { id: 'lt31', name: 'Troponin- I (High Sensitive)', price: 1500 },
  { id: 'lt32', name: 'CBS & ESR', price: 600 },
  { id: 'lt33', name: 'HB %', price: 200 },
  { id: 'lt34', name: 'Cortisol', price: 1200 },
  { id: 'lt35', name: 'D- Dimer', price: 1500 },
  { id: 'lt36', name: 'FNAC', price: 1500 },
  { id: 'lt37', name: 'PSA', price: 1200 },
  { id: 'lt38', name: 'FT3', price: 1200 },
  { id: 'lt39', name: 'FT4', price: 1200 },
  { id: 'lt40', name: 'TSH', price: 1000 },
  { id: 'lt41', name: 'T3', price: 1000 },
  { id: 'lt42', name: 'T4', price: 1000 },
  { id: 'lt43', name: 'PRL', price: 1200 },
  { id: 'lt44', name: 'Testosterone', price: 1200 },
  { id: 'lt45', name: 'Semen Analysis', price: 1000 },
  { id: 'lt46', name: 'Urine R/E', price: 200 },
  { id: 'lt47', name: 'H. Pylori', price: 400 },
  { id: 'lt48', name: 'HBA1C', price: 1200 },
  { id: 'lt49', name: 'Hb-Electroporesis', price: 2000 },
  { id: 'lt50', name: 'S. Calcium', price: 700 },
  { id: 'lt51', name: 'S. Amylase', price: 800 },
  { id: 'lt52', name: 'S. Lipase', price: 800 },
  { id: 'lt53', name: 'Lipid Profile', price: 1200 },
  { id: 'lt54', name: 'Liver Function Test', price: 1200 },
  { id: 'lt55', name: 'Platelet Count', price: 200 },
  { id: 'lt56', name: 'Progesterone', price: 1200 },
  { id: 'lt57', name: 'Prothombin time (INR)', price: 1500 },
  { id: 'lt58', name: 'S. Uric Acid', price: 500 },
  { id: 'lt59', name: 'Skin/Nail Scraping For Fungus', price: 600 },
  { id: 'lt60', name: 'Blood For C/S', price: 1200 },
  { id: 'lt61', name: 'Urine For C/S', price: 800 },
  { id: 'lt62', name: 'Sputum For C/S', price: 1000 },
  { id: 'lt63', name: 'Wound Swab for C/S', price: 800 },
  { id: 'lt64', name: 'Stool R/E', price: 500 },
  { id: 'lt65', name: 'T. HCG', price: 1200 },
  { id: 'lt66', name: 'T. IGE', price: 1200 },
  { id: 'lt67', name: 'Urea', price: 500 },
  { id: 'lt68', name: 'Urine For Albumin', price: 300 },
  { id: 'lt69', name: 'Urine For Pregnancy Test', price: 100 },
  { id: 'lt70', name: 'Vitamin –D', price: 3000 },
  { id: 'lt71', name: 'Widal Test', price: 500 },
  { id: 'lt72', name: 'OGTT', price: 600 },
  { id: 'lt73', name: 'USG of Whole Abdomen', price: 750 },
  { id: 'lt74', name: 'USG of Lower Abdomen', price: 750 },
  { id: 'lt75', name: 'USG of Upper Abdomen', price: 750 },
  { id: 'lt76', name: 'USG of Breast', price: 1800 },
  { id: 'lt77', name: 'USG Of Breast (Single)', price: 1200 },
  { id: 'lt78', name: 'Dengue IgG/IgM Ab', price: 400 },
  { id: 'lt79', name: 'ECG', price: 600 },
  { id: 'lt80', name: 'AMH', price: 1500 },
  { id: 'lt81', name: 'PBF', price: 800 },
  { id: 'lt82', name: 'X-Ray Chest (P/A)', price: 600 },
  { id: 'lt83', name: 'X-Ray Ankle Joint', price: 600 },
  { id: 'lt84', name: 'X-Ray Elbow Joint', price: 600 },
  { id: 'lt85', name: 'X-Ray Knee Joint', price: 600 },
  { id: 'lt86', name: 'KUB', price: 700 },
  { id: 'lt87', name: 'X-Ray L/S', price: 800 },
  { id: 'lt88', name: 'X-Ray Foot', price: 600 },
  { id: 'lt89', name: 'X-Ray Wrist Joint', price: 600 },
  { id: 'lt90', name: 'X-Ray Hand', price: 600 },
  { id: 'lt91', name: 'X-Ray Shoulder Joint', price: 600 },
  { id: 'lt92', name: 'X-Ray Cervical spine', price: 800 },
  { id: 'lt93', name: 'Stool for OBT', price: 1200 },
  { id: 'lt94', name: 'Serum Iron Profile', price: 2000 },
  { id: 'lt95', name: 'Cardiac Profile (Trop-I, CPK, CK-MB)', price: 3500 },
];

export const ABOUT_US_DATA = {
  mission: "আমাদের লক্ষ্য হলো প্রযুক্তির মাধ্যমে স্বাস্থ্যসেবাকে বাংলাদেশের প্রতিটি মানুষের দোরগোড়ায় পৌঁছে দেওয়া।",
  team: [
    { name: "Jagadish Roy", role: "Founder & CEO", image: "https://picsum.photos/100/100?u=1" },
    { name: "Dr. Rafiqul Islam", role: "Chief Medical Advisor", image: "https://picsum.photos/100/100?u=2" }
  ]
};

export const MEDICINES: Medicine[] = [
  { id: 'm1', name: 'Napa Extend', price: 20, discount: 5, image: 'https://picsum.photos/200/200?med=1', description: 'Pain relief' },
  { id: 'm2', name: 'Seclo 20', price: 150, discount: 10, image: 'https://picsum.photos/200/200?med=2', description: 'Acidity' },
  { id: 'm3', name: 'Fexo 120', price: 90, discount: 0, image: 'https://picsum.photos/200/200?med=3', description: 'Allergy' },
];

export const CLINICS: Clinic[] = [
  { id: 'c-madina', name: 'Madina Diagnostic Clinic & Consultation', district: 'Nilphamari', address: 'General Hospital Road, Hospital Mor, Nilphamari', doctors: ['md1','md2','md3','md4','md5','md6','md7','md8','md9','md10','md11'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-greensign', name: 'Green Sign Hospital', district: 'Nilphamari', address: 'Nilphamari Sadar', doctors: ['gs1', 'gs2', 'gs3', 'gs4', 'gs5', 'gs6', 'gs7', 'gs8', 'gs9', 'gs10', 'gs11', 'gs12', 'gs13'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-ar', name: 'A.R. General Hospital', district: 'Nilphamari', address: 'Sadar Hospital Road, Nilphamari', doctors: ['ar1','ar2','ar3','ar4','ar5','ar6','ar7','ar8','ar9','ar10','ar11'], image: 'https://images.unsplash.com/photo-1587350859728-117699f8aee1?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-mouno', name: 'Mouno General Hospital', district: 'Nilphamari', address: 'Nilphamari Sadar', doctors: ['mou1'], image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-ibadat', name: 'Ibadat Hospital', district: 'Nilphamari', address: 'Old Station Road, Nilphamari', doctors: ['ib1','ib2','ib3','ib4','ib5','ib6','ib7'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800' },
];
