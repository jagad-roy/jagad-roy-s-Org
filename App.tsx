
import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, Doctor, Clinic, Medicine, LabTest } from './types';
import { DOCTORS, CLINICS, MEDICINES, LAB_TESTS, DISTRICTS, ABOUT_US_DATA, APP_VIDEOS } from './constants';
import { gemini } from './services/geminiService';
import { supabase } from './services/supabaseClient';

// --- Reusable Modern Components ---

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{ 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  className?: string,
  disabled?: boolean,
  loading?: boolean,
  type?: "button" | "submit"
}> = ({ children, onClick, variant = 'primary', className = "", disabled = false, loading = false, type = "button" }) => {
  const base = "px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700",
    secondary: "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200",
    outline: "bg-white border-2 border-slate-100 text-slate-600 hover:border-slate-300",
    ghost: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading}>
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : children}
    </button>
  );
};

const Input: React.FC<{
  label: string,
  type?: string,
  placeholder?: string,
  value: string,
  onChange: (val: string) => void,
  required?: boolean
}> = ({ label, type = "text", placeholder, value, onChange, required = false }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
    />
  </div>
);

// --- Sub-components ---

const VideoCard: React.FC<{ video: typeof APP_VIDEOS[0] }> = ({ video }) => (
  <Card className="overflow-hidden group flex flex-col h-full cursor-pointer hover:border-blue-400">
    <div className="relative aspect-video">
      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-xl">
           <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5l11 6.5-11 6.5z"/></svg>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 bg-black/80 text-[8px] font-black text-white px-2 py-1 rounded-md uppercase tracking-widest">
        Watch on YouTube
      </div>
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{video.title}</h3>
      <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{video.description}</p>
      <div className="mt-auto pt-4 flex items-center text-blue-600 font-black text-[9px] uppercase tracking-widest">
        প্লে করুন <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
      </div>
    </div>
  </Card>
);

const HospitalCard: React.FC<{ hospital: Clinic }> = ({ hospital }) => (
  <Card className="overflow-hidden group">
    <div className="h-36 relative overflow-hidden">
      <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-3 left-3">
        <span className="bg-white/20 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded-lg font-bold border border-white/20 uppercase">
          {hospital.district}
        </span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-slate-800 text-sm truncate">{hospital.name}</h3>
      <p className="text-[10px] text-slate-500 mt-1 flex items-center">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        {hospital.address}
      </p>
    </div>
  </Card>
);

