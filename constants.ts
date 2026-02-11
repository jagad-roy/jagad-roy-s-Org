
import { Doctor, Clinic, Medicine } from './types';

export const DISTRICTS = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];

export const EMERGENCY_SERVICES = [
  { id: 'e1', name: 'ECG (ইসিজি)', price: 800, icon: '💓', description: 'বাসায় গিয়ে ইসিজি করা হয়' },
  { id: 'e2', name: 'Blood Collection', price: 200, icon: '🩸', description: 'ল্যাব টেস্টের জন্য রক্ত সংগ্রহ' },
  { id: 'e3', name: 'Nurse Care', price: 1500, icon: '👩‍⚕️', description: 'দক্ষ নার্সিং সেবা (১২ ঘণ্টা)' },
  { id: 'e4', name: 'BP Check', price: 100, icon: '🩺', description: 'ব্লাড প্রেসার ও সুগার চেক' },
];

export const ABOUT_US_DATA = {
  mission: "আমাদের লক্ষ্য হলো প্রযুক্তির মাধ্যমে স্বাস্থ্যসেবাকে বাংলাদেশের প্রতিটি মানুষের দোরগোড়ায় পৌঁছে দেওয়া।",
  team: [
    { name: "জগদীশ রায়", role: "প্রতিষ্ঠাতা ও সিইও", image: "https://picsum.photos/100/100?u=1" },
    { name: "ডাঃ রফিকুল ইসলাম", role: "প্রধান চিকিৎসা উপদেষ্টা", image: "https://picsum.photos/100/100?u=2" }
  ]
};

export const APP_VIDEOS = [
  { id: "v1", title: "জেবি হেলথকেয়ার পরিচিতি", description: "অ্যাপ ব্যবহারের গাইড", thumbnail: "https://picsum.photos/400/225?health=1" },
  { id: "v2", title: "ডাক্তার বুকিং নিয়ম", description: "ভিডিও কল করার ধাপসমূহ", thumbnail: "https://picsum.photos/400/225?health=2" }
];

export const MEDICINES: Medicine[] = [
  { id: 'm1', name: 'Napa Extend', price: 20, discount: 5, image: 'https://picsum.photos/200/200?med=1', description: 'ব্যথানাশক' },
  { id: 'm2', name: 'Seclo 20', price: 150, discount: 10, image: 'https://picsum.photos/200/200?med=2', description: 'এসিডিটি' },
  { id: 'm3', name: 'Fexo 120', price: 90, discount: 0, image: 'https://picsum.photos/200/200?med=3', description: 'এলার্জি' },
  { id: 'm4', name: 'Sergel 20', price: 140, discount: 5, image: 'https://picsum.photos/200/200?med=4', description: 'গ্যাস্ট্রিক' },
  { id: 'm5', name: 'Ace Plus', price: 30, discount: 0, image: 'https://picsum.photos/200/200?med=5', description: 'জ্বর ও ব্যথা' },
];

