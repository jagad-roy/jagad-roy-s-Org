
import { Doctor, Clinic, Medicine, LabTest } from './types';

export const DISTRICTS = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna'];

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
];

export const CLINICS: Clinic[] = [
  { id: 'c1', name: 'Dhaka General Hospital', district: 'Dhaka', address: 'Dhanmondi, Dhaka', doctors: ['d1'], image: 'https://picsum.photos/400/300?hosp=1' },
  { id: 'c2', name: 'Care Medical Center', district: 'Dhaka', address: 'Mirpur, Dhaka', doctors: ['d2'], image: 'https://picsum.photos/400/300?hosp=2' },
];

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Ahmed Khan', degree: 'MBBS, FCPS', specialty: 'Medicine', districts: ['Dhaka'], clinics: ['c1'], schedule: 'Sat-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=1' },
  { id: 'd2', name: 'Dr. Sarah Rahman', degree: 'MBBS, MD', specialty: 'Cardiology', districts: ['Dhaka'], clinics: ['c2'], schedule: 'Sun-Wed: 6 PM - 10 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=2' },
];
