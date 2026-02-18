
import { Doctor, Clinic, Medicine } from './types';

export const DISTRICTS = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Nilphamari'];

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

export const MEDICINES: Medicine[] = [
  { id: 'm1', name: 'Napa Extend', price: 20, discount: 5, image: 'https://picsum.photos/200/200?med=1', description: 'ব্যথানাশক' },
  { id: 'm2', name: 'Seclo 20', price: 150, discount: 10, image: 'https://picsum.photos/200/200?med=2', description: 'এসিডিটি' },
  { id: 'm3', name: 'Fexo 120', price: 90, discount: 0, image: 'https://picsum.photos/200/200?med=3', description: 'এলার্জি' },
];

export const CLINICS: Clinic[] = [
  { id: 'c-madina', name: 'মদিনা ডায়াগনস্টিক ক্লিনিক এন্ড কনসালটেশন', district: 'Nilphamari', address: 'জেনারেল হাসপাতাল সড়ক ,হাসপাতাল মোড়, নীলফামারী', doctors: ['md1','md2','md3','md4','md5','md6','md7','md8','md9','md10','md11'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-mouno', name: 'মৌন জেনারেল হাসপাতাল', district: 'Nilphamari', address: 'নীলফামারী সদর', doctors: ['mou1'], image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-greensign', name: 'গ্রীন সাইন হাসপাতাল', district: 'Nilphamari', address: 'নীলফামারী সদর', doctors: ['gs1'], image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-ar', name: 'A.R. General Hospital', district: 'Nilphamari', address: 'Sadar Hospital Road, Nilphamari', doctors: ['ar1','ar2','ar3','ar4','ar5','ar6','ar7','ar8','ar9','ar10','ar11'], image: 'https://images.unsplash.com/photo-1587350859728-117699f8aee1?auto=format&fit=crop&q=80&w=800' },
  { id: 'c-ibadat', name: 'Ibadat Hospital', district: 'Nilphamari', address: 'Old Station Road, Nilphamari', doctors: ['ib1','ib2','ib3','ib4','ib5','ib6','ib7'], image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800' },
];

export const DOCTORS: Doctor[] = [
  // Madina Diagnostic Clinic Doctors
  { id: 'md1', name: 'ডাঃ মোঃ আব্দুল কাদের জিলানী', degree: 'MBBS, BCS, FCPS (Hematology)', specialty: 'হেমাটোলজি (রক্তরোগ) বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Fri: 9 AM - 3 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=md1' },
  { id: 'md2', name: 'ডাঃ মোঃ কায়কোবাদ হোসেন', degree: 'MBBS, BCS, FCPS, MD (Neurology)', specialty: 'মেডিসিন, নিউরোলজি ও গ্যাস্ট্রোএন্টারোলজি', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Mon-Wed: 3 PM - 8 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=md2' },
  { id: 'md3', name: 'ডাঃ মোস্তাফিজুর রহমান (সাকিব)', degree: 'MBBS, BCS, MD (Nephrology)', specialty: 'কিডনি রোগ ও মেডিসিন বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Fri: 4 PM-10 PM, Wed: 9 AM-8 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=md3' },
  { id: 'md4', name: 'ডাঃ আরিফুজ্জামান তুহিন', degree: 'MBBS, BCS, PGT, MD (Cardiology)', specialty: 'হৃদরোগ ও মেডিসিন বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Fri: 9 AM - 2 PM', availableToday: false, rating: 4.8, image: 'https://picsum.photos/200/200?doc=md4' },
  { id: 'md5', name: 'ডাঃ মোঃ আব্দুল কুদ্দুস', degree: 'MBBS, BCS, CCD, MCPS (Skin & VD)', specialty: 'চর্ম, যৌন ও এলার্জি রোগ বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Sun: 3 PM - 8 PM', availableToday: false, rating: 4.7, image: 'https://picsum.photos/200/200?doc=md5' },
  { id: 'md6', name: 'ডাঃ ধীমান প্রামাণিক', degree: 'MBBS (DMC), BCS, FCPS (ENT)', specialty: 'নাক, কান, গলা রোগ বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Tue: 3:30 PM - 8 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=md6' },
  { id: 'md7', name: 'ডাঃ মোঃ মাসুদ পারভেজ', degree: 'MBBS (SSMC), BCS, MD (Medicine)', specialty: 'মেডিসিন, নিউরো-মেডিসিন বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Sat-Thu: 4 PM - 8 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=md7' },
  { id: 'md8', name: 'ডাঃ মোঃ আসাদুজ্জামান (সুমন)', degree: 'MBBS, BCS, D-Ortho', specialty: 'হাড়-জোড়া, বাত-ব্যথা ও ট্রমা সার্জন', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Mon: 3 PM - 8 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=md8' },
  { id: 'md9', name: 'ডাঃ মোঃ মনিরুজ্জামান (মনি)', degree: 'MBBS, BCS, CCD, MS (Gynae)', specialty: 'প্রসূতি, বন্ধ্যাত্ব ও স্ত্রীরোগ বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=md9' },
  { id: 'md10', name: 'ডাঃ ইসরাত আজিজ (সুমি)', degree: 'MBBS, MS (Gynae & Obs)', specialty: 'গাইনী, প্রসূতি ও বন্ধ্যাত্ব বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Fri: 9 AM - 8 PM', availableToday: false, rating: 4.8, image: 'https://picsum.photos/200/200?doc=md10' },
  { id: 'md11', name: 'ডাঃ তাবাসসুম মাহজাবিন', degree: 'MBBS, BCS, FCPS (Pediatrics)', specialty: 'নবজাতক, শিশু ও কিশোর রোগ বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-madina'], schedule: 'Daily: 4 PM - 8 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=md11' },

  // Mouno General Hospital Doctors
  { id: 'mou1', name: 'ডাঃ আব্দুল্লাহ আল মামুন', degree: 'MBBS, MD', specialty: 'মেডিসিন বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-mouno'], schedule: 'Sat-Thu: 5 PM - 9 PM', availableToday: true, rating: 4.7, image: 'https://picsum.photos/200/200?doc=mou1' },

  // Green Sign Hospital Doctors
  { id: 'gs1', name: 'ডাঃ নাসরিন সুলতানা', degree: 'MBBS, FCPS (Gynae)', specialty: 'স্ত্রীরোগ ও প্রসূতি বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-greensign'], schedule: 'Daily: 4 PM - 8 PM', availableToday: true, rating: 4.8, image: 'https://picsum.photos/200/200?doc=gs1' },

  // A.R. General Hospital Doctors
  { id: 'ar1', name: 'Dr. Md. Moniruzzaman Moni', degree: 'MBBS, BCS, CCD (BIRDEM), MS (Gynae)', specialty: 'প্রসূতি ও স্ত্রীরোগ বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Daily: 3 PM - 9 PM', availableToday: true, rating: 4.9, image: 'https://picsum.photos/200/200?doc=ar1' },
  { id: 'ar3', name: 'Dr. Md. Ashekur Rahman', degree: 'MBBS, BCS, FCPS (Med), D-Card, MACP (USA)', specialty: 'মেডিসিন ও হৃদরোগ বিশেষজ্ঞ', districts: ['Nilphamari'], clinics: ['c-ar'], schedule: 'Fri: 10 AM - 8 PM', availableToday: false, rating: 4.9, image: 'https://picsum.photos/200/200?doc=ar3' },
];
