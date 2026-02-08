
import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, Doctor, Clinic, Medicine, LabTest } from './types';
import { DOCTORS, CLINICS, MEDICINES, LAB_TESTS, DISTRICTS, ABOUT_US_DATA, APP_VIDEOS } from './constants';
import { gemini } from './services/geminiService';
import { supabase } from './services/supabaseClient';

// --- Reusable Components ---

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

const DoctorCard: React.FC<{ doctor: Doctor, onConsult: (id: string) => void, isLoggedIn: boolean }> = ({ doctor, onConsult, isLoggedIn }) => (
  <Card className="p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 border-l-4 border-l-blue-500">
    <div className="relative shrink-0">
      <img src={doctor.image} alt={doctor.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50" />
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${doctor.availableToday ? 'bg-green-500' : 'bg-slate-300'}`}></div>
    </div>
    <div className="flex-1 text-center sm:text-left min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h3 className="font-bold text-slate-800 text-base truncate">{doctor.name}</h3>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-black uppercase">
          {doctor.specialty}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mt-1">{doctor.degree}</p>
      <div className="mt-3 flex items-center justify-center sm:justify-start gap-4">
        <p className="text-[10px] font-black text-slate-800">⭐ {doctor.rating}</p>
        <div className="w-px h-4 bg-slate-100"></div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">500+ Patients</p>
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
    <div className="w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3 p-4 group-hover:scale-105 transition-transform border border-slate-50">
      <img src={medicine.image} alt={medicine.name} className="w-full h-full object-contain" />
    </div>
    <h4 className="text-xs font-bold text-slate-800 text-center line-clamp-1 h-4">{medicine.name}</h4>
    <div className="flex items-center gap-2 mt-2 mb-4">
      <span className="text-sm font-black text-blue-600">৳{Math.round(medicine.price * (1 - medicine.discount / 100))}</span>
      <span className="text-[10px] text-slate-300 line-through">৳{medicine.price}</span>
    </div>
    <Button variant="secondary" onClick={onOrder} className="w-full text-[9px] py-2">অর্ডার করুন</Button>
  </Card>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [healthSearch, setHealthSearch] = useState('');
  const [geminiResult, setGeminiResult] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const specialties = useMemo(() => ['All', ...Array.from(new Set(DOCTORS.map(d => d.specialty)))], []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setRole(profile.role as UserRole);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleAIHealthSearch = async () => {
    if (!healthSearch) return;
    setGeminiResult('আপনার সমস্যার তথ্য বিশ্লেষণ করছি...');
    const result = await gemini.consultHealth(healthSearch);
    setGeminiResult(result || '');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: fullName, role: UserRole.PATIENT } }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, role: UserRole.PATIENT, full_name: fullName });
          setUser(data.user);
          setRole(UserRole.PATIENT);
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
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">JB Healthcare</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div onClick={() => setActiveTab('home')} className="cursor-pointer">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">JB Healthcare</h1>
        </div>
        {user ? (
          <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>
          </button>
        ) : (
          <Button onClick={() => setShowLoginModal(true)} className="px-4 py-2 text-[10px]">প্রবেশ</Button>
        )}
      </header>

      <main className="flex-1 p-6 mobile-p-safe space-y-8">
        
        {/* Home View */}
        {activeTab === 'home' && (
          <div className="space-y-8 page-transition">
            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[32px] text-white shadow-xl shadow-blue-100">
              <h3 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="bg-white/20 p-1.5 rounded-lg">✨</span> AI হেলথ অ্যাসিস্ট্যান্ট
              </h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="আপনার শারীরিক সমস্যা লিখুন..."
                  className="w-full pl-6 pr-14 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 outline-none text-sm placeholder:text-white/60 font-medium"
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
                <div className="mt-4 p-4 bg-black/20 rounded-2xl text-[11px] leading-relaxed border border-white/10 max-h-40 overflow-y-auto no-scrollbar">
                  {geminiResult}
                </div>
              )}
            </div>

            {/* Specialties */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {specialties.map(s => (
                <button 
                  key={s} 
                  onClick={() => setSelectedSpecialty(s)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSpecialty === s ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}
                >
                  {s === 'All' ? 'সব বিভাগ' : s}
                </button>
              ))}
            </div>

            {/* Doctors */}
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-800">বিশেষজ্ঞ ডাক্তার</h2>
              {DOCTORS.filter(d => selectedSpecialty === 'All' || d.specialty === selectedSpecialty).map(doc => (
                <DoctorCard key={doc.id} doctor={doc} onConsult={() => {}} isLoggedIn={!!user} />
              ))}
            </section>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab === 'clinics' && (
          <div className="space-y-6 page-transition">
            <h2 className="text-xl font-black text-slate-800">হাসপাতাল ও ক্লিনিক</h2>
            <div className="grid grid-cols-2 gap-4">
              {CLINICS.map(clinic => (
                <Card key={clinic.id} className="overflow-hidden">
                  <img src={clinic.image} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <h4 className="font-bold text-xs truncate">{clinic.name}</h4>
                    <p className="text-[9px] text-slate-400 mt-1">{clinic.district}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pharmacy' && (
          <div className="space-y-6 page-transition">
            <h2 className="text-xl font-black text-slate-800">অনলাইন ফার্মাসি</h2>
            <div className="grid grid-cols-2 gap-4">
              {MEDICINES.map(med => (
                <MedicineItem key={med.id} medicine={med} onOrder={() => {}} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6 page-transition">
            <h2 className="text-xl font-black text-slate-800">স্বাস্থ্য টিপস ভিডিও</h2>
            {APP_VIDEOS.map(video => (
              <Card key={video.id} className="overflow-hidden flex flex-col">
                <img src={video.thumbnail} className="w-full h-44 object-cover" />
                <div className="p-4">
                  <h4 className="font-bold text-sm">{video.title}</h4>
                  <p className="text-xs text-slate-500 mt-2">{video.description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6 page-transition">
            <h2 className="text-xl font-black text-slate-800">তথ্য ও মিশন</h2>
            <Card className="p-6 space-y-4">
               <p className="text-sm leading-relaxed text-slate-600">{ABOUT_US_DATA.mission}</p>
               <div className="pt-4 border-t border-slate-50">
                  <h4 className="font-black text-slate-800 text-xs uppercase mb-4">আমাদের ম্যানেজমেন্ট টিম</h4>
                  <div className="space-y-4">
                    {ABOUT_US_DATA.team.map((m, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={m.image} className="w-10 h-10 rounded-full" />
                        <div>
                           <p className="font-bold text-xs">{m.name}</p>
                           <p className="text-[9px] text-blue-600 font-black uppercase">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8 py-10 text-center page-transition">
            {!user ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mx-auto">👤</div>
                <h2 className="text-xl font-black text-slate-800">প্রোফাইল দেখতে লগিন করুন</h2>
                <Button onClick={() => setShowLoginModal(true)}>লগিন / নিবন্ধন</Button>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-black text-blue-600 mx-auto">
                    {user.email?.charAt(0).toUpperCase()}
                 </div>
                 <h2 className="text-xl font-black text-slate-800">{user.email?.split('@')[0]}</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{role}</p>
                 <Button variant="danger" className="w-full" onClick={() => supabase.auth.signOut()}>লগ আউট</Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation Footer - Ultra Color & Glow Design */}
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
                  className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${isActive ? `${item.color} scale-110 drop-shadow-[0_0_8px_currentColor]` : 'text-slate-500 opacity-60 hover:opacity-100'}`}
              >
                  {isActive && (
                    <div className={`absolute -top-1 w-1 h-1 rounded-full ${item.color.replace('text', 'bg')} shadow-[0_0_10px_currentColor] animate-pulse`}></div>
                  )}
                  <svg className={`w-5 h-5 ${isActive ? 'nav-glow' : ''}`} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                  </svg>
                  <span className={`text-[7px] font-black uppercase tracking-widest leading-none`}>{item.label}</span>
              </button>
            );
        })}
      </nav>

      {/* Auth Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in">
          <Card className="w-full max-w-sm p-8 space-y-6 animate-in zoom-in duration-300">
             <div className="flex justify-between items-start">
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">{authMode === 'login' ? 'লগিন' : 'নিবন্ধন'}</h2>
               <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-red-500">✕</button>
             </div>
             <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && <Input label="আপনার নাম" placeholder="পুরো নাম লিখুন" value={fullName} onChange={setFullName} required />}
                <Input label="ইমেইল" type="email" placeholder="example@mail.com" value={email} onChange={setEmail} required />
                <Input label="পাসওয়ার্ড" type="password" placeholder="••••••••" value={password} onChange={setPassword} required />
                <Button type="submit" loading={authLoading} className="w-full py-4 mt-2">
                  {authMode === 'login' ? 'প্রবেশ করুন' : 'অ্যাকাউন্ট খুলুন'}
                </Button>
             </form>
             <button 
               onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
               className="w-full text-center text-xs font-bold text-blue-600 hover:underline"
             >
               {authMode === 'login' ? 'নতুন অ্যাকাউন্ট খুলুন?' : 'আগে থেকেই অ্যাকাউন্ট আছে?'}
             </button>
          </Card>
        </div>
      )}

    </div>
  );
}