export const CLINICS: Clinic[] = [
  { id: 'c1', name: 'Dhaka General Hospital', district: 'Dhaka', address: 'Dhanmondi, Dhaka', doctors: ['d1'], image: 'https://picsum.photos/400/300?hosp=1' },
  { id: 'c2', name: 'Care Medical Center', district: 'Dhaka', address: 'Mirpur, Dhaka', doctors: ['d2'], image: 'https://picsum.photos/400/300?hosp=2' },
  { id: 'c3', name: 'Labaid Specialized Hospital', district: 'Chattogram', address: 'GEC Circle, Ctg', doctors: ['d3'], image: 'https://picsum.photos/400/300?hosp=3' },
  { id: 'c4', name: 'Square Hospitals Ltd.', district: 'Dhaka', address: 'Panthapath, Dhaka', doctors: ['d4'], image: 'https://picsum.photos/400/300?hosp=4' },
  { id: 'c5', name: 'Apollo Imperial Hospital', district: 'Chattogram', address: 'Zakaria City, Ctg', doctors: ['d5'], image: 'https://picsum.photos/400/300?hosp=5' },
  { id: 'c6', name: 'Popular Diagnostic Center', district: 'Sylhet', address: 'New Medical Road, Sylhet', doctors: ['d8'], image: 'https://picsum.photos/400/300?hosp=6' },
  { id: 'c7', name: 'Ibn Sina Medical College', district: 'Rajshahi', address: 'Laxmipur, Rajshahi', doctors: ['d13'], image: 'https://picsum.photos/400/300?hosp=7' },
  { id: 'c8', name: 'Sheikh Hasina Burn Institute', district: 'Dhaka', address: 'Chankharpul, Dhaka', doctors: ['d19'], image: 'https://picsum.photos/400/300?hosp=8' },
  { id: 'c9', name: 'Khulna Medical College', district: 'Khulna', address: 'Boyra, Khulna', doctors: ['d23'], image: 'https://picsum.photos/400/300?hosp=9' },
  { id: 'c10', name: 'United Hospital', district: 'Dhaka', address: 'Gulshan, Dhaka', doctors: ['d2'], image: 'https://picsum.photos/400/300?hosp=10' },
];

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Ahmed Khan', degree: 'MBBS, FCPS', specialty: 'Medicine', districts: ['Dhaka'], clinics: ['c1'], schedule: 'Sat-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=1' },
  { id: 'd2', name: 'Dr. Sarah Rahman', degree: 'MBBS, MD', specialty: 'Cardiology', districts: ['Dhaka'], clinics: ['c2', 'c10'], schedule: 'Sun-Wed: 6 PM - 10 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=2' },
  { id: 'd3', name: 'Dr. Rafiqul Islam', degree: 'MBBS, DCH', specialty: 'Pediatrics', districts: ['Chattogram'], clinics: ['c3'], schedule: 'Mon-Fri: 4 PM - 8 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=3' },
  { id: 'd4', name: 'Dr. Jesmin Akter', degree: 'MBBS, MS (Gynae)', specialty: 'Gynecology', districts: ['Dhaka'], clinics: ['c4'], schedule: 'Daily: 10 AM - 2 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=4' },
  { id: 'd5', name: 'Dr. Monirul Hoque', degree: 'MBBS, MS (Ortho)', specialty: 'Orthopedics', districts: ['Chattogram'], clinics: ['c5'], schedule: 'Sat-Thu: 7 PM - 10 PM', availableToday: true, rating: 4.6, image: 'https://picsum.photos/200/200?doc=5' },
  { id: 'd6', name: 'Dr. Farhana Yasmin', degree: 'MBBS, DDV', specialty: 'Dermatology', districts: ['Dhaka'], clinics: ['c4'], schedule: 'Sun-Tue: 5 PM - 8 PM', availableToday: true, rating: 4.5, image: 'https://picsum.photos/200/200?doc=6' },
  { id: 'd7', name: 'Dr. Kamrul Hassan', degree: 'MBBS, MD (Neuro)', specialty: 'Neurology', districts: ['Dhaka'], clinics: ['c1'], schedule: 'Sat-Wed: 6 PM - 9 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=7' },
  { id: 'd8', name: 'Dr. Sadia Afrin', degree: 'MBBS, FCPS (ENT)', specialty: 'ENT', districts: ['Sylhet'], clinics: ['c6'], schedule: 'Daily: 5 PM - 8 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=8' },
  { id: 'd9', name: 'Dr. Tanvir Ahmed', degree: 'MBBS, MS (Urology)', specialty: 'Urology', districts: ['Dhaka'], clinics: ['c2'], schedule: 'Sun-Thu: 4 PM - 7 PM', availableToday: true, rating: 4.6, image: 'https://picsum.photos/200/200?doc=9' },
  { id: 'd10', name: 'Dr. Nasrin Sultana', degree: 'MBBS, DO', specialty: 'Ophthalmology', districts: ['Dhaka'], clinics: ['c4'], schedule: 'Sat-Mon: 10 AM - 1 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=10' },
  { id: 'd11', name: 'Dr. Masud Rana', degree: 'MBBS, MD (Psych)', specialty: 'Psychiatry', districts: ['Dhaka'], clinics: ['c1'], schedule: 'Daily: 6 PM - 9 PM', availableToday: true, rating: 4.4, image: 'https://picsum.photos/200/200?doc=11' },
  { id: 'd12', name: 'Dr. Rumana Parvin', degree: 'MBBS, MD (Gastro)', specialty: 'Gastroenterology', districts: ['Chattogram'], clinics: ['c3'], schedule: 'Sat-Wed: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=12' },
  { id: 'd13', name: 'Dr. Ariful Islam', degree: 'MBBS, MD (Nephro)', specialty: 'Nephrology', districts: ['Rajshahi'], clinics: ['c7'], schedule: 'Sun-Tue: 4 PM - 8 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=13' },
  { id: 'd14', name: 'Dr. Shoma Rani', degree: 'MBBS, MD (Rheum)', specialty: 'Rheumatology', districts: ['Dhaka'], clinics: ['c2'], schedule: 'Daily: 5 PM - 7 PM', availableToday: true, rating: 4.6, image: 'https://picsum.photos/200/200?doc=14' },
  { id: 'd15', name: 'Dr. Zahid Hasan', degree: 'MBBS, DTCD', specialty: 'Pulmonology', districts: ['Dhaka'], clinics: ['c1'], schedule: 'Sat-Wed: 6 PM - 9 PM', availableToday: true, rating: 4.5, image: 'https://picsum.photos/200/200?doc=15' },
  { id: 'd16', name: 'Dr. Maria Chowdhury', degree: 'MBBS, DEM', specialty: 'Endocrinology', districts: ['Dhaka'], clinics: ['c4'], schedule: 'Sun-Thu: 5 PM - 8 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=16' },
  { id: 'd17', name: 'Dr. Faisal Mahmud', degree: 'MBBS, MD (Hemato)', specialty: 'Hematology', districts: ['Chattogram'], clinics: ['c5'], schedule: 'Sat-Thu: 7 PM - 10 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=17' },
  { id: 'd18', name: 'Dr. Nilufa Yeasmin', degree: 'MBBS, FCPS (Onco)', specialty: 'Oncology', districts: ['Dhaka'], clinics: ['c8'], schedule: 'Mon-Wed: 4 PM - 8 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=18' },
  { id: 'd19', name: 'Dr. Habibullah', degree: 'MBBS, MS (Surgery)', specialty: 'Surgery', districts: ['Dhaka'], clinics: ['c8'], schedule: 'Daily: 10 AM - 4 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=19' },
  { id: 'd20', name: 'Dr. Sultana Razia', degree: 'MBBS, DGO', specialty: 'Obstetrics', districts: ['Sylhet'], clinics: ['c6'], schedule: 'Sat-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.6, image: 'https://picsum.photos/200/200?doc=20' },
  { id: 'd21', name: 'Dr. Imtiaz Ahmed', degree: 'BDS, PGT', specialty: 'Dental', districts: ['Dhaka'], clinics: ['c2'], schedule: 'Daily: 4 PM - 9 PM', availableToday: true, rating: 4.5, image: 'https://picsum.photos/200/200?doc=21' },
  { id: 'd22', name: 'Dr. Rifat Jahan', degree: 'MBBS, FCPS (Phys)', specialty: 'Physical Medicine', districts: ['Dhaka'], clinics: ['c1'], schedule: 'Sun-Tue: 5 PM - 8 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=22' },
  { id: 'd23', name: 'Dr. Jashim Uddin', degree: 'MBBS, DA', specialty: 'Anesthesiology', districts: ['Khulna'], clinics: ['c9'], schedule: 'Sat-Wed: 8 AM - 2 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=23' },
  { id: 'd24', name: 'Dr. Shabnam Mustari', degree: 'MBBS, MD (Rad)', specialty: 'Radiology', districts: ['Dhaka'], clinics: ['c4'], schedule: 'Daily: 9 AM - 5 PM', availableToday: true, rating: 4.6, image: 'https://picsum.photos/200/200?doc=24' },
  { id: 'd25', name: 'Dr. Mokhlesur Rahman', degree: 'MBBS, FCPS', specialty: 'Medicine', districts: ['Rajshahi'], clinics: ['c7'], schedule: 'Sat-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=25' },
];
