
import { Doctor, Clinic, Medicine, LabTest } from './types';

export const DISTRICTS = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna'];

export const ABOUT_US_DATA = {
  mission: "আমাদের লক্ষ্য হলো প্রযুক্তির মাধ্যমে স্বাস্থ্যসেবাকে বাংলাদেশের প্রতিটি মানুষের দোরগোড়ায় পৌঁছে দেওয়া। আমরা চাই একটি সুস্থ ও সমৃদ্ধ বাংলাদেশ গড়ে তুলতে যেখানে চিকিৎসা পাওয়া হবে সহজ ও দ্রুত।",
  vision: "জেবি হেলথকেয়ার হবে প্রতিটি পরিবারের বিশ্বস্ত ডিজিটাল স্বাস্থ্য সঙ্গী, যেখানে ভিডিও কনসালটেশন থেকে শুরু করে মেডিসিন ডেলিভারি পর্যন্ত সব সেবা মিলবে এক ছাদের নিচে।",
  team: [
    { name: "জগদীশ রায়", role: "প্রতিষ্ঠাতা ও সিইও", image: "https://picsum.photos/100/100?u=1" },
    { name: "ডাঃ রফিকুল ইসলাম", role: "প্রধান চিকিৎসা উপদেষ্টা", image: "https://picsum.photos/100/100?u=2" },
    { name: "নাসরিন সুলতানা", role: "অপারেশনস ম্যানেজার", image: "https://picsum.photos/100/100?u=3" }
  ]
};

export const APP_VIDEOS = [
  {
    id: "v1",
    title: "জেবি হেলথকেয়ার অ্যাপ পরিচিতি",
    description: "কীভাবে অ্যাপটি ডাউনলোড করবেন এবং একাউন্ট খুলবেন তার পূর্ণাঙ্গ গাইড।",
    youtubeId: "dQw4w9WgXcQ", // Example ID, replace with actual
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  },
  {
    id: "v2",
    title: "কীভাবে ডাক্তার বুক করবেন?",
    description: "বিশেষজ্ঞ ডাক্তারের সাথে ভিডিও কনসালটেশন বুক করার নিয়মাবলি।",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  },
  {
    id: "v3",
    title: "মেডিসিন অর্ডার করার সহজ পদ্ধতি",
    description: "প্রেসক্রিপশন আপলোড করে কীভাবে ঘরে বসে ঔষধ পাবেন দেখে নিন।",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  }
];

export const MEDICINES: Medicine[] = [
  { id: 'm1', name: 'Napa Extend', price: 20, discount: 5, image: 'https://picsum.photos/200/200?random=1', description: 'Paracetamol for pain relief' },
  { id: 'm2', name: 'Seclo 20', price: 150, discount: 10, image: 'https://picsum.photos/200/200?random=2', description: 'Omeprazole for acidity' },
  { id: 'm3', name: 'Monas 10', price: 300, discount: 15, image: 'https://picsum.photos/200/200?random=3', description: 'Montelukast for allergy' },
  { id: 'm4', name: 'Fexo 120', price: 80, discount: 8, image: 'https://picsum.photos/200/200?random=4', description: 'Fexofenadine for cold' },
];

export const LAB_TESTS: LabTest[] = [
  { id: 't1', name: 'Full Blood Count (CBC)', price: 500, description: 'Basic health checkup' },
  { id: 't2', name: 'ECG', price: 800, description: 'Heart activity monitoring' },
  { id: 't3', name: 'Lipid Profile', price: 1200, description: 'Cholesterol check' },
  { id: 't4', name: 'Blood Sugar (Fasting)', price: 200, description: 'Diabetes screening' },
];

