
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Doctor, Clinic, Medicine, Order } from './types';
import { DOCTORS, CLINICS, MEDICINES, EMERGENCY_SERVICES, DISTRICTS } from './constants';
import { gemini } from './services/geminiService';
import { supabase } from './services/supabaseClient';

// --- UI Components ---

const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-[24px] border border-slate-100 shadow-sm p-4 transition-all active:scale-[0.98] ${className}`}>
    {children}
  </div>
);

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
  className?: string
}> = ({ label, type = "text", placeholder, value, onChange, required = false, className = "" }) => (
  <div className={`space-y-1.5 w-full ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [isLoading, setIsLoading] = useState(true);

  // Gemini State
  const [healthSearch, setHealthSearch] = useState('');
  const [geminiResult, setGeminiResult] = useState('');

  // Search & Filter States
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [clinicSearchTerm, setClinicSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // Payment State
  const [showPayment, setShowPayment] = useState<{show: boolean, amount: number, item: string, shipping: number}>({show: false, amount: 0, item: '', shipping: 0});
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Auth Modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Admin Data
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const PAYMENT_NUMBERS = {
    bkash: '01518395772',
    nagad: '01846800973'
  };

  const specialties = useMemo(() => ['All', ...Array.from(new Set(DOCTORS.map(d => d.specialty)))], []);
  const districts = useMemo(() => ['All', ...DISTRICTS], []);

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) || 
                            d.specialty.toLowerCase().includes(doctorSearchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All' || d.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [doctorSearchTerm, selectedSpecialty]);

  const filteredClinics = useMemo(() => {
    return CLINICS.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(clinicSearchTerm.toLowerCase());
      const matchesDistrict = selectedDistrict === 'All' || c.district === selectedDistrict;
      return matchesSearch && matchesDistrict;
    });
  }, [clinicSearchTerm, selectedDistrict]);

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

  useEffect(() => {
    if (role === UserRole.ADMIN && activeTab === 'orders') {
      fetchOrders();
    }
  }, [role, activeTab]);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) setAllOrders(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: { full_name: fullName } } 
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, role: UserRole.PATIENT, full_name: fullName });
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
      setShowAuthModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAIQuery = async () => {
    if (!healthSearch) return;
    setGeminiResult('আপনার জিজ্ঞাসিত তথ্য বিশ্লেষণ করা হচ্ছে...');
    try {
      const res = await gemini.consultHealth(healthSearch);
      setGeminiResult(res || 'দুঃখিত, কোনো তথ্য পাওয়া যায়নি।');
    } catch (err) {
      setGeminiResult('এআই সার্ভিস এই মুহূর্তে পাওয়া যাচ্ছে না।');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('নম্বরটি কপি করা হয়েছে!');
  };

  const processPayment = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!trxId || !senderName || !senderContact) {
      alert('অনুগ্রহ করে সব তথ্য সঠিকভাবে প্রদান করুন।');
      return;
    }

    setIsProcessingPayment(true);
    const orderData: Order = {
      user_id: user.id,
      user_email: user.email,
      item_name: showPayment.item,
      amount: showPayment.amount,
      shipping: showPayment.shipping,
      payment_method: paymentMethod || 'unknown',
      sender_name: senderName,
      sender_contact: senderContact,
      trx_id: trxId,
      status: 'pending'
    };

    try {
      const { error } = await supabase.from('orders').insert(orderData);
      if (error) throw error;
      
      alert(`ধন্যবাদ! আপনার পেমেন্ট রিকোয়েস্ট গ্রহণ করা হয়েছে। মডারেটর শীঘ্রই যাচাই করে আপনাকে জানাবে।`);
      setShowPayment({show: false, amount: 0, item: '', shipping: 0});
      setPaymentMethod(null);
      setTrxId('');
      setSenderName('');
      setSenderContact('');
    } catch (err: any) {
      alert('পেমেন্ট সেভ করতে সমস্যা হয়েছে। ট্রানজেকশন আইডি নোট করে রাখুন। ' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const openPayment = (item: string, price: number, isShippable: boolean) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setPaymentMethod(null);
    setTrxId('');
    setSenderName('');
    setSenderContact('');
    setShowPayment({
      show: true,
      amount: price,
      item: item,
      shipping: isShippable ? 100 : 0
    });
  };

  // Define navigation tabs outside return to ensure stable rendering and avoid parsing issues
  const navigationTabs = useMemo(() => [
    { id: 'home', label: 'হোম', icon: '🏠', color: 'text-cyan-400', glow: 'glow-cyan' },
    { id: 'clinics', label: 'ক্লিনিক', icon: '🏥', color: 'text-emerald-400', glow: 'glow-emerald' },
    { id: 'pharmacy', label: 'শপ', icon: '🛒', color: 'text-orange-400', glow: 'glow-orange' },
    ...(role === UserRole.ADMIN ? [{ id: 'orders', label: 'অর্ডার', icon: '📜', color: 'text-yellow-400', glow: 'glow-orange' }] : []),
    { id: 'about', label: 'তথ্য', icon: 'ℹ️', color: 'text-indigo-400', glow: 'glow-indigo' },
    { id: 'profile', label: 'প্রোফাইল', icon: '👤', color: 'text-fuchsia-400', glow: 'glow-fuchsia' },
  ], [role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center max-w-lg mx-auto p-6">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">JB Healthcare</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-800 tracking-tight cursor-pointer" onClick={() => setActiveTab('home')}>JB Healthcare</h1>
        <div className="flex gap-2">
           {user ? (
             <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-black shadow-inner">
               {user.email[0].toUpperCase()}
             </button>
           ) : (
             <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">লগিন</button>
           )}
        </div>
      </header>

      <main className="flex-1 p-6 mobile-p-safe space-y-8 overflow-y-auto no-scrollbar">
        
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="p-1.5 bg-white/20 rounded-xl">✨</span> AI হেলথ অ্যাসিস্ট্যান্ট
              </h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="আপনার স্বাস্থ্য সমস্যা লিখুন..." 
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 px-5 text-sm outline-none placeholder:text-white/40 focus:bg-white/20 transition-all font-medium"
                  value={healthSearch}
                  onChange={(e) => setHealthSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
                />
                <button onClick={handleAIQuery} className="absolute right-2 top-1.5 bg-white text-blue-600 p-2.5 rounded-xl shadow-lg active:scale-90 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </button>
              </div>
              {geminiResult && (
                <div className="mt-4 p-4 bg-black/20 rounded-2xl text-[10px] font-medium leading-relaxed border border-white/5 max-h-40 overflow-y-auto no-scrollbar whitespace-pre-wrap">
                  {geminiResult}
                </div>
              )}
            </div>

            {/* Emergency Services */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">ইমারজেন্সি সার্ভিস</h2>
                <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">+ ১০০৳ পরিবহন</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {EMERGENCY_SERVICES.map(s => (
                  <Card key={s.id} className="text-center cursor-pointer border-slate-100 hover:border-blue-400 group" onClick={() => openPayment(s.name, s.price, true)}>
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                    <h4 className="text-xs font-black text-slate-700">{s.name}</h4>
                    <p className="text-blue-600 font-black text-sm mt-2">৳{s.price}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Doctors Section with Search & Filter */}
            <section className="space-y-4">
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">ডক্টর খুঁজুন</h2>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="নাম বা বিশেষত্ব লিখে খুঁজুন..." 
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 text-sm outline-none focus:border-blue-500 transition-all font-medium"
                    value={doctorSearchTerm}
                    onChange={(e) => setDoctorSearchTerm(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {specialties.map(s => (
                    <button 
                      key={s}
                      onClick={() => setSelectedSpecialty(s)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSpecialty === s ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}
                    >
                      {s === 'All' ? 'সব বিভাগ' : s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredDoctors.length > 0 ? filteredDoctors.map(d => (
                  <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-500">
                    <img src={d.image} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-50" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">{d.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{d.specialty} • {d.degree}</p>
                      <Button onClick={() => openPayment(`সিরিয়াল: ${d.name}`, 500, false)} className="mt-2 py-1.5 px-4 text-[9px]">সিরিয়াল নিন</Button>
                    </div>
                  </Card>
                )) : (
                  <p className="text-center text-slate-400 text-xs py-10 font-bold">কোনো ডাক্তার পাওয়া যায়নি!</p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'clinics' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col gap-4">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">হাসপাতাল ও ক্লিনিক</h2>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="হাসপাতালের নাম লিখে খুঁজুন..." 
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 text-sm outline-none focus:border-blue-500 transition-all font-medium"
                    value={clinicSearchTerm}
                    onChange={(e) => setClinicSearchTerm(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {districts.map(d => (
                    <button 
                      key={d}
                      onClick={() => setSelectedDistrict(d)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedDistrict === d ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}
                    >
                      {d === 'All' ? 'সব এলাকা' : d}
                    </button>
                  ))}
                </div>
             </div>
             <div className="grid grid-cols-1 gap-4">
               {filteredClinics.map(clinic => (
                 <Card key={clinic.id} className="overflow-hidden flex flex-col sm:flex-row gap-4 p-0">
                   <img src={clinic.image} className="w-full sm:w-32 h-32 object-cover" />
                   <div className="p-4 flex-1">
                     <h4 className="font-bold text-sm text-slate-800">{clinic.name}</h4>
                     <p className="text-[10px] text-slate-400 mt-1">{clinic.address}</p>
                     <div className="mt-3 flex items-center justify-between">
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg uppercase">{clinic.district}</span>
                        <Button className="py-1 px-3 text-[9px]" variant="secondary" onClick={() => setActiveTab('home')}>ডক্টর দেখুন</Button>
                     </div>
                   </div>
                 </Card>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'pharmacy' && (
          <div className="space-y-6">
             <div className="bg-orange-500 p-6 rounded-[30px] text-white shadow-xl flex justify-between items-center">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest mb-1">মেডিসিন শপ</h3>
                   <p className="text-[10px] font-bold opacity-90">ডেলিভারি ১০০ টাকা</p>
                </div>
                <div className="text-4xl">💊</div>
             </div>
             <div className="grid grid-cols-2 gap-4">
              {MEDICINES.map(m => (
                <Card key={m.id} className="text-center group flex flex-col">
                  <img src={m.image} className="w-full h-28 object-contain mb-3" />
                  <h4 className="text-xs font-black text-slate-700 line-clamp-1">{m.name}</h4>
                  <p className="text-blue-600 font-black mt-1">৳{m.price}</p>
                  <Button onClick={() => openPayment(m.name, m.price, true)} className="mt-3 w-full py-2">অর্ডার দিন</Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && role === UserRole.ADMIN && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-black text-slate-800">পেমেন্ট হিস্ট্রি (Admin)</h2>
            <div className="space-y-4">
              {allOrders.length > 0 ? allOrders.map(order => (
                <Card key={order.id} className="space-y-2 border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-black text-slate-800">{order.item_name}</p>
                    <span className="text-[8px] font-black uppercase bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-lg">{order.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium">
                    <p>প্রেরক: <span className="text-slate-800 font-bold">{order.sender_name}</span></p>
                    <p>কন্টাক্ট: <span className="text-slate-800 font-bold">{order.sender_contact}</span></p>
                    <p>টাকা: <span className="text-blue-600 font-bold">৳{order.amount + order.shipping}</span></p>
                    <p>মেথড: <span className="text-slate-800 font-bold uppercase">{order.payment_method}</span></p>
                  </div>
                  <p className="text-[9px] text-slate-400 bg-slate-50 p-2 rounded-lg font-black uppercase tracking-wider">TrxID: {order.trx_id}</p>
                  <p className="text-[8px] text-slate-300">{new Date(order.created_at!).toLocaleString('bn-BD')}</p>
                </Card>
              )) : (
                <p className="text-center text-slate-400 text-xs py-10 font-bold">কোনো পেমেন্ট রেকর্ড নেই।</p>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'videos' || activeTab === 'about' || activeTab === 'profile') && (
           <div className="flex flex-col items-center justify-center py-24 text-slate-300">
             <div className="text-5xl mb-4 opacity-20">🏥</div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">শীঘ্রই আসছে...</p>
           </div>
        )}
      </main>

      {/* Floating Buttons */}
      <div className="fixed bottom-32 right-6 z-50 flex flex-col gap-4 items-end">
        <a href="https://wa.me/8801518395772" target="_blank" className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg animate-float">
           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.434 5.705 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      </div>

      {/* Navigation Footer */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/95 backdrop-blur-2xl flex justify-around items-center py-5 px-3 rounded-[36px] shadow-2xl border border-white/10 ring-1 ring-white/5">
        {navigationTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? `${tab.color} scale-125 ${tab.glow}` : 'text-slate-500 opacity-60 hover:opacity-100'}`}
            >
              <span className="text-xl drop-shadow-md">{tab.icon}</span>
              <span className={`text-[7px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-80'}`}>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Payment Modal */}
      {showPayment.show && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300 p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[40px] p-8 pb-12 space-y-6 animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center border-b pb-4">
                 <h2 className="text-xl font-black text-slate-800 tracking-tight">পেমেন্ট নিশ্চিত করুন</h2>
                 <button onClick={() => {setShowPayment({show: false, amount: 0, item: '', shipping: 0}); setPaymentMethod(null); setTrxId('');}} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-100 p-2 rounded-full">✕</button>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-3">
                 <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">সার্ভিস</p>
                    <p className="text-sm text-slate-800 font-bold">{showPayment.item}</p>
                 </div>
                 <div className="flex justify-between items-center text-blue-600 font-bold">
                    <p className="text-[10px] uppercase font-black tracking-widest">মোট টাকা</p>
                    <p className="text-lg font-black">৳{showPayment.amount + showPayment.shipping}</p>
                 </div>
              </div>

              {!paymentMethod ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">মেথড বেছে নিন</p>
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => setPaymentMethod('bkash')} className="p-5 rounded-3xl border-2 border-slate-100 flex flex-col items-center gap-3 hover:border-pink-500 hover:bg-pink-50 transition-all">
                        <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-12 h-12 object-contain" />
                        <span className="text-[10px] font-black uppercase text-pink-600">বিকাশ</span>
                     </button>
                     <button onClick={() => setPaymentMethod('nagad')} className="p-5 rounded-3xl border-2 border-slate-100 flex flex-col items-center gap-3 hover:border-orange-500 hover:bg-orange-50 transition-all">
                        <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="w-12 h-12 object-contain" />
                        <span className="text-[10px] font-black uppercase text-orange-600">নগদ</span>
                     </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className={`p-6 rounded-[32px] border-2 ${paymentMethod === 'bkash' ? 'border-pink-100 bg-pink-50' : 'border-orange-100 bg-orange-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <p className={`font-black text-xs uppercase tracking-wide ${paymentMethod === 'bkash' ? 'text-pink-600' : 'text-orange-600'}`}>
                        {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} সেন্ড মানি নম্বর
                      </p>
                    </div>
                    <div className="bg-white/90 p-4 rounded-2xl border flex justify-between items-center shadow-sm">
                      <p className="text-lg font-black text-slate-800 tracking-wider">{PAYMENT_NUMBERS[paymentMethod]}</p>
                      <button onClick={() => copyToClipboard(PAYMENT_NUMBERS[paymentMethod])} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-500 active:scale-90">📋</button>
                    </div>
                    <p className="mt-4 text-[10px] text-slate-500 font-medium text-center italic">মোট ৳{showPayment.amount + showPayment.shipping} সেন্ড মানি করার পর নিচের তথ্যগুলো দিন।</p>
                  </div>

                  <div className="space-y-4">
                    <Input label="পেমেন্টকারির নাম" placeholder="আপনার নাম" value={senderName} onChange={setSenderName} required />
                    <Input label="কন্টাক্ট নম্বর" placeholder="01XXX-XXXXXX" value={senderContact} onChange={setSenderContact} required />
                    <Input label="ট্রানজেকশন আইডি (TrxID)" placeholder="ABC123XYZ" value={trxId} onChange={setTrxId} required />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => setPaymentMethod(null)}>পিছনে যান</Button>
                    <Button variant="success" className="flex-[2]" onClick={processPayment} loading={isProcessingPayment}>নিশ্চিত করুন</Button>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <Card className="w-full max-w-sm p-8 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{authMode === 'login' ? 'লগিন' : 'নিবন্ধন'}</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && <Input label="পুরো নাম" placeholder="আপনার নাম" value={fullName} onChange={setFullName} required />}
              <Input label="ইমেইল" type="email" placeholder="example@mail.com" value={email} onChange={setEmail} required />
              <Input label="পাসওয়ার্ড" type="password" placeholder="••••••••" value={password} onChange={setPassword} required />
              <Button type="submit" loading={isProcessingPayment} className="w-full py-4 mt-2">
                {authMode === 'login' ? 'প্রবেশ করুন' : 'অ্যাকাউন্ট খুলুন'}
              </Button>
            </form>
            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-center text-xs font-bold text-blue-600">
              {authMode === 'login' ? 'নতুন অ্যাকাউন্ট খুলুন?' : 'আগে থেকেই অ্যাকাউন্ট আছে?'}
            </button>
          </Card>
        </div>
      )}

    </div>
  );
}
