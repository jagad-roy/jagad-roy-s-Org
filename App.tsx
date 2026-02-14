
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Doctor, Clinic, Medicine, Order, Profile, Prescription } from './types';
import { DOCTORS, CLINICS, MEDICINES, EMERGENCY_SERVICES, DISTRICTS, APP_VIDEOS, ABOUT_US_DATA } from './constants';
import { gemini } from './services/geminiService';
import { supabase } from './services/supabaseClient';

// --- UI Components ---

const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-[24px] border border-slate-100 shadow-sm p-4 transition-all active:scale-[0.98] ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-600",
    active: "bg-emerald-100 text-emerald-600",
    verified: "bg-blue-100 text-blue-600",
    processing: "bg-indigo-100 text-indigo-600",
    completed: "bg-emerald-100 text-emerald-600",
    cancelled: "bg-rose-100 text-rose-600",
    suspended: "bg-red-100 text-red-600"
  };
  return (
    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
};

const Button: React.FC<{ 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'danger' | 'success', 
  className?: string,
  disabled?: boolean,
  loading?: boolean,
  type?: "button" | "submit"
}> = ({ children, onClick, variant = 'primary', className = "", disabled = false, loading = false, type = "button" }) => {
  const styles = {
    primary: "bg-blue-600 text-white shadow-blue-100 shadow-lg",
    secondary: "bg-slate-100 text-slate-600",
    danger: "bg-red-500 text-white shadow-red-100 shadow-lg",
    success: "bg-green-600 text-white shadow-green-100 shadow-lg"
  };
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || loading}
      className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 ${styles[variant]} ${className}`}
    >
      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
      {children}
    </button>
  );
};

const Input: React.FC<{
  label: string,
  type?: string,
  placeholder?: string,
  value: string,
  onChange: (val: string) => void,
  required?: boolean,
  className?: string,
  name?: string
}> = ({ label, type = "text", placeholder, value, onChange, required = false, className = "", name }) => (
  <div className={`space-y-1.5 w-full ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">{label}</label>
    <input 
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange ? onChange(e.target.value) : null}
      required={required}
      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubCategory, setHomeSubCategory] = useState<'doctors' | 'hospitals' | 'medicine' | 'emergency'>('doctors');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tickerMessage, setTickerMessage] = useState('জেবি হেলথকেয়ারে আপনাকে স্বাগতম! মডারেটর প্যানেল এখন আরও উন্নত।');

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');

  // Modals & State
  const [showPayment, setShowPayment] = useState<{show: boolean, amount: number, item: string, shipping: number}>({show: false, amount: 0, item: '', shipping: 0});
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'moderator'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);
  
  // Admin Data
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [historyTab, setHistoryTab] = useState<'info' | 'history' | 'admin'>('info');
  const [adminSubTab, setAdminSubTab] = useState<'consultations' | 'users' | 'orders' | 'settings'>('consultations');

  const PAYMENT_NUMBERS = { bkash: '01518395772', nagad: '01846800973' };

  useEffect(() => {
    const init = async () => {
      const savedModerator = localStorage.getItem('jb_moderator_session');
      if (savedModerator) {
        const mod = JSON.parse(savedModerator);
        setUser({ id: mod.id, email: 'admin@jb.com' });
        setProfile(mod);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (prof) setProfile(prof);
        }
      }
      const { data: settings } = await supabase.from('settings').select('*').eq('key', 'ticker_message').single();
      if (settings) setTickerMessage(settings.value);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (user && profile?.role === UserRole.ADMIN) {
      fetchAdminData();
    } else if (user) {
      fetchUserData();
    }
  }, [user, profile, activeTab]);

  const fetchAdminData = async () => {
    const [profRes, presRes, ordRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('prescriptions').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false })
    ]);
    if (profRes.data) setAllProfiles(profRes.data);
    if (presRes.data) setAllPrescriptions(presRes.data);
    if (ordRes.data) setAllOrders(ordRes.data);
  };

  const fetchUserData = async () => {
    const { data: pres } = await supabase.from('prescriptions').select('*').eq(profile?.role === UserRole.DOCTOR ? 'doctor_id' : 'patient_id', user.id).order('created_at', { ascending: false });
    const { data: ord } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (pres) setAllPrescriptions(pres);
    if (ord) setAllOrders(ord || []);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const emailInput = formData.get('email') as string;
    const passwordInput = formData.get('password') as string;
    const nameInput = formData.get('fullName') as string;
    const phoneInput = formData.get('phone') as string;

    try {
      if (authMode === 'moderator') {
        if (emailInput === 'modaretor' && passwordInput === 'jagad01750') {
          const adminProfile: Profile = { id: 'admin-hardcoded', full_name: 'Main Moderator', role: UserRole.ADMIN, status: 'active', phone: '01518395772' };
          setUser({ id: adminProfile.id, email: 'admin@jb.com' });
          setProfile(adminProfile);
          localStorage.setItem('jb_moderator_session', JSON.stringify(adminProfile));
          setShowAuthModal(false);
          alert('মডারেটর হিসেবে সফল লগিন!');
        } else {
          throw new Error('ভুল ইউজারনেম বা পাসওয়ার্ড!');
        }
      } else if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email: emailInput, password: passwordInput });
        if (error) throw error;
        if (data.user) {
          const newStatus = selectedRole === UserRole.DOCTOR ? 'pending' : 'active';
          const newProfile = { id: data.user.id, role: selectedRole, full_name: nameInput, phone: phoneInput, status: newStatus };
          await supabase.from('profiles').insert(newProfile);
          if (newStatus === 'pending') {
            alert('আপনার ডক্টর অ্যাকাউন্টটি মডারেটর এপ্রুভাল এর জন্য পেন্ডিং আছে।');
            await supabase.auth.signOut();
            setShowAuthModal(false);
          } else {
            setProfile(newProfile as Profile);
            setUser(data.user);
            setShowAuthModal(false);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput });
        if (error) throw error;
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (prof?.status === 'pending') {
          await supabase.auth.signOut();
          throw new Error('আপনার অ্যাকাউন্টটি পেন্ডিং আছে। অনুগ্রহ করে মডারেটর এপ্রুভাল এর অপেক্ষা করুন।');
        }
        setUser(data.user);
        setProfile(prof);
        setShowAuthModal(false);
      }
    } catch (err: any) { alert(err.message); }
    finally { setIsProcessing(false); }
  };

  const logout = async () => {
    localStorage.removeItem('jb_moderator_session');
    await supabase.auth.signOut();
    window.location.reload();
  };

  const updateProfileStatus = async (id: string, status: Profile['status']) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (!error) fetchAdminData();
  };

  const updateTicker = async () => {
    const { error } = await supabase.from('settings').upsert({ key: 'ticker_message', value: tickerMessage });
    if (!error) alert('নোটিফিকেশন বার আপডেট হয়েছে!');
  };

  // Filtered Lists
  const filteredDoctors = useMemo(() => DOCTORS.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);
  const filteredHospitals = useMemo(() => CLINICS.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);
  const filteredMedicines = useMemo(() => MEDICINES.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);
  
  const filteredAdminPrescriptions = useMemo(() => {
    return allPrescriptions.filter(p => 
      p.patient_name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      p.doctor_name.toLowerCase().includes(adminSearchTerm.toLowerCase())
    );
  }, [allPrescriptions, adminSearchTerm]);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">JB HEALTHCARE...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Red Ticker Bar */}
      <div className="bg-red-600 text-white py-2 overflow-hidden whitespace-nowrap z-50 shadow-md">
        <div className="animate-marquee inline-block pl-[100%] font-black text-[10px] uppercase tracking-wider">
          {tickerMessage} • ইমারজেন্সি সেবা: ০১৫১৮৩৯৫৭৭২ • 
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-slate-800 tracking-tight cursor-pointer" onClick={() => setActiveTab('home')}>
          <span className="text-blue-600">JB</span> Healthcare
        </h1>
        <div className="flex gap-2">
           {user ? (
             <button onClick={logout} className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[11px] font-black border-2 border-blue-50">
               {profile?.full_name?.[0].toUpperCase() || '👤'}
             </button>
           ) : (
             <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase bg-blue-600 text-white px-4 py-2 rounded-xl">প্রবেশ</button>
           )}
        </div>
      </header>

      <main className="flex-1 p-6 mobile-p-safe space-y-8 overflow-y-auto no-scrollbar">
        
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in">
            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">✨ AI হেলথ অ্যাসিস্ট্যান্ট</h3>
              <input type="text" placeholder="আপনার সমস্যা লিখুন..." className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-5 text-sm outline-none placeholder:text-white/40" />
            </div>

            {/* Category Selector */}
            <div className="grid grid-cols-4 gap-3">
               {[
                 { id: 'doctors', icon: '👨‍⚕️', label: 'ডক্টর' },
                 { id: 'hospitals', icon: '🏥', label: 'হাসপাতাল' },
                 { id: 'medicine', icon: '💊', label: 'ওষুধ' },
                 { id: 'emergency', icon: '🆘', label: 'সেবা' }
               ].map(cat => (
                 <button 
                   key={cat.id} 
                   onClick={() => setHomeSubCategory(cat.id as any)}
                   className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${homeSubCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                 >
                   <span className="text-xl">{cat.icon}</span>
                   <span className="text-[8px] font-black uppercase tracking-wider">{cat.label}</span>
                 </button>
               ))}
            </div>

            {/* Sub Content */}
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                    {homeSubCategory === 'doctors' && 'বিশেষজ্ঞ ডক্টরগণ'}
                    {homeSubCategory === 'hospitals' && 'সেরা হাসপাতালসমূহ'}
                    {homeSubCategory === 'medicine' && 'ওষুধের দোকান'}
                    {homeSubCategory === 'emergency' && 'জরুরি সেবাসমূহ'}
                  </h2>
                  <input 
                    type="text" 
                    placeholder="খুঁজুন..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-100 border-none rounded-xl py-1 px-3 text-[10px] font-bold outline-none w-24" 
                  />
               </div>

               <div className="space-y-4">
                  {homeSubCategory === 'doctors' && filteredDoctors.map(d => (
                    <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-500">
                      <img src={d.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-800">{d.name}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{d.specialty} • {d.degree}</p>
                        <button onClick={() => setShowPayment({show: true, amount: 500, item: `সিরিয়াল: ${d.name}`, shipping: 0})} className="mt-2 text-[8px] bg-blue-600 text-white px-3 py-1 rounded-lg font-black">বুকিং দিন</button>
                      </div>
                    </Card>
                  ))}

                  {homeSubCategory === 'hospitals' && filteredHospitals.map(c => (
                    <Card key={c.id} className="p-0 overflow-hidden relative">
                       <img src={c.image} className="w-full h-32 object-cover" />
                       <div className="p-4 bg-white/90 backdrop-blur-md absolute bottom-0 left-0 right-0 border-t">
                          <h4 className="font-bold text-xs">{c.name}</h4>
                          <p className="text-[8px] text-slate-500 font-bold uppercase">{c.address}, {c.district}</p>
                       </div>
                    </Card>
                  ))}

                  {homeSubCategory === 'medicine' && filteredMedicines.map(m => (
                    <Card key={m.id} className="flex gap-4 items-center">
                       <img src={m.image} className="w-14 h-14 rounded-xl object-cover" />
                       <div className="flex-1">
                          <h4 className="font-bold text-xs">{m.name}</h4>
                          <p className="text-[8px] text-slate-400">{m.description}</p>
                          <div className="flex justify-between items-center mt-1">
                             <p className="text-blue-600 font-black text-xs">৳{m.price}</p>
                             <button onClick={() => setShowPayment({show: true, amount: m.price, item: m.name, shipping: 50})} className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded">অর্ডার</button>
                          </div>
                       </div>
                    </Card>
                  ))}

                  {homeSubCategory === 'emergency' && EMERGENCY_SERVICES.map(s => (
                    <Card key={s.id} className="flex justify-between items-center border-l-4 border-l-red-500" onClick={() => setShowPayment({show: true, amount: s.price, item: s.name, shipping: 100})}>
                       <div className="flex gap-3 items-center">
                          <span className="text-2xl">{s.icon}</span>
                          <div>
                             <h4 className="text-[11px] font-black text-slate-800">{s.name}</h4>
                             <p className="text-[9px] text-slate-400">{s.description}</p>
                          </div>
                       </div>
                       <p className="text-red-600 font-black text-xs">৳{s.price}</p>
                    </Card>
                  ))}
               </div>
            </div>

            {/* Health Videos */}
            <section className="space-y-4 pt-4 border-t">
               <h2 className="text-lg font-black text-slate-800 tracking-tight">ভিডিও গাইড</h2>
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {APP_VIDEOS.map(v => (
                    <div key={v.id} className="min-w-[240px] relative rounded-[24px] overflow-hidden group">
                       <img src={v.thumbnail} className="w-full h-32 object-cover group-hover:scale-110 transition-transform" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-3xl text-white opacity-80">▶️</span>
                       </div>
                       <div className="p-3 bg-white">
                          <p className="text-[10px] font-black">{v.title}</p>
                          <p className="text-[8px] text-slate-400">{v.description}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* About Us */}
            <section className="space-y-4 pt-4 border-t">
               <h2 className="text-lg font-black text-slate-800 tracking-tight">আমাদের সম্পর্কে</h2>
               <Card className="bg-blue-50 border-none">
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">"{ABOUT_US_DATA.mission}"</p>
                  <div className="flex gap-4 mt-4">
                     {ABOUT_US_DATA.team.map((m, i) => (
                       <div key={i} className="flex items-center gap-2">
                          <img src={m.image} className="w-8 h-8 rounded-full border-2 border-white" />
                          <div>
                             <p className="text-[8px] font-black">{m.name}</p>
                             <p className="text-[7px] text-slate-400 font-bold uppercase">{m.role}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </Card>
            </section>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5">
            <Card className="flex items-center gap-4 py-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-inner">
               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
                 {profile?.full_name?.[0] || '👤'}
               </div>
               <div>
                  <h4 className="font-black text-lg text-slate-800">{profile?.full_name}</h4>
                  <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest">{profile?.role} • {profile?.status}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{profile?.phone}</p>
               </div>
            </Card>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button onClick={() => setHistoryTab('info')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${historyTab === 'info' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>তথ্য</button>
              <button onClick={() => setHistoryTab('history')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${historyTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>ইতিহাস</button>
              {profile?.role === UserRole.ADMIN && (
                <button onClick={() => setHistoryTab('admin')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${historyTab === 'admin' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400'}`}>ম্যানেজমেন্ট</button>
              )}
            </div>

            {historyTab === 'admin' && profile?.role === UserRole.ADMIN && (
              <div className="space-y-6 animate-in fade-in pb-20">
                {/* Statistics Cards */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-blue-50 p-2 rounded-2xl text-center">
                    <p className="text-sm font-black text-blue-600">{allProfiles.filter(p => p.role === UserRole.PATIENT).length}</p>
                    <p className="text-[6px] font-black uppercase text-slate-400">পেশেন্ট</p>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded-2xl text-center">
                    <p className="text-sm font-black text-indigo-600">{allProfiles.filter(p => p.role === UserRole.DOCTOR).length}</p>
                    <p className="text-[6px] font-black uppercase text-slate-400">ডক্টর</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-2xl text-center">
                    <p className="text-sm font-black text-amber-600">{allProfiles.filter(p => p.status === 'pending').length}</p>
                    <p className="text-[6px] font-black uppercase text-slate-400">পেন্ডিং</p>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-2xl text-center">
                    <p className="text-sm font-black text-emerald-600">{allOrders.length}</p>
                    <p className="text-[6px] font-black uppercase text-slate-400">অর্ডার</p>
                  </div>
                </div>

                {/* Admin Sub-tabs */}
                <div className="flex gap-4 border-b overflow-x-auto no-scrollbar">
                   <button onClick={() => setAdminSubTab('consultations')} className={`pb-2 text-[9px] font-black uppercase whitespace-nowrap ${adminSubTab === 'consultations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>পেশেন্ট-ডক্টর রেকর্ডস</button>
                   <button onClick={() => setAdminSubTab('users')} className={`pb-2 text-[9px] font-black uppercase whitespace-nowrap ${adminSubTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>ইউজার লিস্ট</button>
                   <button onClick={() => setAdminSubTab('orders')} className={`pb-2 text-[9px] font-black uppercase whitespace-nowrap ${adminSubTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>সকল অর্ডার</button>
                   <button onClick={() => setAdminSubTab('settings')} className={`pb-2 text-[9px] font-black uppercase whitespace-nowrap ${adminSubTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>বার সেটিংস</button>
                </div>

                {adminSubTab === 'consultations' && (
                  <div className="space-y-4">
                     <input type="text" placeholder="রোগী বা ডাক্তার লিখে সার্চ দিন..." className="w-full bg-slate-100 border-none rounded-xl py-2 px-4 text-[10px] font-medium outline-none" value={adminSearchTerm} onChange={(e) => setAdminSearchTerm(e.target.value)} />
                     <div className="space-y-3">
                        {filteredAdminPrescriptions.map(p => (
                          <Card key={p.id} className="border-l-4 border-l-blue-600 bg-slate-50/50">
                             <div className="flex justify-between">
                                <p className="text-[9px] font-black text-blue-600 uppercase">{new Date(p.created_at).toLocaleDateString()}</p>
                             </div>
                             <h4 className="font-black text-xs mt-1 text-slate-800">পেশেন্ট: {p.patient_name}</h4>
                             <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">ডক্টর: {p.doctor_name} ({p.doctor_specialty})</p>
                             <div className="mt-2 p-2 bg-white rounded-lg border border-slate-100">
                                <p className="text-[9px] text-slate-600 line-clamp-2">{p.medicines}</p>
                             </div>
                          </Card>
                        ))}
                     </div>
                  </div>
                )}

                {adminSubTab === 'users' && (
                  <div className="space-y-3">
                     {allProfiles.map(p => (
                        <Card key={p.id} className="flex justify-between items-center py-2.5">
                           <div>
                              <p className="text-[11px] font-black text-slate-800">{p.full_name}</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase">{p.role} • {p.phone}</p>
                           </div>
                           <div className="flex gap-1">
                              {p.status === 'pending' && (
                                <button onClick={() => updateProfileStatus(p.id, 'active')} className="bg-emerald-500 text-white text-[7px] font-black px-2 py-1 rounded">Approve</button>
                              )}
                              <Badge status={p.status} />
                           </div>
                        </Card>
                     ))}
                  </div>
                )}

                {adminSubTab === 'orders' && (
                  <div className="space-y-3">
                     {allOrders.map(o => (
                       <Card key={o.id} className="border-l-4 border-l-indigo-400">
                          <div className="flex justify-between items-start">
                             <p className="text-[10px] font-black text-slate-800">{o.item_name}</p>
                             <Badge status={o.status} />
                          </div>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">কাস্টমার: {o.sender_name} ({o.sender_contact})</p>
                          <p className="text-[9px] text-blue-600 font-black mt-1">পরিমাণ: ৳{o.amount + o.shipping} • TrxID: {o.trx_id}</p>
                       </Card>
                     ))}
                  </div>
                )}

                {adminSubTab === 'settings' && (
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-red-600 tracking-widest">নোটিফিকেশন বার টেক্সট</h3>
                     <textarea value={tickerMessage} onChange={(e) => setTickerMessage(e.target.value)} className="w-full bg-white border-2 border-slate-100 p-4 rounded-3xl text-xs h-24 outline-none focus:border-red-400" />
                     <Button variant="danger" className="w-full" onClick={updateTicker}>আপডেট করুন</Button>
                  </div>
                )}
              </div>
            )}
            
            {historyTab === 'history' && (
              <div className="space-y-4 pb-20">
                 {allPrescriptions.length > 0 ? allPrescriptions.map(p => (
                   <Card key={p.id} className="border-l-4 border-l-blue-600">
                     <p className="text-xs font-black text-slate-800">{p.doctor_name}</p>
                     <p className="text-[9px] text-slate-400 uppercase font-black">{new Date(p.created_at).toLocaleDateString()}</p>
                     <div className="mt-2 bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] text-slate-700 font-medium whitespace-pre-line">{p.medicines}</p>
                     </div>
                   </Card>
                 )) : (
                   <div className="text-center py-20 opacity-20 font-black uppercase text-xs">কোনো ইতিহাস নেই</div>
                 )}
              </div>
            )}

            {historyTab === 'info' && (
               <div className="space-y-4">
                  <Button onClick={() => window.open('https://wa.me/8801518395772', '_blank')} variant="success" className="w-full py-4">লাইভ সাপোর্ট (হোয়াটসঅ্যাপ)</Button>
                  <Button onClick={logout} variant="danger" className="w-full py-4">লগ আউট</Button>
               </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800">অর্ডার হিস্ট্রি</h2>
            <div className="space-y-4 pb-20">
              {allOrders.map(order => (
                <Card key={order.id} className="border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-black text-slate-800">{order.item_name}</p>
                    <Badge status={order.status} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold flex justify-between">
                    <span>টাকা: ৳{order.amount + order.shipping}</span>
                    <span>মেথড: {order.payment_method?.toUpperCase()}</span>
                  </div>
                </Card>
              ))}
              {allOrders.length === 0 && <p className="text-center py-20 text-slate-300 font-black text-xs uppercase">কোনো অর্ডার পাওয়া যায়নি</p>}
            </div>
          </div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/95 backdrop-blur-2xl flex justify-around items-center py-5 px-3 rounded-[36px] shadow-2xl border border-white/10">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-cyan-400 scale-125' : 'text-slate-500 opacity-60'}`}>
          <span className="text-2xl">🏠</span>
          <span className="text-[8px] font-black uppercase tracking-widest">হোম</span>
        </button>
        <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'orders' ? 'text-yellow-400 scale-125' : 'text-slate-500 opacity-60'}`}>
          <span className="text-2xl">📜</span>
          <span className="text-[8px] font-black uppercase tracking-widest">অর্ডার</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'profile' ? 'text-fuchsia-400 scale-125' : 'text-slate-500 opacity-60'}`}>
          <span className="text-2xl">👤</span>
          <span className="text-[8px] font-black uppercase tracking-widest">প্রোফাইল</span>
        </button>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <Card className="w-full max-w-sm p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-800 mb-4">
               {authMode === 'login' ? 'লগিন' : authMode === 'moderator' ? 'মডারেটর লগিন' : 'নিবন্ধন'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-2">
                    <button type="button" onClick={() => setSelectedRole(UserRole.PATIENT)} className={`flex-1 py-1.5 text-[10px] font-black rounded-xl uppercase ${selectedRole === UserRole.PATIENT ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>পেশেন্ট</button>
                    <button type="button" onClick={() => setSelectedRole(UserRole.DOCTOR)} className={`flex-1 py-1.5 text-[10px] font-black rounded-xl uppercase ${selectedRole === UserRole.DOCTOR ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>ডাক্তার</button>
                  </div>
                  <Input label="পুরো নাম" name="fullName" placeholder="আপনার নাম" required />
                  <Input label="ফোন নম্বর" name="phone" placeholder="017XXXXXXXX" required />
                </>
              )}
              <Input label={authMode === 'moderator' ? "ইউজারনেম" : "ইমেইল"} name="email" placeholder={authMode === 'moderator' ? "modaretor" : "example@mail.com"} required />
              <Input label="পাসওয়ার্ড" name="password" type="password" placeholder="••••••••" required />
              <Button type="submit" loading={isProcessing} className="w-full py-4 mt-2">প্রবেশ করুন</Button>
            </form>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{authMode === 'login' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগিন করুন'}</button>
              <button onClick={() => setAuthMode('moderator')} className="text-[10px] font-black text-red-600 uppercase tracking-widest border-t pt-2">মডারেটর লগিন</button>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 font-bold text-xs uppercase">বাতিল</button>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment.show && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[48px] p-8 pb-12 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                 <h2 className="text-xl font-black text-slate-800">পেমেন্ট: {showPayment.item}</h2>
                 <button onClick={() => setShowPayment({show: false, amount: 0, item: '', shipping: 0})} className="text-slate-400 text-xl font-bold">✕</button>
              </div>
              <div className="bg-blue-50 p-6 rounded-[32px] text-center">
                 <p className="text-3xl font-black text-blue-600">৳{showPayment.amount + showPayment.shipping}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">সব মিলিয়ে পেমেন্ট করতে হবে</p>
              </div>
              {!paymentMethod ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMethod('bkash')} className="p-6 border-2 border-slate-50 rounded-[28px] flex flex-col items-center gap-3 hover:border-pink-500 transition-all">
                    <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-12 h-12" />
                    <span className="text-[11px] font-black text-pink-600">বিকাশ</span>
                  </button>
                  <button onClick={() => setPaymentMethod('nagad')} className="p-6 border-2 border-slate-50 rounded-[28px] flex flex-col items-center gap-3 hover:border-orange-500 transition-all">
                    <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="w-12 h-12" />
                    <span className="text-[11px] font-black text-orange-600">নগদ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center font-black">
                    {PAYMENT_NUMBERS[paymentMethod]} 
                    <button onClick={() => { navigator.clipboard.writeText(PAYMENT_NUMBERS[paymentMethod]); alert('কপি হয়েছে'); }} className="text-blue-600">📋 কপি</button>
                  </div>
                  <Input label="পেমেন্ট ট্রানজেকশন আইডি (TrxID)" placeholder="ABC123XYZ" required value="" onChange={() => {}} />
                  <Button variant="success" className="w-full py-4 mt-2" onClick={() => alert('অর্ডার রিকোয়েস্ট পাঠানো হয়েছে!')}>নিশ্চিত করুন</Button>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