// 25+ Clinics
export const CLINICS: Clinic[] = [
  { id: 'c1', name: 'Dhaka General Hospital', district: 'Dhaka', address: 'Dhanmondi, Dhaka', doctors: ['d1', 'd2'], image: 'https://picsum.photos/400/300?hospital=1' },
  { id: 'c2', name: 'Care Medical Center', district: 'Dhaka', address: 'Mirpur, Dhaka', doctors: ['d3'], image: 'https://picsum.photos/400/300?hospital=2' },
  { id: 'c3', name: 'Labaid Specialized', district: 'Dhaka', address: 'Uttara, Dhaka', doctors: ['d4', 'd5'], image: 'https://picsum.photos/400/300?hospital=3' },
  { id: 'c4', name: 'Square Hospital', district: 'Dhaka', address: 'Panthapath, Dhaka', doctors: ['d1', 'd6'], image: 'https://picsum.photos/400/300?hospital=4' },
  { id: 'c5', name: 'Evercare Dhaka', district: 'Dhaka', address: 'Bashundhara, Dhaka', doctors: ['d2', 'd7'], image: 'https://picsum.photos/400/300?hospital=5' },
];

for(let i=6; i<=30; i++) {
  const district = DISTRICTS[i % 5];
  CLINICS.push({
    id: `c${i}`,
    name: `${district} Community Clinic ${i}`,
    district: district,
    address: `${district} Main Road, Block ${i}`,
    doctors: [`d${(i % 10) + 1}`],
    image: `https://picsum.photos/400/300?hospital=${i}`
  });
}

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Ahmed Khan', degree: 'MBBS, FCPS (Medicine)', specialty: 'Medicine', districts: ['Dhaka', 'Chattogram'], clinics: ['c1', 'c4', 'c9'], schedule: 'Sat-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=1' },
  { id: 'd2', name: 'Dr. Sarah Rahman', degree: 'MBBS, MD (Cardiology)', specialty: 'Cardiology', districts: ['Dhaka'], clinics: ['c1', 'c5'], schedule: 'Sun-Wed: 6 PM - 10 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=2' },
  { id: 'd3', name: 'Dr. M.A. Malek', degree: 'MBBS, FCPS (Surgery)', specialty: 'Surgery', districts: ['Dhaka', 'Chattogram'], clinics: ['c2', 'c10'], schedule: 'Mon-Fri: 4 PM - 8 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=3' },
  { id: 'd4', name: 'Dr. Nazma Sultana', degree: 'MBBS, DCH', specialty: 'Pediatrics', districts: ['Dhaka'], clinics: ['c3'], schedule: 'Daily: 10 AM - 1 PM', availableToday: true, rating: 4.6, image: 'https://picsum.photos/200/200?doc=4' },
  { id: 'd5', name: 'Dr. Faisal Ahmed', degree: 'MBBS, MD (Neurology)', specialty: 'Neurology', districts: ['Dhaka'], clinics: ['c3'], schedule: 'Sat, Mon, Wed: 5 PM - 8 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=5' },
  { id: 'd6', name: 'Dr. Rabeya Khatun', degree: 'MBBS, MS (Gynae)', specialty: 'Gynecology', districts: ['Dhaka'], clinics: ['c4'], schedule: 'Tue-Fri: 3 PM - 7 PM', availableToday: true, rating: 4.5, image: 'https://picsum.photos/200/200?doc=6' },
  { id: 'd7', name: 'Dr. Joynal Abedin', degree: 'MBBS, FCPS (Skin)', specialty: 'Dermatology', districts: ['Dhaka'], clinics: ['c5'], schedule: 'Sat-Sun: 7 PM - 10 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=7' },
  { id: 'd8', name: 'Dr. Kamal Uddin', degree: 'MBBS, MD (Chest)', specialty: 'Chest Specialist', districts: ['Chattogram'], clinics: ['c6'], schedule: 'Daily: 6 PM - 9 PM', availableToday: true, rating: 4.6, image: 'https://picsum.photos/200/200?doc=8' },
  { id: 'd9', name: 'Dr. Nusrat Jahan', degree: 'MBBS, DO', specialty: 'Eye Specialist', districts: ['Chattogram'], clinics: ['c7'], schedule: 'Sat-Thu: 10 AM - 2 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=9' },
  { id: 'd10', name: 'Dr. Tanvir Hasan', degree: 'MBBS, FCPS (Ortho)', specialty: 'Orthopedics', districts: ['Chattogram'], clinics: ['c8'], schedule: 'Mon-Wed: 5 PM - 9 PM', availableToday: false, rating: 4.7, image: 'https://picsum.photos/200/200?doc=10' },
];