const DoctorCard: React.FC<{ doctor: Doctor, onConsult: (id: string) => void, isLoggedIn: boolean }> = ({ doctor, onConsult, isLoggedIn }) => (
  <Card className="p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
    <div className="relative shrink-0">
      <img src={doctor.image} alt={doctor.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50" />
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${doctor.availableToday ? 'bg-green-500' : 'bg-slate-300'}`}></div>
    </div>
    <div className="flex-1 text-center sm:text-left min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <h3 className="font-bold text-slate-800 text-base truncate">{doctor.name}</h3>
          <button 
            onClick={() => onConsult(doctor.id)}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group/btn"
            title="ভিডিও কল"
          >
            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-black uppercase tracking-tighter">
          {doctor.specialty}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{doctor.degree}</p>
      <div className="mt-3 flex items-center justify-center sm:justify-start gap-4">
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-800">⭐ {doctor.rating}</p>
          <p className="text-[8px] text-slate-400 uppercase font-bold">Rating</p>
        </div>
        <div className="w-px h-6 bg-slate-100"></div>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-800">500+</p>
          <p className="text-[8px] text-slate-400 uppercase font-bold">Patients</p>
        </div>
      </div>
      <Button 
        variant={isLoggedIn ? 'primary' : 'outline'} 
        onClick={() => onConsult(doctor.id)}
        className="mt-4 w-full sm:w-auto text-[10px] py-2"
      >
        {isLoggedIn ? 'ভিডিও কল করুন' : 'লগিন করে শুরু করুন'}
      </Button>
    </div>
  </Card>
);

const MedicineItem: React.FC<{ medicine: Medicine, onOrder: () => void }> = ({ medicine, onOrder }) => (
  <Card className="p-4 flex flex-col items-center group">
    <div className="w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3 relative">
      <img src={medicine.image} alt={medicine.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
      {medicine.discount > 0 && (
        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-sm animate-pulse">
          -{medicine.discount}%
        </span>
      )}
    </div>
    <h4 className="text-xs font-bold text-slate-800 text-center line-clamp-1 h-4">{medicine.name}</h4>
    <div className="flex items-center gap-2 mt-2 mb-4">
      <span className="text-sm font-black text-blue-600">৳{Math.round(medicine.price * (1 - medicine.discount / 100))}</span>
      <span className="text-[10px] text-slate-300 line-through">৳{medicine.price}</span>
    </div>
    <Button variant="secondary" onClick={onOrder} className="w-full text-[9px] py-2">
      কার্টে যোগ করুন
    </Button>
  </Card>
);

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [profileSubTab, setProfileSubTab] = useState<'overview' | 'appointments' | 'orders'>('overview');
  const [doctorSubTab, setDoctorSubTab] = useState<'dashboard' | 'availability'>('dashboard');
  
  // Search States
  const [directorySearch, setDirectorySearch] = useState('');
  const [healthSearch, setHealthSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  
  const [selectedDistrict, setSelectedDistrict] = useState('Dhaka');
  const [showSubscription, setShowSubscription] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLabBooking, setShowLabBooking] = useState(false);
  
  // Login/Registration State
  const [loginStep, setLoginStep] = useState<'role' | 'auth'>('role');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedLoginRole, setSelectedLoginRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [geminiResult, setGeminiResult] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Dynamic Content States from Supabase
  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Lab Booking Form State
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  // Doctor Availability Mock State
  const [isDoctorAvailable, setIsDoctorAvailable] = useState(true);
  const [doctorSchedule, setDoctorSchedule] = useState('Sat-Thu: 5 PM - 9 PM');

  // Specialties Extraction
  const specialties = useMemo(() => ['All', ...Array.from(new Set(DOCTORS.map(d => d.specialty)))], []);

  // Initial Auth Sync
  useEffect(() => {
    const syncAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) setRole(profile.role as UserRole);
        }
      } catch (err) {
        console.error("Auth sync failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    syncAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setRole(profile.role as UserRole);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch User Specific Data
  useEffect(() => {
    if (user && role === UserRole.PATIENT) {
      fetchPatientData();
    }
  }, [user, role]);

  const fetchPatientData = async () => {
    if (!user) return;
    try {
      const { data: appts, error: apptErr } = await supabase.from('appointments').select('*').eq('patient_id', user.id).order('appointment_date', { ascending: false });
      const { data: ords, error: ordErr } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      
      if (apptErr || ordErr) {
        setDbError("ডাটাবেস টেবিল পাওয়া যায়নি। অনুগ্রহ করে SQL কোডটি রান করুন।");
      } else {
        if (appts) setAppointments(appts);
        if (ords) setOrders(ords);
        setDbError(null);
      }
    } catch (err) {
      console.error("Data fetch failed:", err);
    }
  };

  // Authentication Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoginRole || !email || !password) return;
    if (authMode === 'register' && !fullName) return;

    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedLoginRole
            }
          }
        });

        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').upsert({ 
            id: data.user.id, 
            role: selectedLoginRole, 
            full_name: fullName 
          });
          setUser(data.user);
          setRole(selectedLoginRole);
          alert("নিবন্ধন সফল হয়েছে! অনুগ্রহ করে আপনার ইমেইল চেক করুন।");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          if (profile) setRole(profile.role as UserRole);
        }
      }
      
      setShowLoginModal(false);
      resetAuthFields();
    } catch (err: any) {
      alert(err.message || "অথেন্টিকেশন ব্যর্থ হয়েছে।");
    } finally {
      setAuthLoading(false);
    }
  };

  const resetAuthFields = () => {
    setLoginStep('role');
    setAuthMode('login');
    setSelectedLoginRole(null);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setUser(null);
    setActiveTab('home');
    setProfileSubTab('overview');
    setDoctorSubTab('dashboard');
  };

  const handleProtectedAction = (action: () => void) => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      action();
    }
  };

  // Directory Filtering (Search Bar 1)
  const filteredClinics = useMemo(() => {
    return CLINICS.filter(c => 
      c.district === selectedDistrict && 
      (c.name.toLowerCase().includes(directorySearch.toLowerCase()) || 
       c.address.toLowerCase().includes(directorySearch.toLowerCase()))
    );
  }, [selectedDistrict, directorySearch]);

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
                            d.specialty.toLowerCase().includes(directorySearch.toLowerCase()) ||
                            d.degree.toLowerCase().includes(directorySearch.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All' || d.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [directorySearch, selectedSpecialty]);

  // AI Health Assistant (Search Bar 2)
  const handleAIHealthSearch = async () => {
    if (!healthSearch) return;
    setGeminiResult('আপনার জিজ্ঞাসিত স্বাস্থ্য তথ্য বিশ্লেষণ করছি...');
    const result = await gemini.consultHealth(healthSearch);
    setGeminiResult(result || '');
  };

  const startConsultation = (doctorId: string) => {
    handleProtectedAction(() => {
      setShowSubscription(true);
    });
  };

  const handleBookLabTest = async () => {
    if (!selectedLabTest || !bookingDate || !bookingTime || !user) return;

    try {
      const { data, error } = await supabase.from('orders').insert({
        user_id: user.id,
        type: 'Lab Test',
        items: selectedLabTest.name,
        total_price: selectedLabTest.price,
        status: 'Processing',
        created_at: new Date().toISOString()
      }).select().single();

      if (!error && data) {
        setOrders([data, ...orders]);
        setShowLabBooking(false);
        setSelectedLabTest(null);
        setBookingDate('');
        setBookingTime('');
      } else if (error) {
        alert("অর্ডার সেভ করা যায়নি। সম্ভবত ডাটাবেস টেবিল তৈরি হয়নি।");
      }
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">JB Healthcare Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-2xl relative overflow-hidden">
      
      {/* DB Error Banner */}
      {dbError && (
        <div className="bg-red-600 text-white text-[10px] py-2 px-6 text-center font-bold animate-pulse z-50">
          ⚠️ {dbError}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div onClick={() => { setActiveTab('home'); setProfileSubTab('overview'); setDoctorSubTab('dashboard'); }} className="cursor-pointer group">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-1 block">
            {role ? `Portal: ${role}` : 'Public Directory'}
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${!role ? 'bg-slate-300' : role === UserRole.PATIENT ? 'bg-blue-500 animate-pulse' : role === UserRole.DOCTOR ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">JB Healthcare</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={handleLogout} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          ) : (
            <Button onClick={() => setShowLoginModal(true)} className="px-5 h-10 text-[10px]">প্রবেশ</Button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 mobile-p-safe">
        
        {/* Dynamic User Views */}
        {(role === UserRole.PATIENT || !role) && (
          <div className="space-y-8 page-transition">
            
            {/* SEARCH SECTION: TWO SEARCH BARS (HOME TAB ONLY) */}
            {activeTab === 'home' && (
              <section className="space-y-6">
                
                {/* Search Bar 1: Directory Search */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">ডিরেক্টরি সার্চ (ডাক্তার ও হাসপাতাল)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="ডাক্তার, ক্লিনিক বা বিশেষত্ব খুঁজুন..."
                      className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                      value={directorySearch}
                      onChange={(e) => setDirectorySearch(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Search Bar 2: AI Health Assistant */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase ml-2 tracking-widest">AI হেলথ অ্যাসিস্ট্যান্ট (স্মার্ট পরামর্শ)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="রোগের লক্ষণ, চিকিৎসা বা প্রতিকার জানতে লিখুন..."
                      className="w-full pl-12 pr-14 py-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-[28px] shadow-sm border border-indigo-100 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-bold text-slate-700 placeholder:text-indigo-200"
                      value={healthSearch}
                      onChange={(e) => setHealthSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAIHealthSearch()}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <button 
                      onClick={handleAIHealthSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>

                {/* Gemini AI Result Rendering */}
                {geminiResult && (
                  <Card className="bg-white border-indigo-100 p-6 animate-in slide-in-from-top-4 border-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 text-white p-1.5 rounded-xl shadow-md">✨</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">AI Health Report</span>
                      </div>
                      <button onClick={() => setGeminiResult('')} className="text-slate-300 hover:text-red-400 transition-colors">✕</button>
                    </div>
                    <div className="text-xs leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
                      {geminiResult}
                    </div>
                  </Card>
                )}
              </section>
            )}

            {/* Home Tab Content */}
            {activeTab === 'home' && (
              <div className="space-y-10">
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-black text-slate-800">বিশেষজ্ঞগণ</h2>
                    {directorySearch && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-black uppercase tracking-widest">ফলাফল: {filteredDoctors.length}</span>}
                  </div>
                  
                  {/* Specialty Filter List */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 -mx-1 px-1">
                    {specialties.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSpecialty(s)}
                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${selectedSpecialty === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200'}`}
                      >
                        {s === 'All' ? 'সব বিভাগ' : s}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {filteredDoctors.slice(0, 10).map(doc => (
                      <DoctorCard key={doc.id} doctor={doc} onConsult={startConsultation} isLoggedIn={!!user} />
                    ))}
                    {filteredDoctors.length === 0 && <p className="text-center text-slate-400 py-10 text-xs italic">কোন ডাক্তার পাওয়া যায়নি</p>}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-black text-slate-800">হাসপাতাল ও ক্লিনিক</h2>
                    <select 
                      value={selectedDistrict} 
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="bg-white border border-slate-100 rounded-xl text-[10px] font-black px-4 py-2 outline-none shadow-sm focus:ring-2 focus:ring-blue-100"
                    >
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {filteredClinics.slice(0, 4).map(clinic => (
                      <HospitalCard key={clinic.id} hospital={clinic} />
                    ))}
                  </div>
                  {directorySearch && filteredClinics.length === 0 && <p className="text-center text-slate-400 py-6 text-xs italic">এই এরিয়ায় কোন হাসপাতাল পাওয়া যায়নি</p>}
                </section>
              </div>
            )}

            {/* Video Tab Content */}
            {activeTab === 'videos' && (
              <div className="space-y-8 py-4 page-transition">
                <section className="bg-blue-600 p-8 rounded-[40px] text-white relative overflow-hidden">
                   <h2 className="text-2xl font-black relative z-10 tracking-tight">ভিডিও গাইড</h2>
                   <p className="text-[10px] opacity-80 mt-2 font-black uppercase tracking-widest relative z-10">অ্যাপ ব্যবহারের নিয়ম ও স্বাস্থ্য টিপস</p>
                   <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </section>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {APP_VIDEOS.map(video => (
                    <div key={video.id} onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}>
                      <VideoCard video={video} />
                    </div>
                  ))}
                </div>

                <Card className="p-8 bg-slate-900 text-white text-center border-none">
                  <h4 className="text-base font-black mb-2 italic">আরো তথ্যের জন্য</h4>
                  <p className="text-[10px] opacity-60 uppercase tracking-[0.2em] font-bold">আমাদের অফিশিয়াল ইউটিউব চ্যানেল সাবস্ক্রাইব করুন</p>
                  <Button variant="danger" className="mt-6 mx-auto px-10 text-[10px]" onClick={() => window.open('https://youtube.com', '_blank')}>
                    Subscribe to YouTube
                  </Button>
                </Card>
              </div>
            )}

            {/* About Us Tab Content */}
            {activeTab === 'about' && (
              <div className="space-y-8 py-4 page-transition">
                <section className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden text-center">
                  <h2 className="text-2xl font-black relative z-10 tracking-tight">আমাদের সম্পর্কে</h2>
                  <p className="text-[10px] opacity-60 mt-2 font-bold uppercase tracking-widest relative z-10">JB Healthcare - আপনার স্বাস্থ্য আমাদের অগ্রাধিকার</p>
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
                </section>

                <div className="space-y-6">
                  <Card className="p-8 border-l-4 border-l-blue-600">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🎯</div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">আমাদের মিশন</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{ABOUT_US_DATA.mission}</p>
                  </Card>

                  <Card className="p-8 border-l-4 border-l-indigo-600">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🚀</div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">আমাদের ভিশন</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{ABOUT_US_DATA.vision}</p>
                  </Card>

                  <section className="space-y-4 pt-4">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight ml-2">আমাদের টিম</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {ABOUT_US_DATA.team.map((member, i) => (
                        <Card key={i} className="p-4 flex items-center gap-4 group hover:border-blue-200">
                          <img src={member.image} alt={member.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50 group-hover:scale-105 transition-transform" />
                          <div>
                            <h4 className="font-bold text-slate-800 text-base">{member.name}</h4>
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{member.role}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'pharmacy' && (
              <section className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden">
                   <h2 className="text-xl font-black relative z-10">মেডিসিন ডেলিভারি</h2>
                   <p className="text-xs opacity-60 mt-2 relative z-10">অনলাইনে ঔষধ অর্ডার করুন ৩০ মিনিটে ডেলিভারি!</p>
                   <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {MEDICINES.map(med => (
                    <MedicineItem key={med.id} medicine={med} onOrder={() => handleProtectedAction(() => {})} />
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'clinics' && (
              <section className="space-y-6">
                <h2 className="text-xl font-black text-slate-800">সব হাসপাতাল ({selectedDistrict})</h2>
                <div className="space-y-4">
                  {filteredClinics.map(clinic => (
                    <Card key={clinic.id} className="p-4 flex gap-4 group cursor-pointer hover:border-blue-200">
                        <img src={clinic.image} className="w-20 h-20 rounded-2xl object-cover group-hover:scale-105 transition-transform" />
                        <div className="flex-1 flex flex-col justify-center">
                            <h4 className="font-bold text-slate-800 text-sm">{clinic.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-1">{clinic.address}</p>
                            <div className="mt-3 flex gap-2">
                                <span className="bg-slate-50 text-slate-500 text-[8px] font-black px-2 py-1 rounded-lg border border-slate-100 uppercase">Emergency 24/7</span>
                            </div>
                        </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'profile' && (
              <section className="space-y-8 py-4">
                {user ? (
                  profileSubTab === 'overview' ? (
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-28 bg-blue-100 rounded-[40px] flex items-center justify-center text-5xl mb-6 shadow-inner ring-8 ring-blue-50">👤</div>
                      <h3 className="text-xl font-black text-slate-800">{user.email?.split('@')[0].toUpperCase()}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: #{user.id.slice(0, 8)}</p>
                      
                      <div className="mt-10 w-full space-y-4">
                          <Button variant="outline" className="w-full text-xs py-5" onClick={() => setProfileSubTab('appointments')}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            আমার অ্যাপয়েন্টমেন্টসমূহ
                          </Button>
                          <Button variant="outline" className="w-full text-xs py-5" onClick={() => setProfileSubTab('orders')}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                            আমার অর্ডারসমূহ
                          </Button>
                          <Button variant="outline" className="w-full text-xs py-5">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            মেডিকেল হিস্টোরি
                          </Button>
                          <Button variant="danger" onClick={handleLogout} className="w-full text-xs mt-6">লগ-আউট করুন</Button>
                      </div>
                    </div>
                  ) : profileSubTab === 'appointments' ? (
                    <div className="space-y-6 page-transition">
                      <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => setProfileSubTab('overview')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <h2 className="text-xl font-black text-slate-800">আমার অ্যাপয়েন্টমেন্টসমূহ</h2>
                      </div>
                      
                      <div className="space-y-4">
                        {appointments.map(app => (
                          <Card key={app.id} className="p-5 border-l-4 border-l-blue-500">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm">{app.doctor_name}</h4>
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">{app.clinic}</p>
                              </div>
                              <span className={`text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${app.status === 'Upcoming' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {app.status === 'Upcoming' ? 'আসন্ন' : 'সম্পন্ন'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                                <div className="flex items-center text-[10px] text-slate-500 font-bold">
                                  <svg className="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                  {app.appointment_date}
                                </div>
                                <div className="flex items-center text-[10px] text-slate-500 font-bold">
                                  <svg className="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                  {app.time}
                                </div>
                            </div>
                          </Card>
                        ))}
                        {appointments.length === 0 && <p className="text-center text-slate-400 py-10 text-xs italic">কোন অ্যাপয়েন্টমেন্ট নেই</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 page-transition">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <button onClick={() => setProfileSubTab('overview')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                          </button>
                          <h2 className="text-xl font-black text-slate-800">আমার অর্ডারসমূহ</h2>
                        </div>
                        <Button 
                          variant="primary" 
                          className="px-4 py-2 text-[9px] h-9" 
                          onClick={() => setShowLabBooking(true)}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                          বুক ল্যাব টেস্ট
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {orders.map(order => (
                          <Card key={order.id} className="p-5 border-l-4 border-l-orange-500">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-slate-50 rounded-lg text-lg">
                                  {order.type === 'Medicine' ? '💊' : '🧪'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm">অর্ডার #{order.id.slice(0, 5)}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <span className={`text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${order.status === 'Delivered' || order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="py-2">
                              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{order.items}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-black uppercase">মোট খরচ:</span>
                                <span className="text-sm font-black text-blue-600">৳{order.total_price}</span>
                            </div>
                          </Card>
                        ))}
                        {orders.length === 0 && <p className="text-center text-slate-400 py-10 text-xs italic">কোন অর্ডার নেই</p>}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🔒</div>
                    <h2 className="text-xl font-black text-slate-800">প্রোফাইল দেখতে লগিন করুন</h2>
                    <p className="text-xs text-slate-400 max-w-[250px] mx-auto">আপনার অ্যাপয়েন্টমেন্ট, রিপোর্ট এবং হিস্টোরি ম্যানেজ করতে লগিন করা প্রয়োজন।</p>
                    <Button onClick={() => setShowLoginModal(true)} className="mx-auto mt-4 px-10">লগিন</Button>
                  </div>
                )}
              </section>
            )}

          </div>
        )}

        {/* Doctor Dashboard View */}
        {role === UserRole.DOCTOR && user && (
          <div className="space-y-8 page-transition">
            {doctorSubTab === 'dashboard' ? (
              <>
                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black">স্বাগতম, {user.email?.split('@')[0]}!</h2>
                      <p className="text-xs opacity-60 mt-2 font-medium">আজ আপনার ৫ জন পেশেন্ট অপেক্ষমান।</p>
                    </div>
                    <button 
                      onClick={() => setDoctorSubTab('availability')}
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/10 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </button>
                  </div>
                  <div className="absolute -right-8 -top-8 w-48 h-48 bg-blue-600/30 rounded-full blur-3xl"></div>
                </div>

                <section className="space-y-4">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest ml-2">আজকের সিরিয়াল</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'করিম হোসেন', time: '০৬:৩০ PM', status: 'Live Now', id: '#P-991' },
                            { name: 'তাসলিমা বেগম', time: '০৭:০০ PM', status: 'Pending', id: '#P-992' }
                        ].map((p, i) => (
                            <Card key={i} className="p-5 flex items-center justify-between hover:border-blue-500">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{p.id} • {p.time}</p>
                                </div>
                                <Button variant={p.status === 'Live Now' ? 'primary' : 'outline'} className="text-[9px] py-2">
                                    {p.status === 'Live Now' ? 'কল দিন' : 'অপেক্ষা করুন'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </section>
              </>
            ) : (
              <div className="space-y-8 page-transition">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setDoctorSubTab('dashboard')}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">অ্যাভেইলিবিলিটি এবং শিডিউল</h2>
                </div>

                <Card className="p-8 space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                    <div>
                      <h4 className="font-black text-sm text-slate-800">অ্যাভেইলিবিলিটি স্ট্যাটাস</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">আপনি অনলাইন থাকলে রোগীরা কল দিতে পারবে</p>
                    </div>
                    <button 
                      onClick={() => setIsDoctorAvailable(!isDoctorAvailable)}
                      className={`w-14 h-8 rounded-full transition-all relative ${isDoctorAvailable ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isDoctorAvailable ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest">ক্লিনিক শিডিউল</h4>
                    <div className="space-y-4">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">General Clinic</label>
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300"
                            placeholder="যেমন: Sat-Thu: 5 PM - 9 PM"
                            defaultValue={doctorSchedule}
                            onChange={(e) => setDoctorSchedule(e.target.value)}
                          />
                        </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setDoctorSubTab('dashboard')} className="w-full mt-4">শিডিউল সেভ করুন</Button>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Moderator / Admin Dashboard */}
        {role === UserRole.ADMIN && user && (
          <div className="space-y-8 page-transition">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">মডারেটর প্যানেল</h2>
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {[
                    { l: 'হাসপাতাল', s: 'আপডেট ডিরেক্টরি', i: '🏥', c: 'blue' },
                    { l: 'ডাক্তার', s: 'ভেরিফিকেশন', i: '🩺', c: 'green' },
                    { l: 'অর্ডার', s: 'মেডিসিন স্টক', i: '💊', c: 'orange' },
                    { l: 'সেটিংস', s: 'অ্যাপ কনফিগার', i: '⚙️', c: 'slate' }
                ].map((m, i) => (
                    <Card key={i} className="p-6 text-center hover:-translate-y-1 group">
                        <div className={`w-14 h-14 mx-auto bg-${m.c}-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>{m.i}</div>
                        <h4 className="font-black text-slate-800 text-xs">{m.l}</h4>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{m.s}</p>
                    </Card>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Lab Booking Modal */}
      {showLabBooking && (
        <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-8 border border-white animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-800">ল্যাব টেস্ট বুকিং</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">হোম স্যাম্পল কালেকশন</p>
              </div>
              <button onClick={() => { setShowLabBooking(false); setSelectedLabTest(null); }} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
              {/* Test Selection */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">টেস্ট নির্বাচন করুন</label>
                <div className="space-y-2">
                  {LAB_TESTS.map(test => (
                    <button 
                      key={test.id}
                      onClick={() => setSelectedLabTest(test)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${selectedLabTest?.id === test.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-50 hover:border-slate-200'}`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{test.name}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">{test.description}</p>
                      </div>
                      <span className="text-xs font-black text-blue-600">৳{test.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date/Time Selection */}
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">তারিখ</label>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">সময়</label>
                      <select 
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                      >
                        <option value="">নির্বাচন করুন</option>
                        <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                        <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                        <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      </select>
                   </div>
                </div>
              </div>
            </div>

            <div className="pt-6 shrink-0">
               <Button 
                onClick={handleBookLabTest} 
                className="w-full py-4 rounded-[24px]"
                disabled={!selectedLabTest || !bookingDate || !bookingTime}
               >
                 বুকিং সম্পন্ন করুন
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Role-Based Login/Register Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[48px] shadow-2xl p-8 border border-white animate-in zoom-in duration-300 relative overflow-hidden">
            
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-200">
                <span className="text-2xl font-black text-white italic">JB</span>
              </div>
              <button onClick={() => { setShowLoginModal(false); resetAuthFields(); }} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">✕</button>
            </div>
            
            <h2 className="text-2xl font-black text-slate-800">
                {loginStep === 'role' ? 'আপনার রোল কি?' : (authMode === 'login' ? 'প্রবেশ করুন' : 'নিবন্ধন করুন')}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                {loginStep === 'role' ? 'সঠিক ক্যাটাগরি নির্বাচন করে এগিয়ে যান' : `${selectedLoginRole} হিসেবে ${authMode === 'login' ? 'লগিন' : 'নিবন্ধন'} হচ্ছে`}
            </p>
            
            <div className="mt-8 space-y-4">
              {loginStep === 'role' ? (
                <>
                  <button 
                    onClick={() => { setSelectedLoginRole(UserRole.PATIENT); setLoginStep('auth'); }} 
                    className="w-full bg-blue-50/50 p-5 rounded-[28px] border-2 border-transparent hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center text-left group"
                  >
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform">👤</div>
                    <div>
                        <h4 className="font-black text-slate-800 text-sm tracking-tight">পেশেন্ট (রোগী)</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">কনসালটেশন ও ঔষধ</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setSelectedLoginRole(UserRole.DOCTOR); setLoginStep('auth'); }} 
                    className="w-full bg-green-50/50 p-5 rounded-[28px] border-2 border-transparent hover:border-green-500 hover:bg-green-50 transition-all flex items-center text-left group"
                  >
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform">🩺</div>
                    <div>
                        <h4 className="font-black text-slate-800 text-sm tracking-tight">ডাক্তার</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">পেশেন্ট পোর্টাল</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setSelectedLoginRole(UserRole.ADMIN); setLoginStep('auth'); }} 
                    className="w-full bg-red-50/50 p-5 rounded-[28px] border-2 border-transparent hover:border-red-500 hover:bg-red-50 transition-all flex items-center text-left group"
                  >
                    <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform">⚙️</div>
                    <div>
                        <h4 className="font-black text-slate-800 text-sm tracking-tight">মডারেটর</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">অ্যাডমিন কন্ট্রোল</p>
                    </div>
                  </button>
                </>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="flex bg-slate-50 p-1.5 rounded-[20px] mb-4">
                        <button 
                          type="button"
                          onClick={() => setAuthMode('login')}
                          className={`flex-1 py-2 text-[10px] font-black uppercase rounded-[14px] transition-all ${authMode === 'login' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                        >লগিন</button>
                        <button 
                          type="button"
                          onClick={() => setAuthMode('register')}
                          className={`flex-1 py-2 text-[10px] font-black uppercase rounded-[14px] transition-all ${authMode === 'register' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                        >নিবন্ধন</button>
                    </div>

                    <button type="button" onClick={() => setLoginStep('role')} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
                        ← রোল পরিবর্তন করুন
                    </button>

                    <div className="space-y-4">
                        {authMode === 'register' && (
                          <Input 
                            label="আপনার নাম" 
                            placeholder="পুরো নাম লিখুন" 
                            value={fullName} 
                            onChange={setFullName} 
                            required 
                          />
                        )}
                        <Input 
                          label="ইমেইল অ্যাড্রেস" 
                          type="email" 
                          placeholder="example@mail.com" 
                          value={email} 
                          onChange={setEmail} 
                          required 
                        />
                        <Input 
                          label="পাসওয়ার্ড" 
                          type="password" 
                          placeholder="••••••••" 
                          value={password} 
                          onChange={setPassword} 
                          required 
                        />
                        
                        <Button type="submit" loading={authLoading} className="w-full py-5 rounded-[24px]">
                          {authMode === 'login' ? 'লগিন করুন' : 'নিবন্ধন সম্পন্ন করুন'}
                        </Button>
                    </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscription && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <Card className="w-full max-w-sm p-10 space-y-8 animate-in slide-in-from-bottom duration-500 rounded-[50px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">💎</div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">মেম্বারশিপ প্ল্যান</h3>
              <p className="text-xs text-slate-400 mt-3 px-4 leading-relaxed font-medium">ডাক্তারের সাথে ভিডিও কলে কথা বলতে এবং আকর্ষণীয় ছাড় পেতে সাবস্ক্রাইব করুন।</p>
            </div>
            <div className="space-y-3">
              <button className="w-full p-5 border-2 border-blue-600 rounded-[32px] flex justify-between items-center bg-blue-50/50 group relative overflow-hidden transition-all">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[7px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Recommended</div>
                <div className="text-left">
                  <p className="font-black text-slate-800 text-sm tracking-tight">মাসিক গোল্ড প্ল্যান</p>
                </div>
                <p className="font-black text-blue-600 text-base">৳৯৯</p>
              </button>
              <button className="w-full p-5 border-2 border-slate-50 rounded-[32px] flex justify-between items-center hover:border-slate-200 transition-all bg-white">
                <p className="font-black text-slate-800 text-sm tracking-tight">একক সেশন</p>
                <p className="font-black text-slate-800 text-base">৳৪৯</p>
              </button>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={() => setShowSubscription(false)} className="flex-1 text-[10px]">পরে করব</Button>
              <Button onClick={() => { setShowSubscription(false); setIsConsulting(true); }} className="flex-1 text-[10px]">সাবস্ক্রাইব</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Video Consulting Interface */}
      {isConsulting && (
        <div className="fixed inset-0 z-[120] bg-slate-950 flex flex-col items-center justify-between p-10 text-white animate-in zoom-in duration-500">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
                <img src="https://picsum.photos/200/200?doc=1" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/20 shadow-2xl" />
                <div>
                    <h3 className="font-black text-sm">Dr. Ahmed Khan</h3>
                    <p className="text-[9px] text-green-400 font-black uppercase tracking-[0.2em] animate-pulse">Live Consulting...</p>
                </div>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl font-mono text-xs font-black tracking-widest border border-white/5">12:45</div>
          </div>

          <div className="w-full flex-1 my-10 bg-slate-900 rounded-[60px] relative overflow-hidden border border-white/5 shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
             <div className="w-full h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                <div className="w-20 h-20 border-4 border-white/10 rounded-full border-t-blue-500 animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-[0.3em]">Encrypted Session</p>
             </div>
             <div className="absolute bottom-8 right-8 w-32 h-44 bg-slate-800 rounded-3xl border border-white/10 shadow-2xl overflow-hidden ring-4 ring-black/20">
                <img src="https://picsum.photos/200/200?user" className="w-full h-full object-cover grayscale opacity-80" />
                <div className="absolute bottom-2 left-3 text-[8px] bg-black/60 backdrop-blur-md px-2 py-1 rounded-md font-black uppercase tracking-widest">YOU</div>
             </div>
          </div>

          <div className="flex gap-8 items-center">
            <button className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-xl hover:bg-white/20 border border-white/5">🎤</button>
            <button onClick={() => setIsConsulting(false)} className="w-24 h-24 bg-red-600 rounded-[36px] flex items-center justify-center text-3xl hover:bg-red-700 shadow-2xl shadow-red-900/40 active:scale-90 transition-all">📞</button>
            <button className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-xl hover:bg-white/20 border border-white/5">📷</button>
          </div>
        </div>
      )}

      {/* Navigation Footer (Visible for Patient/Guest) */}
      {(role === UserRole.PATIENT || !role) && (
      <nav className="fixed bottom-6 left-6 right-6 z-50 max-w-lg mx-auto bg-slate-900/90 backdrop-blur-2xl flex items-center justify-around py-5 px-3 rounded-[36px] shadow-2xl ring-1 ring-white/10 animate-in slide-in-from-bottom duration-700 overflow-hidden">
        {[
            { id: 'home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'হোম' },
            { id: 'clinics', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'ক্লিনিক' },
            { id: 'pharmacy', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', label: 'শপ' },
            { id: 'videos', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'ভিডিও' },
            { id: 'about', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'তথ্য' },
            { id: 'profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'প্রোফাইল' }
        ].map(item => (
            <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setProfileSubTab('overview'); }}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === item.id ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <svg className="w-5 h-5" fill={activeTab === item.id ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/></svg>
                <span className={`text-[7px] font-black uppercase tracking-widest leading-none ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
            </button>
        ))}
      </nav>
      )}
    </div>
  );
}
