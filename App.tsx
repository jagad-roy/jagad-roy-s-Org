
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Doctor, Clinic, Medicine, Order, Profile, Prescription } from './types';
import { DOCTORS, CLINICS, MEDICINES, EMERGENCY_SERVICES, DISTRICTS } from './constants';
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
    verified: "bg-blue-100 text-blue-600",
    processing: "bg-indigo-100 text-indigo-600",
    completed: "bg-emerald-100 text-emerald-600",
    cancelled: "bg-rose-100 text-rose-600"
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
  const [profile, setProfile] = useState<Profile | null>(null);
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
  const [phone, setPhone] = useState('');

  // Data Lists
  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [historyTab, setHistoryTab] = useState<'info' | 'history'>('info');

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
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (prof) setProfile(prof);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchPrescriptions();
    }
  }, [user, profile, activeTab]);

  const fetchOrders = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (profile?.role !== UserRole.ADMIN) {
      query = query.eq('user_id', user.id);
    }
    const { data, error } = await query;
    if (!error && data) setOrders(data);
  };

  const fetchPrescriptions = async () => {
    if (!user) return;
    let query = supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
    
    if (profile?.role === UserRole.PATIENT) {
      query = query.eq('patient_id', user.id);
    } else if (profile?.role === UserRole.DOCTOR) {
      query = query.eq('doctor_id', user.id);
    } else if (profile?.role !== UserRole.ADMIN) {
       return; // Non-admin/patient/doctor can't see anything
    }

    const { data, error } = await query;
    if (!error && data) setPrescriptions(data);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (profile?.role !== UserRole.ADMIN) return;
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) fetchOrders();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          const newProfile = { id: data.user.id, role: UserRole.PATIENT, full_name: fullName, phone };
          await supabase.from('profiles').insert(newProfile);
          setProfile(newProfile as Profile);
          setUser(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          if (prof) setProfile(prof);
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
    setGeminiResult('বিশ্লেষণ করা হচ্ছে...');
    try {
      const res = await gemini.consultHealth(healthSearch);
      setGeminiResult(res || 'তথ্য পাওয়া যায়নি।');
    } catch (err) {
      setGeminiResult('সার্ভিস ত্রুটি।');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('কপি করা হয়েছে!');
  };

  const processPayment = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!trxId || !senderName || !senderContact) { alert('সব তথ্য দিন।'); return; }

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
      alert(`রিকোয়েস্ট সফল! মডারেটর শীঘ্রই আপনার সাথে যোগাযোগ করবে।`);
      setShowPayment({show: false, amount: 0, item: '', shipping: 0});
      setPaymentMethod(null);
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const openPayment = (item: string, price: number, isShippable: boolean) => {
    if (!user) { setShowAuthModal(true); return; }
    setPaymentMethod(null);
    setShowPayment({
      show: true,
      amount: price,
      item: item,
      shipping: isShippable ? 100 : 0
    });
  };

  const navigationTabs = useMemo(() => [
    { id: 'home', label: 'হোম', icon: '🏠', color: 'text-cyan-400' },
    { id: 'clinics', label: 'ক্লিনিক', icon: '🏥', color: 'text-emerald-400' },
    { id: 'pharmacy', label: 'শপ', icon: '🛒', color: 'text-orange-400' },
    { id: 'orders', label: profile?.role === UserRole.ADMIN ? 'অর্ডার' : 'অর্ডার হিস্ট্রি', icon: '📜', color: 'text-yellow-400' },
    { id: 'profile', label: 'প্রোফাইল', icon: '👤', color: 'text-fuchsia-400' },
  ], [profile]);

  if (isLoading) return <div className="flex h-screen items-center justify-center font-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-800 tracking-tight cursor-pointer" onClick={() => setActiveTab('home')}>JB Healthcare</h1>
        <div className="flex gap-2">
           {user ? (
             <div className="flex items-center gap-2">
               {profile?.role === UserRole.ADMIN && <span className="text-[8px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-lg uppercase">Admin</span>}
               {profile?.role === UserRole.DOCTOR && <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg uppercase">Doctor</span>}
               <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-black shadow-inner">
                 {user.email[0].toUpperCase()}
               </button>
             </div>
           ) : (
             <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">লগিন</button>
           )}
        </div>
      </header>

      <main className="flex-1 p-6 mobile-p-safe space-y-8 overflow-y-auto no-scrollbar">
        
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">✨ AI হেলথ অ্যাসিস্ট্যান্ট</h3>
              <div className="relative">
                <input type="text" placeholder="আপনার সমস্যা লিখুন..." className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 px-5 text-sm outline-none placeholder:text-white/40 focus:bg-white/20 transition-all font-medium" value={healthSearch} onChange={(e) => setHealthSearch(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()} />
                <button onClick={handleAIQuery} className="absolute right-2 top-1.5 bg-white text-blue-600 p-2.5 rounded-xl shadow-lg active:scale-90 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </button>
              </div>
              {geminiResult && <div className="mt-4 p-4 bg-black/20 rounded-2xl text-[10px] font-medium leading-relaxed max-h-40 overflow-y-auto no-scrollbar">{geminiResult}</div>}
            </div>

            {/* Emergency Services */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">ইমারজেন্সি সার্ভিস</h2>
                <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">+ ১০০৳ পরিবহন</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {EMERGENCY_SERVICES.map(s => (
                  <Card key={s.id} className="text-center cursor-pointer border-slate-100 hover:border-blue-400" onClick={() => openPayment(s.name, s.price, true)}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <h4 className="text-xs font-black text-slate-700">{s.name}</h4>
                    <p className="text-blue-600 font-black text-sm mt-2">৳{s.price}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Doctors Section */}
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">ডক্টর খুঁজুন</h2>
              <div className="relative">
                <input type="text" placeholder="নাম বা বিভাগ..." className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 text-sm outline-none focus:border-blue-500 transition-all font-medium" value={doctorSearchTerm} onChange={(e) => setDoctorSearchTerm(e.target.value)} />
              </div>
              <div className="space-y-4">
                {filteredDoctors.slice(0, 10).map(d => (
                  <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-500">
                    <img src={d.image} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">{d.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{d.specialty} • {d.degree}</p>
                      <Button onClick={() => openPayment(`সিরিয়াল: ${d.name}`, 500, false)} className="mt-2 py-1.5 px-4 text-[9px]">সিরিয়াল নিন</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'clinics' && (
          <div className="space-y-8">
            <h2 className="text-xl font-black text-slate-800">হাসপাতাল ও ক্লিনিক</h2>
            <div className="space-y-4">
              {CLINICS.map(clinic => (
                <Card key={clinic.id} className="p-0 overflow-hidden flex flex-col sm:flex-row gap-4">
                   <img src={clinic.image} className="w-full sm:w-32 h-32 object-cover" />
                   <div className="p-4 flex-1">
                      <h4 className="font-bold text-sm text-slate-800">{clinic.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{clinic.address}</p>
                      <Badge status="verified" />
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
                <Card key={m.id} className="text-center">
                  <img src={m.image} className="w-full h-28 object-contain mb-3" />
                  <h4 className="text-xs font-black text-slate-700 line-clamp-1">{m.name}</h4>
                  <p className="text-blue-600 font-black mt-1">৳{m.price}</p>
                  <Button onClick={() => openPayment(m.name, m.price, true)} className="mt-3 w-full py-2">অর্ডার দিন</Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-black text-slate-800">{profile?.role === UserRole.ADMIN ? 'অর্ডার হিস্ট্রি (Admin)' : 'আমার অর্ডারসমূহ'}</h2>
            <div className="space-y-4">
              {orders.length > 0 ? orders.map(order => (
                <Card key={order.id} className={`space-y-3 ${profile?.role === UserRole.ADMIN ? 'border-l-4 border-l-indigo-500' : 'border-l-4 border-l-emerald-500'}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-800">{order.item_name}</p>
                      <p className="text-[9px] text-slate-400">অর্ডার আইডি: #{order.id?.slice(0,8)}</p>
                    </div>
                    <Badge status={order.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[10px]">
                    <p className="text-slate-500">টাকা: <span className="text-blue-600 font-bold">৳{order.amount + order.shipping}</span></p>
                    <p className="text-slate-500">মেথড: <span className="text-slate-800 font-bold uppercase">{order.payment_method}</span></p>
                    {profile?.role === UserRole.ADMIN && (
                      <>
                        <p className="text-slate-500">প্রেরক: <span className="text-slate-800 font-bold">{order.sender_name}</span></p>
                        <p className="text-slate-500">ফোন: <span className="text-slate-800 font-bold">{order.sender_contact}</span></p>
                      </>
                    )}
                  </div>

                  {profile?.role === UserRole.ADMIN && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                      <button onClick={() => updateOrderStatus(order.id!, 'verified')} className="text-[8px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100">Verify</button>
                      <button onClick={() => updateOrderStatus(order.id!, 'processing')} className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100">Process</button>
                      <button onClick={() => updateOrderStatus(order.id!, 'completed')} className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100">Complete</button>
                      <button onClick={() => updateOrderStatus(order.id!, 'cancelled')} className="text-[8px] font-black bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-100">Cancel</button>
                      <a href={`https://wa.me/${order.sender_contact}`} className="text-[8px] font-black bg-green-50 text-green-600 px-3 py-1.5 rounded-lg border border-green-100 ml-auto">WhatsApp</a>
                    </div>
                  )}
                </Card>
              )) : (
                <p className="text-center text-slate-400 text-xs py-10 font-bold">কোনো অর্ডার পাওয়া যায়নি।</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="flex items-center gap-4 py-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-black">
                 {profile?.full_name[0] || '👤'}
               </div>
               <div>
                  <h4 className="font-black text-lg text-slate-800">{profile?.full_name || 'পেশেন্ট'}</h4>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <p className="text-xs text-blue-600 font-bold mt-1">{profile?.phone || 'ফোন যুক্ত নেই'}</p>
               </div>
            </Card>

            {/* Profile Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setHistoryTab('info')} 
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${historyTab === 'info' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                প্রোফাইল তথ্য
              </button>
              <button 
                onClick={() => setHistoryTab('history')} 
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${historyTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                {profile?.role === UserRole.DOCTOR ? 'আমার রোগীগণ' : 'চিকিৎসা ইতিহাস'}
              </button>
            </div>

            {historyTab === 'info' ? (
              <div className="space-y-4">
                <Button onClick={() => window.open('https://wa.me/8801518395772', '_blank')} variant="success" className="w-full">লাইভ সাপোর্ট (হোয়াটসঅ্যাপ)</Button>
                <Button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} variant="danger" className="w-full">লগ আউট</Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-5">
                {prescriptions.length > 0 ? prescriptions.map(p => (
                  <Card key={p.id} className="space-y-4 border-l-4 border-l-blue-600">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h5 className="font-black text-slate-800 text-sm">
                          {profile?.role === UserRole.DOCTOR ? `রোগী: ${p.patient_name}` : `ডাক্তার: ${p.doctor_name}`}
                        </h5>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                          {new Date(p.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <Badge status="completed" />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">নির্ধারিত ওষুধসমূহ:</p>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{p.medicines}</p>
                       </div>
                       {p.notes && (
                         <div className="space-y-1">
                           <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">ডাক্তারের পরামর্শ:</p>
                           <p className="text-xs text-slate-600 italic">"{p.notes}"</p>
                         </div>
                       )}
                    </div>

                    {p.next_visit_date && (
                      <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl">
                        <span className="text-lg">📅</span>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">পরবর্তী সাক্ষাতের তারিখ:</p>
                          <p className="text-[10px] font-bold text-emerald-800">{new Date(p.next_visit_date).toLocaleDateString('bn-BD')}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                )) : (
                  <div className="text-center py-20">
                     <div className="text-5xl mb-4 opacity-10">📑</div>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">কোনো রেকর্ড পাওয়া যায়নি</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/95 backdrop-blur-2xl flex justify-around items-center py-5 px-3 rounded-[36px] shadow-2xl">
        {navigationTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? `${tab.color} scale-125` : 'text-slate-500 opacity-60'}`}>
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[7px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Payment Modal */}
      {showPayment.show && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[40px] p-8 pb-12 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-4">
                 <h2 className="text-xl font-black text-slate-800">পেমেন্ট নিশ্চিত করুন</h2>
                 <button onClick={() => setShowPayment({show: false, amount: 0, item: '', shipping: 0})} className="text-slate-400">✕</button>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-[32px] space-y-3">
                 <p className="text-xs font-bold text-slate-800">{showPayment.item}</p>
                 <p className="text-2xl font-black text-blue-600">৳{showPayment.amount + showPayment.shipping}</p>
              </div>

              {!paymentMethod ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMethod('bkash')} className="p-4 rounded-2xl border-2 border-slate-100 flex flex-col items-center gap-2 hover:border-pink-500">
                    <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-10 h-10 object-contain" />
                    <span className="text-[10px] font-black text-pink-600">বিকাশ</span>
                  </button>
                  <button onClick={() => setPaymentMethod('nagad')} className="p-4 rounded-2xl border-2 border-slate-100 flex flex-col items-center gap-2 hover:border-orange-500">
                    <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="w-10 h-10 object-contain" />
                    <span className="text-[10px] font-black text-orange-600">নগদ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center">
                    <p className="text-lg font-black">{PAYMENT_NUMBERS[paymentMethod]}</p>
                    <button onClick={() => copyToClipboard(PAYMENT_NUMBERS[paymentMethod])} className="text-blue-600 font-bold">কপি</button>
                  </div>
                  <Input label="পেমেন্টকারির নাম" value={senderName} onChange={setSenderName} required />
                  <Input label="আপনার নম্বর" value={senderContact} onChange={setSenderContact} required />
                  <Input label="ট্রানজেকশন আইডি (TrxID)" value={trxId} onChange={setTrxId} required />
                  <Button variant="success" className="w-full py-4" onClick={processPayment} loading={isProcessingPayment}>নিশ্চিত করুন</Button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <Card className="w-full max-w-sm p-8 space-y-5">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-black text-slate-800">{authMode === 'login' ? 'লগিন' : 'নিবন্ধন'}</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <Input label="পুরো নাম" placeholder="আপনার নাম" value={fullName} onChange={setFullName} required />
                  <Input label="ফোন নম্বর" placeholder="017XXXXXXXX" value={phone} onChange={setPhone} required />
                </>
              )}
              <Input label="ইমেইল" type="email" value={email} onChange={setEmail} required />
              <Input label="পাসওয়ার্ড" type="password" value={password} onChange={setPassword} required />
              <Button type="submit" loading={isProcessingPayment} className="w-full py-4 mt-2">
                {authMode === 'login' ? 'প্রবেশ করুন' : 'নিবন্ধন করুন'}
              </Button>
            </form>
            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-center text-[10px] font-bold text-blue-600 uppercase">
              {authMode === 'login' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগিন করুন'}
            </button>
          </Card>
        </div>
      )}

    </div>
  );
}
