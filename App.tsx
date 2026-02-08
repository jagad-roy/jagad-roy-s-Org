
import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, Doctor, Clinic, Medicine, LabTest } from './types';
import { DOCTORS, CLINICS, MEDICINES, LAB_TESTS, DISTRICTS, ABOUT_US_DATA, APP_VIDEOS } from './constants';
import { gemini } from './services/geminiService';
import { supabase } from './services/supabaseClient';

// --- Reusable Modern Components ---

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
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
  <Card className="overflow-hidden group flex flex-col h-full cursor-pointer hover:border-red-400">
    <div className="relative aspect-video">
      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 shadow-xl">
           <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5l11 6.5-11 6.5z"/></svg>
        </div>
      </div>
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{video.title}</h3>
      <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{video.description}</p>
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
        {isLoggedIn ? 'ভিডিও কল করুন' : 'লগিন করুন'}
      </Button>
    </div>
  </Card>
);

const MedicineItem: React.FC<{ medicine: Medicine, onOrder: () => void }> = ({ medicine, onOrder }) => (
  <Card className="p-4 flex flex-col items-center group">
    <div className="w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3 relative border border-slate-50">
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
  
  const [directorySearch, setDirectorySearch] = useState('');
  const [healthSearch, setHealthSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  
  const [selectedDistrict, setSelectedDistrict] = useState('Dhaka');
  const [showSubscription, setShowSubscription] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLabBooking, setShowLabBooking] = useState(false);
  
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

  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const specialties = useMemo(() => ['All', ...Array.from(new Set(DOCTORS.map(d => d.specialty)))], []);

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
        setDbError("ডাটাবেস টেবিল পাওয়া যায়নি। অনুগ্রহ করে সেটিংস চেক করুন।");
      } else {
        if (appts) setAppointments(appts);
        if (ords) setOrders(ords);
        setDbError(null);
      }
    } catch (err) {
      console.error("Data fetch failed:", err);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoginRole || !email || !password) return;
    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: fullName, role: selectedLoginRole } }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, role: selectedLoginRole, full_name: fullName });
          setUser(data.user);
          setRole(selectedLoginRole);
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
    } catch (err: any) {
      alert(err.message || "অথেন্টিকেশন ব্যর্থ হয়েছে।");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setUser(null);
    setActiveTab('home');
  };

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
                            d.specialty.toLowerCase().includes(directorySearch.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All' || d.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [directorySearch, selectedSpecialty]);

  const handleAIHealthSearch = async () => {
    if (!healthSearch) return;
    setGeminiResult('আপনার জিজ্ঞাসিত স্বাস্থ্য তথ্য বিশ্লেষণ করছি...');
    const result = await gemini.consultHealth(healthSearch);
    setGeminiResult(result || '');
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
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-2xl relative overflow-hidden font-['Hind_Siliguri']">
      
      {dbError && (
        <div className="bg-red-600 text-white text-[10px] py-2 px-6 text-center font-bold animate-pulse z-50">
          ⚠️ {dbError}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div onClick={() => setActiveTab('home')} className="cursor-pointer group">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-1 block">
            {role ? `Portal: ${role}` : 'Digital Health'}
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${!role ? 'bg-slate-300' : 'bg-green-500 animate-pulse'}`}></div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">JB Healthcare</h1>
          </div>
        </div>
        <div>
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
        
        {/* Dynamic Views based on Tab */}
        <div className="space-y-8 page-transition">
          
          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              {/* AI Assistant - Modern Redesign */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[32px] text-white shadow-xl shadow-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">✨</div>
                  <h3 className="font-black text-sm uppercase tracking-widest">AI হেলথ অ্যাসিস্ট্যান্ট</h3>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="আপনার কি শারীরিক সমস্যা হচ্ছে? লিখুন..."
                    className="w-full pl-6 pr-14 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 outline-none text-sm placeholder:text-white/60 font-medium focus:bg-white/20 transition-all"
                    value={healthSearch}
                    onChange={(e) => setHealthSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAIHealthSearch()}
                  />
                  <button 
                    onClick={handleAIHealthSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </button>
                </div>
                {geminiResult && (
                  <div className="mt-4 p-4 bg-black/20 rounded-2xl text-[11px] leading-relaxed font-medium animate-in slide-in-from-top-2 border border-white/10 max-h-60 overflow-y-auto no-scrollbar">
                    {geminiResult}
                  </div>
                )}
              </div>

              {/* Doctors Section */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-slate-800">বিশেষজ্ঞ ডাক্তার</h2>
                  <div className="flex gap-2">
                    <select 
                      value={selectedSpecialty} 
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="bg-white border border-slate-100 rounded-xl text-[10px] font-black px-3 py-2 outline-none"
                    >
                      {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredDoctors.slice(0, 5).map(doc => (
                    <DoctorCard key={doc.id} doctor={doc} onConsult={() => setIsConsulting(true)} isLoggedIn={!!user} />
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Clinics Tab */}
          {activeTab === 'clinics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-800">কাছের হাসপাতালসমূহ</h2>
              <div className="grid grid-cols-2 gap-4">
                {CLINICS.slice(0, 10).map(clinic => (
                  <HospitalCard key={clinic.id} hospital={clinic} />
                ))}
              </div>
            </div>
          )}

          {/* Pharmacy Tab */}
          {activeTab === 'pharmacy' && (
            <div className="space-y-6">
              <div className="bg-orange-500 p-8 rounded-[40px] text-white relative overflow-hidden shadow-xl shadow-orange-100">
                <h2 className="text-2xl font-black relative z-10">অনলাইন ফার্মাসি</h2>
                <p className="text-xs opacity-80 mt-2 relative z-10 font-bold uppercase tracking-widest">৩০ মিনিটে মেডিসিন হোম ডেলিভারি</p>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {MEDICINES.map(med => (
                  <MedicineItem key={med.id} medicine={med} onOrder={() => {}} />
                ))}
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="bg-red-600 p-8 rounded-[40px] text-white relative overflow-hidden shadow-xl shadow-red-100">
                <h2 className="text-2xl font-black relative z-10">হেলথ টিপস</h2>
                <p className="text-xs opacity-80 mt-2 relative z-10 font-bold uppercase tracking-widest">দেখুন এবং শিখুন</p>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {APP_VIDEOS.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          )}

          {/* Info Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-800">আমাদের মিশন ও ভিশন</h2>
              <Card className="p-8 space-y-4">
                <div className="text-4xl">🚀</div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{ABOUT_US_DATA.mission}</p>
                <div className="pt-4 border-t border-slate-50">
                   <h4 className="font-black text-slate-800 text-sm mb-4">আমাদের দক্ষ ম্যানেজমেন্ট</h4>
                   <div className="space-y-4">
                     {ABOUT_US_DATA.team.map((m, i) => (
                       <div key={i} className="flex items-center gap-3">
                         <img src={m.image} className="w-10 h-10 rounded-full object-cover" />
                         <div>
                           <p className="font-bold text-xs">{m.name}</p>
                           <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{m.role}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </Card>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8 py-10 flex flex-col items-center">
              {!user ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">👤</div>
                  <h2 className="text-xl font-black text-slate-800">প্রোফাইল দেখতে লগিন করুন</h2>
                  <Button onClick={() => setShowLoginModal(true)} className="mt-6">লগিন / নিবন্ধন</Button>
                </div>
              ) : (
                <div className="w-full text-center">
                   <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto font-black text-blue-600">
                     {user.email?.charAt(0).toUpperCase()}
                   </div>
                   <h2 className="text-xl font-black text-slate-800">{user.email?.split('@')[0]}</h2>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Logged in as {role}</p>
                   <div className="mt-10 grid grid-cols-1 gap-3 w-full">
                      <Button variant="outline" className="w-full justify-between">আমার অ্যাপয়েন্টমেন্ট <span className="text-blue-600">→</span></Button>
                      <Button variant="outline" className="w-full justify-between">মেডিকেল রিপোর্ট <span className="text-blue-600">→</span></Button>
                      <Button variant="danger" onClick={handleLogout} className="mt-10">লগ আউট করুন</Button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Navigation Footer - Lighting & Colouring Design */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 max-w-lg mx-auto bg-slate-900/90 backdrop-blur-2xl flex items-center justify-around py-5 px-3 rounded-[36px] shadow-2xl ring-1 ring-white/10">
        {[
            { id: 'home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'হোম', color: 'text-cyan-400' },
            { id: 'clinics', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'ক্লিনিক', color: 'text-emerald-400' },
            { id: 'pharmacy', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', label: 'শপ', color: 'text-amber-400' },
            { id: 'videos', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'ভিডিও', color: 'text-rose-400' },
            { id: 'about', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'তথ্য', color: 'text-indigo-400' },
            { id: 'profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'প্রোফাইল', color: 'text-fuchsia-400' }
        ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${isActive ? `${item.color} scale-110` : 'text-slate-500 hover:text-slate-300'}`}
              >
                  {isActive && <div className={`absolute -top-1 w-1.5 h-1.5 rounded-full ${item.color.replace('text', 'bg')} nav-active-glow animate-pulse`}></div>}
                  <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                  </svg>
                  <span className={`text-[7px] font-black uppercase tracking-widest leading-none ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
              </button>
            );
        })}
      </nav>

      {/* Auth Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in">
          <Card className="w-full max-w-sm p-8 space-y-6 animate-in zoom-in duration-300">
             <div className="flex justify-between items-start">
               <h2 className="text-2xl font-black text-slate-800">{authMode === 'login' ? 'লগিন' : 'নিবন্ধন'}</h2>
               <button onClick={() => setShowLoginModal(false)} className="text-slate-400">✕</button>
             </div>
             <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && <Input label="আপনার পুরো নাম" placeholder="নাম লিখুন" value={fullName} onChange={setFullName} required />}
                <Input label="ইমেইল" type="email" placeholder="example@mail.com" value={email} onChange={setEmail} required />
                <Input label="পাসওয়ার্ড" type="password" placeholder="••••••••" value={password} onChange={setPassword} required />
                
                {authMode === 'register' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">আমি একজন</label>
                    <div className="flex gap-2">
                       <button type="button" onClick={() => setSelectedLoginRole(UserRole.PATIENT)} className={`flex-1 py-3 rounded-xl border-2 text-[11px] font-bold ${selectedLoginRole === UserRole.PATIENT ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100'}`}>রোগী</button>
                       <button type="button" onClick={() => setSelectedLoginRole(UserRole.DOCTOR)} className={`flex-1 py-3 rounded-xl border-2 text-[11px] font-bold ${selectedLoginRole === UserRole.DOCTOR ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100'}`}>ডাক্তার</button>
                    </div>
                  </div>
                )}

                <Button type="submit" loading={authLoading} className="w-full py-4 mt-4">{authMode === 'login' ? 'প্রবেশ করুন' : 'অ্যাকাউন্ট খুলুন'}</Button>
             </form>
             <p className="text-center text-xs text-slate-400">
               {authMode === 'login' ? 'অ্যাকাউন্ট নেই? ' : 'আগে থেকেই অ্যাকাউন্ট আছে? '}
               <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-600 font-bold underline">
                 {authMode === 'login' ? 'নিবন্ধন করুন' : 'লগিন করুন'}
               </button>
             </p>
          </Card>
        </div>
      )}

      {/* Live Consult Loading Overlay */}
      {isConsulting && (
        <div className="fixed inset-0 z-[120] bg-slate-900 flex flex-col items-center justify-center p-10 text-white animate-in zoom-in">
           <div className="w-20 h-20 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
           <h3 className="text-xl font-black mb-2">সংযোগ স্থাপন করা হচ্ছে...</h3>
           <p className="text-xs text-white/60 font-medium">আপনার জন্য একজন বিশেষজ্ঞ ডাক্তার খোঁজা হচ্ছে</p>
           <Button onClick={() => setIsConsulting(false)} variant="danger" className="mt-10 px-10">বাতিল করুন</Button>
        </div>
      )}

    </div>
  );
}
