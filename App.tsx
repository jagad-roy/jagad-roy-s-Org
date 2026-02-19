
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Doctor, Clinic, Medicine, Order, Profile, Prescription } from './types';
import { DOCTORS, CLINICS, MEDICINES, EMERGENCY_SERVICES, DISTRICTS, LAB_TESTS } from './constants';
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
  onChange?: (val: string) => void,
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
  const [homeSubCategory, setHomeSubCategory] = useState<'doctors' | 'hospitals' | 'labtests' | 'emergency'>('doctors');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tickerMessage, setTickerMessage] = useState('জেবি হেলথকেয়ারে আপনাকে স্বাগত! যেকোনো প্রয়োজনে কল করুন: ০১৫১৮৩৯৫৭৭২');

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Modals & Auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'moderator'>('login');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState<{show: boolean, amount: number, item: string, shipping: number}>({show: false, amount: 0, item: '', shipping: 0});
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);
  
  // Moderator/Admin Control States
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [historyTab, setHistoryTab] = useState<'info' | 'history' | 'admin'>('info');
  const [adminSubTab, setAdminSubTab] = useState<'log' | 'users' | 'orders' | 'settings'>('log');
  const [selectedUserRecords, setSelectedUserRecords] = useState<{p: Profile, recs: Prescription[]} | null>(null);

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
    if (user) {
      if (profile?.role === UserRole.ADMIN) {
        fetchAdminData();
      } else {
        fetchUserData();
      }
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

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const emailVal = (formData.get('email') as string).trim();
    const passVal = formData.get('password') as string;

    try {
      if (authMode === 'moderator') {
        if (emailVal === 'modaretor' && passVal === 'jagad01750') {
          const modProf: Profile = { id: 'mod-master-id', full_name: 'Main Moderator', role: UserRole.ADMIN, status: 'active', phone: '01518395772' };
          setUser({ id: modProf.id, email: 'admin@jb.com' });
          setProfile(modProf);
          localStorage.setItem('jb_moderator_session', JSON.stringify(modProf));
          setShowAuthModal(false);
          alert('মডারেটর হিসেবে সফল লগিন!');
        } else {
          throw new Error('ভুল ইউজারনেম বা পাসওয়ার্ড!');
        }
      } else if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: emailVal, password: passVal });
        if (error) throw error;
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (prof?.status === 'pending') {
          await supabase.auth.signOut();
          throw new Error('আপনার অ্যাকাউন্ট এখনো পেন্ডিং। মডারেটর এপ্রুভাল এর অপেক্ষা করুন।');
        }
        setUser(data.user);
        setProfile(prof);
        setShowAuthModal(false);
      } else {
        const fullName = formData.get('fullName') as string;
        const phone = formData.get('phone') as string;
        const { data, error } = await supabase.auth.signUp({ email: emailVal, password: passVal });
        if (error) throw error;
        if (data.user) {
          const role = formData.get('role') as UserRole || UserRole.PATIENT;
          const status = role === UserRole.DOCTOR ? 'pending' : 'active';
          const newProf = { id: data.user.id, full_name: fullName, phone, role, status };
          await supabase.from('profiles').insert(newProf);
          if (status === 'pending') {
            alert('রেজিস্ট্রেশন সফল! আপনার ডক্টর অ্যাকাউন্টটি পেন্ডিং এ আছে।');
            await supabase.auth.signOut();
            setShowAuthModal(false);
          } else {
            setUser(data.user);
            setProfile(newProf as any);
            setShowAuthModal(false);
          }
        }
      }
    } catch (err: any) { alert(err.message); }
    finally { setIsProcessing(false); }
  };

  const logout = async () => {
    localStorage.removeItem('jb_moderator_session');
    await supabase.auth.signOut();
    window.location.reload();
  };

  const filteredDoctors = useMemo(() => {
    let list = DOCTORS;
    if (selectedHospitalId) list = list.filter(d => d.clinics.includes(selectedHospitalId));
    return list.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, selectedHospitalId]);

  const filteredLabTests = useMemo(() => {
    return LAB_TESTS.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const masterLogFiltered = useMemo(() => {
    return allPrescriptions.filter(p => 
      p.patient_name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      p.doctor_name.toLowerCase().includes(adminSearchTerm.toLowerCase())
    );
  }, [allPrescriptions, adminSearchTerm]);

  const updateUserStatus = async (uid: string, stat: Profile['status']) => {
    await supabase.from('profiles').update({ status: stat }).eq('id', uid);
    fetchAdminData();
  };

  const updateTicker = async () => {
    await supabase.from('settings').upsert({ key: 'ticker_message', value: tickerMessage });
    alert('বার আপডেট হয়েছে!');
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">JB HEALTHCARE...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Ticker */}
      <div className="bg-red-600 text-white py-2 overflow-hidden whitespace-nowrap z-50 shadow-md">
        <div className="animate-marquee inline-block pl-[100%] font-black text-[10px] uppercase tracking-wider">
          {tickerMessage} • ইমারজেন্সি হেল্পলাইন: ০১৫১৮৩৯৫৭৭২ • 
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
             <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase bg-blue-600 text-white px-4 py-2 rounded-xl">লগিন</button>
           )}
        </div>
      </header>

      <main className="flex-1 p-6 mobile-p-safe space-y-8 overflow-y-auto no-scrollbar">
        
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Filter Menu */}
            <div className="grid grid-cols-4 gap-2">
               {[
                 { id: 'doctors', icon: '👨‍⚕️', label: 'ডক্টর' },
                 { id: 'hospitals', icon: '🏥', label: 'হাসপাতাল' },
                 { id: 'labtests', icon: '🔬', label: 'ল্যাব টেস্ট' },
                 { id: 'emergency', icon: '🆘', label: 'সেবা' }
               ].map(cat => (
                 <button 
                   key={cat.id} 
                   onClick={() => { setHomeSubCategory(cat.id as any); setSelectedHospitalId(null); setSearchTerm(''); }}
                   className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${homeSubCategory === cat.id ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-50'}`}
                 >
                   <span className="text-xl">{cat.icon}</span>
                   <span className="text-[8px] font-black uppercase tracking-wider text-center">{cat.label}</span>
                 </button>
               ))}
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-center bg-slate-100/50 p-2 rounded-2xl">
                  <h2 className="text-[11px] font-black text-slate-800 uppercase ml-2 tracking-wide">
                    {homeSubCategory === 'doctors' ? 'বিশেষজ্ঞ ডক্টর' : homeSubCategory === 'hospitals' ? 'হাসপাতাল লিস্ট' : homeSubCategory === 'labtests' ? 'ল্যাব টেস্ট (Lab Tests)' : 'জরুরি সেবা'}
                  </h2>
                  <div className="relative">
                    <input type="text" placeholder="খুঁজুন..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white border-none rounded-xl py-2 px-3 text-[10px] font-bold outline-none w-36 shadow-sm" />
                    <span className="absolute right-2 top-2 text-slate-300 text-[10px]">🔍</span>
                  </div>
               </div>

               <div className="space-y-4 pb-20">
                  {homeSubCategory === 'doctors' && filteredDoctors.map(d => (
                    <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-500">
                      <img src={d.image} className="w-16 h-16 rounded-2xl object-cover border" />
                      <div className="flex-1">
                        <h4 className="font-bold text-[13px] text-slate-800">{d.name}</h4>
                        <p className="text-[9px] text-blue-600 font-black uppercase mb-1">{d.specialty}</p>
                        <p className="text-[8px] text-slate-400 font-bold leading-tight mb-2">{d.degree}</p>
                        <div className="flex justify-between items-end">
                           <p className="text-[8px] font-black text-emerald-600 flex items-center gap-1">🕒 {d.schedule}</p>
                           <button onClick={() => setShowPayment({show: true, amount: 500, item: `সিরিয়াল: ${d.name}`, shipping: 0})} className="text-[9px] bg-blue-600 text-white px-4 py-2 rounded-xl font-black shadow-lg shadow-blue-100 active:scale-95 transition-all">বুকিং</button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {homeSubCategory === 'hospitals' && CLINICS.map(c => (
                    <Card key={c.id} className="p-0 overflow-hidden relative cursor-pointer group" onClick={() => { setSelectedHospitalId(c.id); setHomeSubCategory('doctors'); }}>
                       <img src={c.image} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
                          <h4 className="font-black text-sm">{c.name}</h4>
                          <p className="text-[9px] font-bold uppercase opacity-80">{c.address}</p>
                       </div>
                    </Card>
                  ))}

                  {homeSubCategory === 'labtests' && (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredLabTests.length > 0 ? filteredLabTests.map(test => (
                        <Card key={test.id} className="flex justify-between items-center border-l-4 border-l-indigo-500 hover:bg-indigo-50 transition-colors" onClick={() => setShowPayment({show: true, amount: test.price, item: `Lab Test: ${test.name}`, shipping: 0})}>
                           <div>
                              <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{test.name}</h4>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">Health Diagnostic</p>
                           </div>
                           <div className="text-right">
                              <p className="text-indigo-600 font-black text-sm">৳{test.price}</p>
                              <button className="text-[8px] bg-indigo-600 text-white px-3 py-1 rounded-lg font-black mt-1">অর্ডার</button>
                           </div>
                        </Card>
                      )) : (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                          <p className="text-2xl mb-2">🔎</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase">কোনো টেস্ট পাওয়া যায়নি</p>
                        </div>
                      )}
                    </div>
                  )}

                  {homeSubCategory === 'emergency' && EMERGENCY_SERVICES.map(s => (
                    <Card key={s.id} className="flex justify-between items-center border-l-4 border-l-red-500 hover:bg-red-50 transition-colors" onClick={() => setShowPayment({show: true, amount: s.price, item: s.name, shipping: 100})}>
                       <div className="flex gap-4 items-center">
                          <span className="text-3xl drop-shadow-sm">{s.icon}</span>
                          <div>
                             <h4 className="text-[12px] font-black text-slate-800">{s.name}</h4>
                             <p className="text-[9px] text-slate-400 font-medium">{s.description}</p>
                          </div>
                       </div>
                       <p className="text-red-600 font-black text-sm">৳{s.price}</p>
                    </Card>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5">
            <Card className="flex items-center gap-5 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-inner">
               <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white text-3xl font-black shadow-xl">
                 {profile?.full_name?.[0] || '👤'}
               </div>
               <div>
                  <h4 className="font-black text-xl text-slate-800 tracking-tight">{profile?.full_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge status={profile?.status || 'active'} />
                    <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest opacity-60">{profile?.role}</p>
                  </div>
               </div>
            </Card>

            <div className="flex bg-slate-100 p-1.5 rounded-[22px]">
              <button onClick={() => setHistoryTab('info')} className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${historyTab === 'info' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>তথ্য</button>
              <button onClick={() => setHistoryTab('history')} className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${historyTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>ইতিহাস</button>
              {profile?.role === UserRole.ADMIN && (
                <button onClick={() => setHistoryTab('admin')} className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${historyTab === 'admin' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400'}`}>ম্যানেজমেন্ট</button>
              )}
            </div>

            {historyTab === 'admin' && profile?.role === UserRole.ADMIN && (
              <div className="space-y-8 animate-in fade-in pb-24">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-blue-600 p-5 rounded-[32px] text-white shadow-xl">
                      <p className="text-2xl font-black">{allProfiles.filter(p => p.role === UserRole.PATIENT).length}</p>
                      <p className="text-[9px] font-black uppercase opacity-60">মোট পেশেন্ট</p>
                   </div>
                   <div className="bg-indigo-600 p-5 rounded-[32px] text-white shadow-xl">
                      <p className="text-2xl font-black">{allProfiles.filter(p => p.role === UserRole.DOCTOR).length}</p>
                      <p className="text-[9px] font-black uppercase opacity-60">মোট ডক্টর</p>
                   </div>
                </div>

                <div className="flex border-b overflow-x-auto no-scrollbar pt-2 gap-6">
                   <button onClick={() => setAdminSubTab('log')} className={`pb-3 text-[11px] font-black uppercase whitespace-nowrap tracking-wider ${adminSubTab === 'log' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>কনসাল্টেশন লগ</button>
                   <button onClick={() => setAdminSubTab('users')} className={`pb-3 text-[11px] font-black uppercase whitespace-nowrap tracking-wider ${adminSubTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>ইউজার লিস্ট</button>
                   <button onClick={() => setAdminSubTab('settings')} className={`pb-3 text-[11px] font-black uppercase whitespace-nowrap tracking-wider ${adminSubTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>সেটিংস</button>
                </div>

                {adminSubTab === 'log' && (
                  <div className="space-y-5">
                     <input type="text" placeholder="রোগী বা ডাক্তারের নাম লিখুন..." className="w-full bg-white border shadow-sm rounded-2xl py-3 px-5 text-xs font-bold outline-none" value={adminSearchTerm} onChange={(e) => setAdminSearchTerm(e.target.value)} />
                     <div className="space-y-4">
                        {masterLogFiltered.map((p, idx) => (
                          <Card key={p.id} className="border-l-4 border-l-blue-600">
                             <div className="flex justify-between items-start mb-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase">{new Date(p.created_at).toLocaleString('bn-BD')}</p>
                                <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">#VISIT {allPrescriptions.length - idx}</span>
                             </div>
                             <h4 className="font-black text-sm text-slate-800">পেশেন্ট: {p.patient_name}</h4>
                             <p className="text-[10px] text-slate-500 font-bold mt-1">ডক্টর: <span className="text-blue-600">{p.doctor_name}</span></p>
                             <div className="mt-2 bg-slate-50 p-3 rounded-xl text-[10px] text-slate-700 italic border border-slate-100">
                                {p.medicines}
                             </div>
                          </Card>
                        ))}
                     </div>
                  </div>
                )}

                {adminSubTab === 'users' && (
                   <div className="space-y-3">
                      {allProfiles.map(p => (
                        <Card key={p.id} className="flex justify-between items-center py-4 hover:bg-slate-50" onClick={() => setSelectedUserRecords({ p, recs: allPrescriptions.filter(pr => pr.patient_id === p.id) })}>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm">{p.full_name[0]}</div>
                              <div>
                                 <p className="text-xs font-black text-slate-800">{p.full_name}</p>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase">{p.role} • {p.phone}</p>
                              </div>
                           </div>
                           <Badge status={p.status} />
                        </Card>
                      ))}
                   </div>
                )}

                {adminSubTab === 'settings' && (
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-red-600 tracking-widest">📢 নোটিফিকেশন বার</h3>
                     <textarea value={tickerMessage} onChange={(e) => setTickerMessage(e.target.value)} className="w-full bg-white border-2 p-4 rounded-3xl text-sm h-32 outline-none focus:border-red-400" />
                     <Button variant="danger" className="w-full py-4" onClick={updateTicker}>আপডেট করুন</Button>
                  </div>
                )}
              </div>
            )}
            
            {historyTab === 'history' && (
              <div className="space-y-4 pb-24">
                 {allPrescriptions.length > 0 ? allPrescriptions.map(p => (
                   <Card key={p.id} className="border-l-4 border-l-blue-600">
                     <div className="flex justify-between items-start mb-2">
                       <p className="text-xs font-black text-slate-800">{p.doctor_name}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(p.created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
                        <p className="text-[11px] text-slate-700 font-medium whitespace-pre-line leading-relaxed">{p.medicines}</p>
                     </div>
                   </Card>
                 )) : (
                   <div className="text-center py-24 opacity-20 font-black uppercase text-xs">কোনো ইতিহাস নেই</div>
                 )}
              </div>
            )}

            {historyTab === 'info' && (
               <div className="space-y-4 pt-4">
                  <Button onClick={() => window.open('https://wa.me/8801518395772', '_blank')} variant="success" className="w-full py-4 rounded-[22px]">লাইভ সাপোর্ট (হোয়াটসঅ্যাপ)</Button>
                  <Button onClick={logout} variant="secondary" className="w-full py-4 rounded-[22px] text-red-500">লগ আউট</Button>
               </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">অর্ডার হিস্ট্রি</h2>
            <div className="space-y-4 pb-24">
              {allOrders.map(order => (
                <Card key={order.id} className="border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-black text-slate-800">{order.item_name}</p>
                    <Badge status={order.status} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold flex justify-between bg-slate-50 p-2.5 rounded-xl">
                    <span>টাকা: ৳{order.amount + order.shipping}</span>
                    <span className="text-slate-400 tracking-wider">Trx: {order.trx_id?.substring(0,8)}...</span>
                  </div>
                </Card>
              ))}
              {allOrders.length === 0 && <div className="text-center py-24 opacity-20 font-black text-xs uppercase">কোনো অর্ডার নেই</div>}
            </div>
          </div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/95 backdrop-blur-2xl flex justify-around items-center py-5 rounded-[36px] shadow-2xl border border-white/10">
        <button onClick={() => { setActiveTab('home'); setSelectedHospitalId(null); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-cyan-400 scale-125' : 'text-slate-500 opacity-60'}`}>
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

      {/* Moderator User Detail View */}
      {selectedUserRecords && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-end justify-center">
           <div className="bg-white w-full max-w-lg rounded-t-[48px] p-8 space-y-6 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-20 duration-500">
              <div className="flex justify-between items-center border-b pb-4">
                 <div>
                    <h2 className="text-xl font-black text-slate-800">{selectedUserRecords.p.full_name}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedUserRecords.p.role} • {selectedUserRecords.p.phone}</p>
                 </div>
                 <button onClick={() => setSelectedUserRecords(null)} className="text-slate-300 text-2xl font-bold">✕</button>
              </div>
              <div className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">চিকিৎসা ইতিহাস</h3>
                 {selectedUserRecords.recs.length > 0 ? selectedUserRecords.recs.map(p => (
                   <Card key={p.id} className="border-l-4 border-l-blue-600 bg-slate-50/50">
                      <div className="flex justify-between items-start mb-1">
                         <p className="text-[11px] font-black text-slate-800">{p.doctor_name}</p>
                         <p className="text-[9px] text-slate-400 font-bold">{new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-[10px] text-blue-600 font-bold uppercase">{p.doctor_specialty}</p>
                      <div className="mt-3 bg-white p-3 rounded-xl border border-slate-100 text-[10px] text-slate-700 italic">
                         {p.medicines}
                      </div>
                   </Card>
                 )) : <p className="text-center py-20 text-slate-300 font-black text-[10px] uppercase border-2 border-dashed rounded-3xl">কোনো ইতিহাস পাওয়া যায়নি</p>}
              </div>
           </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <Card className="w-full max-w-sm p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-800 mb-4">{authMode === 'login' ? 'লগিন' : authMode === 'moderator' ? 'মডারেটর লগিন' : 'রেজিস্ট্রেশন'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-2">
                    <button type="button" onClick={() => {}} className="flex-1 py-2 text-[10px] font-black rounded-xl uppercase bg-white text-blue-600 shadow-sm">পেশেন্ট</button>
                    <button type="button" onClick={() => {}} className="flex-1 py-2 text-[10px] font-black rounded-xl uppercase text-slate-400">ডক্টর</button>
                  </div>
                  <Input label="পুরো নাম" name="fullName" placeholder="নাম লিখুন" required />
                  <Input label="ফোন নম্বর" name="phone" placeholder="017XXXXXXXX" required />
                </>
              )}
              <Input label={authMode === 'moderator' ? "ইউজারনেম" : "ইমেইল এড্রেস"} name="email" placeholder={authMode === 'moderator' ? "modaretor" : "example@mail.com"} required />
              <Input label="পাসওয়ার্ড" name="password" type="password" placeholder="••••••••" required />
              <Button type="submit" loading={isProcessing} className="w-full py-4 mt-2">প্রবেশ করুন</Button>
            </form>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 text-center">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{authMode === 'login' ? 'নতুন অ্যাকাউন্ট' : 'লগিন করুন'}</button>
              <button onClick={() => setAuthMode('moderator')} className="text-[10px] font-black text-red-600 uppercase tracking-widest border-t pt-2">মডারেটর লগিন</button>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 font-bold text-xs">বাতিল</button>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment.show && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[48px] p-8 pb-12 space-y-6 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-20 duration-500">
              <div className="flex justify-between items-center border-b pb-4">
                 <h2 className="text-xl font-black text-slate-800">পেমেন্ট: {showPayment.item}</h2>
                 <button onClick={() => setShowPayment({show: false, amount: 0, item: '', shipping: 0})} className="text-slate-300 text-2xl font-bold">✕</button>
              </div>
              <div className="bg-blue-50 p-6 rounded-[32px] text-center border border-blue-100">
                 <p className="text-3xl font-black text-blue-600">৳{showPayment.amount + showPayment.shipping}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase mt-1">সর্বমোট পরিমাণ</p>
              </div>
              {!paymentMethod ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMethod('bkash')} className="p-6 border-2 border-slate-50 rounded-[32px] flex flex-col items-center gap-3 bg-white hover:border-pink-500 transition-all">
                    <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-14 h-14" />
                    <span className="text-[11px] font-black text-pink-600 uppercase">বিকাশ</span>
                  </button>
                  <button onClick={() => setPaymentMethod('nagad')} className="p-6 border-2 border-slate-50 rounded-[32px] flex flex-col items-center gap-3 bg-white hover:border-orange-500 transition-all">
                    <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="w-14 h-14" />
                    <span className="text-[11px] font-black text-orange-600 uppercase">নগদ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in">
                  <div className="p-5 bg-slate-50 rounded-2xl flex justify-between items-center font-black border border-slate-100">
                    <span className="text-slate-700 text-lg">{PAYMENT_NUMBERS[paymentMethod]}</span>
                    <button onClick={() => { navigator.clipboard.writeText(PAYMENT_NUMBERS[paymentMethod]); alert('নম্বর কপি হয়েছে!'); }} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl">📋 কপি</button>
                  </div>
                  <Input label="ট্রানজেকশন আইডি (TrxID)" placeholder="ABC123XYZ" required value="" onChange={() => {}} />
                  <Button variant="success" className="w-full py-4 mt-2 rounded-[22px]" onClick={() => { alert('আপনার রিকোয়েস্ট পাঠানো হয়েছে!'); setShowPayment({show: false, amount: 0, item: '', shipping: 0}); setPaymentMethod(null); }}>নিশ্চিত করুন</Button>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
