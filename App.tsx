
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
    active: "bg-emerald-100 text-emerald-600",
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
  const [tickerMessage, setTickerMessage] = useState('জেবি হেলথকেয়ারে আপনাকে স্বাগতম! যে কোনো প্রয়োজনে যোগাযোগ করুন।');

  // Search & Filter States
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  // Payment State
  const [showPayment, setShowPayment] = useState<{show: boolean, amount: number, item: string, shipping: number}>({show: false, amount: 0, item: '', shipping: 0});
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auth Modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'moderator'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);

  // Admin Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [historyTab, setHistoryTab] = useState<'info' | 'history' | 'admin'>('info');

  const PAYMENT_NUMBERS = { bkash: '01518395772', nagad: '01846800973' };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (prof) setProfile(prof);
      }
      // Fetch Ticker
      const { data: settings } = await supabase.from('settings').select('*').eq('key', 'ticker_message').single();
      if (settings) setTickerMessage(settings.value);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchPrescriptions();
      if (profile?.role === UserRole.ADMIN) fetchProfiles();
    }
  }, [user, profile, activeTab]);

  const fetchOrders = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (profile?.role !== UserRole.ADMIN) query = query.eq('user_id', user.id);
    const { data } = await query;
    if (data) setOrders(data);
  };

  const fetchPrescriptions = async () => {
    if (!user) return;
    let query = supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
    if (profile?.role === UserRole.PATIENT) query = query.eq('patient_id', user.id);
    else if (profile?.role === UserRole.DOCTOR) query = query.eq('doctor_id', user.id);
    const { data } = await query;
    if (data) setPrescriptions(data);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('role');
    if (data) setAllProfiles(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (authMode === 'moderator') {
        if (email === 'modaretor' && password === 'jagad01750') {
          // Hardcoded admin login for specific moderator requested
          // Since we use real Supabase Auth, we typically need a real account, 
          // but for this UI purpose, we will simulate or use a specific admin email.
          // Note: In real production, this should be handled via Supabase Roles.
          alert('মডারেটর হিসেবে প্রবেশ করছেন...');
          // Simplified simulation for demo:
          const { data, error } = await supabase.auth.signInWithPassword({ email: 'admin@jb.com', password: 'jagad01750' });
          if (error) throw error;
          setUser(data.user);
          setProfile({ id: data.user.id, full_name: 'Main Moderator', role: UserRole.ADMIN, status: 'active' });
        } else {
          throw new Error('ভুল ইউজারনেম বা পাসওয়ার্ড!');
        }
      } else if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          const newStatus = selectedRole === UserRole.DOCTOR ? 'pending' : 'active';
          const newProfile = { id: data.user.id, role: selectedRole, full_name: fullName, phone, status: newStatus };
          await supabase.from('profiles').insert(newProfile);
          if (newStatus === 'pending') {
            alert('আপনার আবেদন মডারেটর এর কাছে পাঠানো হয়েছে। এপ্রুভ হলে আপনি লগিন করতে পারবেন।');
            await supabase.auth.signOut();
            window.location.reload();
          } else {
            setProfile(newProfile as Profile);
            setUser(data.user);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (prof?.status === 'pending') {
          await supabase.auth.signOut();
          throw new Error('আপনার ডক্টর অ্যাকাউন্টটি এখনো পেন্ডিং আছে। অনুগ্রহ করে মডারেটরের এপ্রুভাল এর অপেক্ষা করুন।');
        }
        setUser(data.user);
        setProfile(prof);
      }
      setShowAuthModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateProfileStatus = async (id: string, status: Profile['status']) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (!error) fetchProfiles();
  };

  const updateTicker = async () => {
    const { error } = await supabase.from('settings').upsert({ key: 'ticker_message', value: tickerMessage });
    if (!error) alert('নোটিফিকেশন বার আপডেট করা হয়েছে!');
  };

  const processPayment = async () => {
    if (!user) { setShowAuthModal(true); return; }
    setIsProcessing(true);
    try {
      const orderData = { user_id: user.id, user_email: user.email, item_name: showPayment.item, amount: showPayment.amount, shipping: showPayment.shipping, payment_method: paymentMethod, sender_name: senderName, sender_contact: senderContact, trx_id: trxId, status: 'pending' };
      const { error } = await supabase.from('orders').insert(orderData);
      if (error) throw error;
      alert('রিকোয়েস্ট সফল!');
      setShowPayment({show: false, amount: 0, item: '', shipping: 0});
    } catch (err: any) { alert(err.message); }
    finally { setIsProcessing(false); }
  };

  const filteredDoctors = useMemo(() => DOCTORS.filter(d => d.name.includes(doctorSearchTerm) && (selectedSpecialty === 'All' || d.specialty === selectedSpecialty)), [doctorSearchTerm, selectedSpecialty]);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black">JB HEALTHCARE...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Ongoing Information Bar */}
      <div className="bg-red-600 text-white py-1.5 overflow-hidden whitespace-nowrap z-50 shadow-md">
        <div className="animate-marquee inline-block pl-[100%] font-bold text-[10px] uppercase tracking-wider">
          {tickerMessage} • ইমারজেন্সি কল: ০১৫১৮৩৯৫৭৭২ • 
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-800 tracking-tight" onClick={() => setActiveTab('home')}>JB Healthcare</h1>
        <div className="flex gap-2">
           {user ? (
             <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-black">{user.email[0].toUpperCase()}</button>
           ) : (
             <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">লগিন</button>
           )}
        </div>
      </header>

      <main className="flex-1 p-6 mobile-p-safe space-y-8 overflow-y-auto no-scrollbar">
        
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">✨ AI হেলথ অ্যাসিস্ট্যান্ট</h3>
              <input type="text" placeholder="আপনার সমস্যা লিখুন..." className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-5 text-sm outline-none" />
            </div>

            <section>
              <h2 className="text-lg font-black text-slate-800 mb-4">ইমারজেন্সি সার্ভিস</h2>
              <div className="grid grid-cols-2 gap-4">
                {EMERGENCY_SERVICES.map(s => (
                  <Card key={s.id} className="text-center" onClick={() => setShowPayment({show: true, amount: s.price, item: s.name, shipping: 100})}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <h4 className="text-xs font-black">{s.name}</h4>
                    <p className="text-blue-600 font-black text-sm mt-1">৳{s.price}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-800">ডক্টর খুঁজুন</h2>
              <div className="space-y-4">
                {filteredDoctors.slice(0, 5).map(d => (
                  <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-500">
                    <img src={d.image} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{d.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{d.specialty}</p>
                      <button onClick={() => setShowPayment({show: true, amount: 500, item: `সিরিয়াল: ${d.name}`, shipping: 0})} className="mt-2 text-[8px] bg-blue-600 text-white px-3 py-1 rounded-lg font-black">সিরিয়াল নিন</button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="flex items-center gap-4 py-8 bg-blue-50 border-none">
               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-black">{profile?.full_name[0]}</div>
               <div>
                  <h4 className="font-black text-lg">{profile?.full_name}</h4>
                  <p className="text-xs text-slate-500 uppercase font-black">{profile?.role}</p>
               </div>
            </Card>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button onClick={() => setHistoryTab('info')} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${historyTab === 'info' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>তথ্য</button>
              <button onClick={() => setHistoryTab('history')} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${historyTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>ইতিহাস</button>
              {profile?.role === UserRole.ADMIN && (
                <button onClick={() => setHistoryTab('admin')} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${historyTab === 'admin' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400'}`}>ম্যানেজমেন্ট</button>
              )}
            </div>

            {historyTab === 'admin' && profile?.role === UserRole.ADMIN && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-red-600">নোটিফিকেশন বার আপডেট</h3>
                  <textarea value={tickerMessage} onChange={(e) => setTickerMessage(e.target.value)} className="w-full bg-white border p-4 rounded-2xl text-sm font-medium outline-none h-24" />
                  <Button variant="danger" className="w-full" onClick={updateTicker}>নোটিফিকেশন আপডেট করুন</Button>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">ডক্টর ও ইউজার লিস্ট</h3>
                  {allProfiles.map(p => (
                    <Card key={p.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black">{p.full_name}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{p.role} • {p.status}</p>
                      </div>
                      {p.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateProfileStatus(p.id, 'active')} className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded">Approve</button>
                          <button onClick={() => updateProfileStatus(p.id, 'suspended')} className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded">Reject</button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {historyTab === 'history' && (
              <div className="space-y-4">
                 {prescriptions.map(p => (
                   <Card key={p.id} className="border-l-4 border-l-blue-600">
                     <p className="text-xs font-black">{p.doctor_name}</p>
                     <p className="text-[10px] text-slate-500 mt-1">{p.medicines}</p>
                   </Card>
                 ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/95 flex justify-around items-center py-5 rounded-[36px] shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-500'}`}><span className="text-xl">🏠</span></button>
        <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-1 ${activeTab === 'orders' ? 'text-yellow-400' : 'text-slate-500'}`}><span className="text-xl">📜</span></button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-fuchsia-400' : 'text-slate-500'}`}><span className="text-xl">👤</span></button>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <Card className="w-full max-w-sm p-8 space-y-5">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-black">{authMode === 'login' ? 'লগিন' : authMode === 'moderator' ? 'মডারেটর লগিন' : 'নিবন্ধন'}</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400">✕</button>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-2">
                    <button type="button" onClick={() => setSelectedRole(UserRole.PATIENT)} className={`flex-1 py-1.5 text-[8px] font-black rounded-lg ${selectedRole === UserRole.PATIENT ? 'bg-white text-blue-600' : 'text-slate-400'}`}>পেশেন্ট</button>
                    <button type="button" onClick={() => setSelectedRole(UserRole.DOCTOR)} className={`flex-1 py-1.5 text-[8px] font-black rounded-lg ${selectedRole === UserRole.DOCTOR ? 'bg-white text-blue-600' : 'text-slate-400'}`}>ডাক্তার</button>
                  </div>
                  <Input label="নাম" value={fullName} onChange={setFullName} required />
                  <Input label="ফোন" value={phone} onChange={setPhone} required />
                </>
              )}
              <Input label={authMode === 'moderator' ? "ইউজারনেম" : "ইমেইল"} type={authMode === 'moderator' ? "text" : "email"} value={email} onChange={setEmail} required />
              <Input label="পাসওয়ার্ড" type="password" value={password} onChange={setPassword} required />
              <Button type="submit" loading={isProcessing} className="w-full">{authMode === 'register' ? 'রেজিস্ট্রেশন করুন' : 'প্রবেশ করুন'}</Button>
            </form>

            <div className="space-y-2 pt-2">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-[10px] font-black text-blue-600 uppercase">
                {authMode === 'login' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগিন করুন'}
              </button>
              <button onClick={() => setAuthMode('moderator')} className="w-full text-[10px] font-black text-red-600 uppercase border-t pt-2 mt-2">মডারেটর লগিন</button>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment.show && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-end justify-center p-4">
           <div className="bg-white w-full rounded-t-[40px] p-8 space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-black">পেমেন্ট: {showPayment.item}</h2>
              <p className="text-2xl font-black text-blue-600">৳{showPayment.amount + showPayment.shipping}</p>
              {!paymentMethod ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMethod('bkash')} className="p-4 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-pink-500">
                    <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-10 h-10" />
                    <span className="text-[10px] font-black text-pink-600">বিকাশ</span>
                  </button>
                  <button onClick={() => setPaymentMethod('nagad')} className="p-4 border-2 rounded-2xl flex flex-col items-center gap-2 hover:border-orange-500">
                    <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="w-10 h-10" />
                    <span className="text-[10px] font-black text-orange-600">নগদ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl flex justify-between font-black">{PAYMENT_NUMBERS[paymentMethod]} <button onClick={() => alert('কপি হয়েছে')}>📋</button></div>
                  <Input label="পেমেন্টকারির নাম" value={senderName} onChange={setSenderName} required />
                  <Input label="আপনার নম্বর" value={senderContact} onChange={setSenderContact} required />
                  <Input label="TrxID" value={trxId} onChange={setTrxId} required />
                  <Button variant="success" className="w-full" onClick={processPayment} loading={isProcessing}>নিশ্চিত করুন</Button>
                </div>
              )}
              <button onClick={() => setShowPayment({show: false, amount: 0, item: '', shipping: 0})} className="w-full text-slate-400 text-xs font-bold py-2">বাতিল করুন</button>
           </div>
        </div>
      )}

    </div>
  );
}
