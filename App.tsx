
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
  const [selectedUserRecords, setSelectedUserRecords] = useState<{profile: Profile, records: Prescription[]} | null>(null);
  const [historyTab, setHistoryTab] = useState<'info' | 'history' | 'admin'>('info');

  const PAYMENT_NUMBERS = { bkash: '01518395772', nagad: '01846800973' };

  useEffect(() => {
    const init = async () => {
      // Check for moderator session in localStorage first
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

  const fetchAnyUserRecords = async (targetProfile: Profile) => {
    const { data } = await supabase.from('prescriptions').select('*').eq('patient_id', targetProfile.id).order('created_at', { ascending: false });
    setSelectedUserRecords({ profile: targetProfile, records: data || [] });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (authMode === 'moderator') {
        // Strict Moderator Validation as requested
        if (email === 'modaretor' && password === 'jagad01750') {
          const adminProfile: Profile = { 
            id: 'admin-hardcoded-id', 
            full_name: 'Main Moderator', 
            role: UserRole.ADMIN, 
            status: 'active',
            phone: '01518395772' 
          };
          setUser({ id: adminProfile.id, email: 'admin@jb.com' });
          setProfile(adminProfile);
          localStorage.setItem('jb_moderator_session', JSON.stringify(adminProfile));
          setShowAuthModal(false);
          alert('মডারেটর হিসেবে সফলভাবে প্রবেশ করেছেন!');
        } else {
          throw new Error('ভুল ইউজারনেম বা পাসওয়ার্ড! মডারেটর ক্রেডেনশিয়াল চেক করুন।');
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
            setShowAuthModal(false);
          } else {
            setProfile(newProfile as Profile);
            setUser(data.user);
            setShowAuthModal(false);
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
        setShowAuthModal(false);
      }
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

  const logout = async () => {
    localStorage.removeItem('jb_moderator_session');
    await supabase.auth.signOut();
    window.location.reload();
  };

  const filteredDoctors = useMemo(() => DOCTORS.filter(d => d.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) && (selectedSpecialty === 'All' || d.specialty === selectedSpecialty)), [doctorSearchTerm, selectedSpecialty]);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">JB HEALTHCARE...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Ongoing Information Bar */}
      <div className="bg-red-600 text-white py-2 overflow-hidden whitespace-nowrap z-50 shadow-lg border-b border-red-700">
        <div className="animate-marquee inline-block pl-[100%] font-black text-[11px] uppercase tracking-wider">
          {tickerMessage} • ইমারজেন্সি সেবা ও সহায়তার জন্য কল করুন: ০১৫১৮৩৯৫৭৭২ • 
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <span className="text-blue-600">JB</span> Healthcare
        </h1>
        <div className="flex gap-2">
           {user ? (
             <button onClick={logout} className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[11px] font-black border-2 border-blue-50 shadow-inner">
               {profile?.full_name?.[0].toUpperCase() || '👤'}
             </button>
           ) : (
             <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-100">প্রবেশ</button>
           )}
        </div>
      </header>

      <main className="flex-1 p-6 mobile-p-safe space-y-8 overflow-y-auto no-scrollbar">
        
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">✨ AI হেলথ অ্যাসিস্ট্যান্ট</h3>
              <div className="relative">
                <input type="text" placeholder="আপনার শারীরিক সমস্যাটি লিখুন..." className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 px-5 text-sm outline-none placeholder:text-white/40 focus:bg-white/20 transition-all font-medium" />
                <button className="absolute right-2 top-1.5 bg-white text-blue-600 p-2.5 rounded-xl">🔍</button>
              </div>
            </div>

            <section>
              <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight">ইমারজেন্সি সার্ভিস</h2>
              <div className="grid grid-cols-2 gap-4">
                {EMERGENCY_SERVICES.map(s => (
                  <Card key={s.id} className="text-center hover:border-blue-300" onClick={() => setShowPayment({show: true, amount: s.price, item: s.name, shipping: 100})}>
                    <div className="text-4xl mb-2">{s.icon}</div>
                    <h4 className="text-[11px] font-black text-slate-700">{s.name}</h4>
                    <p className="text-blue-600 font-black text-sm mt-1">৳{s.price}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-4 pb-10">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">বিশেষজ্ঞ ডক্টরগণ</h2>
              <div className="space-y-4">
                {filteredDoctors.slice(0, 10).map(d => (
                  <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-500">
                    <img src={d.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">{d.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{d.specialty} • {d.degree}</p>
                      <button onClick={() => setShowPayment({show: true, amount: 500, item: `সিরিয়াল: ${d.name}`, shipping: 0})} className="mt-2 text-[9px] bg-blue-600 text-white px-4 py-1.5 rounded-xl font-black shadow-md shadow-blue-50">সিরিয়াল নিন</button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
            <h2 className="text-xl font-black text-slate-800">{profile?.role === UserRole.ADMIN ? 'সকল অর্ডার (Moderator)' : 'আমার অর্ডার হিস্ট্রি'}</h2>
            <div className="space-y-4 pb-10">
              {orders.map(order => (
                <Card key={order.id} className={`border-l-4 ${order.status === 'completed' ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-black text-slate-800">{order.item_name}</p>
                    <Badge status={order.status} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold flex justify-between">
                    <span>টাকা: ৳{order.amount + order.shipping}</span>
                    <span>মেথড: {order.payment_method?.toUpperCase()}</span>
                  </div>
                  {profile?.role === UserRole.ADMIN && (
                    <div className="mt-3 pt-3 border-t flex gap-2 overflow-x-auto no-scrollbar">
                       <button onClick={() => alert('Call Patient: ' + order.sender_contact)} className="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-1 rounded-lg border border-blue-100">CALL</button>
                       <button onClick={() => alert('Status Updated')} className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-1 rounded-lg border border-emerald-100">COMPLETE</button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-300">
            <Card className="flex items-center gap-4 py-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-inner">
               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
                 {profile?.full_name?.[0] || '👤'}
               </div>
               <div>
                  <h4 className="font-black text-lg text-slate-800">{profile?.full_name || 'ইউজার'}</h4>
                  <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest">{profile?.role} • {profile?.status}</p>
                  <p className="text-xs text-slate-500 font-bold">{profile?.phone}</p>
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
              <div className="space-y-8 animate-in fade-in pb-20">
                {selectedUserRecords ? (
                  <div className="space-y-4">
                     <button onClick={() => setSelectedUserRecords(null)} className="text-[10px] font-black text-blue-600 uppercase mb-2 flex items-center gap-1">← ব্যাকে যান</button>
                     <Card className="bg-blue-50 border-blue-100">
                        <h3 className="font-black text-sm">{selectedUserRecords.profile.full_name} এর চিকিৎসা ইতিহাস</h3>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">{selectedUserRecords.profile.phone}</p>
                     </Card>
                     {selectedUserRecords.records.map(p => (
                       <Card key={p.id} className="border-l-4 border-l-blue-600">
                          <p className="text-xs font-black">{p.doctor_name}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{p.medicines}</p>
                          <p className="text-[9px] italic text-slate-400 mt-2">{p.notes}</p>
                       </Card>
                     ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-red-600">অন-গোয়িং বার কন্ট্রোল</h3>
                      <textarea value={tickerMessage} onChange={(e) => setTickerMessage(e.target.value)} className="w-full bg-white border-2 border-slate-100 p-4 rounded-3xl text-sm font-medium outline-none h-28 focus:border-red-400" />
                      <Button variant="danger" className="w-full py-4" onClick={updateTicker}>বার আপডেট করুন</Button>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-200">
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">সকল ইউজার ও ডাক্তার (ট্যাপ করে ইতিহাস দেখুন)</h3>
                      {allProfiles.map(p => (
                        <Card key={p.id} className="flex justify-between items-center group hover:bg-slate-50" onClick={() => fetchAnyUserRecords(p)}>
                          <div>
                            <p className="text-xs font-black text-slate-800">{p.full_name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{p.role} • {p.phone}</p>
                          </div>
                          <div className="flex gap-2">
                            {p.status === 'pending' ? (
                              <div className="flex gap-1">
                                <button onClick={(e) => { e.stopPropagation(); updateProfileStatus(p.id, 'active'); }} className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg">Approve</button>
                                <button onClick={(e) => { e.stopPropagation(); updateProfileStatus(p.id, 'suspended'); }} className="bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-lg">Reject</button>
                              </div>
                            ) : (
                              <Badge status={p.status} />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {historyTab === 'history' && (
              <div className="space-y-4 pb-20">
                 {prescriptions.length > 0 ? prescriptions.map(p => (
                   <Card key={p.id} className="border-l-4 border-l-blue-600">
                     <p className="text-xs font-black text-slate-800">{p.doctor_name}</p>
                     <p className="text-[9px] text-slate-400 uppercase font-black">{new Date(p.created_at).toLocaleDateString()}</p>
                     <div className="mt-3 bg-slate-50 p-3 rounded-xl">
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
                  <Button onClick={() => window.open('https://wa.me/8801518395772', '_blank')} variant="success" className="w-full">লাইভ সাপোর্ট (হোয়াটসঅ্যাপ)</Button>
                  <Button onClick={logout} variant="danger" className="w-full">লগ আউট</Button>
               </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation */}
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
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-black text-slate-800">{authMode === 'login' ? 'লগিন' : authMode === 'moderator' ? 'মডারেটর লগিন' : 'নিবন্ধন'}</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 text-xl font-bold">✕</button>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-2">
                    <button type="button" onClick={() => setSelectedRole(UserRole.PATIENT)} className={`flex-1 py-2 text-[10px] font-black rounded-xl uppercase transition-all ${selectedRole === UserRole.PATIENT ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>পেশেন্ট</button>
                    <button type="button" onClick={() => setSelectedRole(UserRole.DOCTOR)} className={`flex-1 py-2 text-[10px] font-black rounded-xl uppercase transition-all ${selectedRole === UserRole.DOCTOR ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>ডাক্তার</button>
                  </div>
                  <Input label="আপনার পুরো নাম" placeholder="নাম লিখুন" value={fullName} onChange={setFullName} required />
                  <Input label="ফোন নম্বর" placeholder="017XXXXXXXX" value={phone} onChange={setPhone} required />
                </>
              )}
              
              <Input 
                label={authMode === 'moderator' ? "ইউজারনেম (username)" : "ইমেইল অ্যাড্রেস"} 
                placeholder={authMode === 'moderator' ? "modaretor" : "example@mail.com"} 
                type={authMode === 'moderator' ? "text" : "email"} 
                value={email} 
                onChange={setEmail} 
                required 
              />
              <Input label="পাসওয়ার্ড" type="password" placeholder="••••••••" value={password} onChange={setPassword} required />
              
              <Button type="submit" loading={isProcessing} className="w-full py-4 mt-2">
                {authMode === 'register' ? 'রেজিস্ট্রেশন করুন' : 'প্রবেশ করুন'}
              </Button>
            </form>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="w-full text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {authMode === 'login' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগিন করুন'}
              </button>
              <button onClick={() => setAuthMode('moderator')} className="w-full text-[10px] font-black text-red-600 uppercase tracking-widest pt-1">
                মডারেটর লগিন
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment.show && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[48px] p-8 pb-12 space-y-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-20 duration-500">
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
                    <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-12 h-12 object-contain" />
                    <span className="text-[11px] font-black text-pink-600 uppercase">বিকাশ</span>
                  </button>
                  <button onClick={() => setPaymentMethod('nagad')} className="p-6 border-2 border-slate-50 rounded-[28px] flex flex-col items-center gap-3 hover:border-orange-500 transition-all">
                    <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="w-12 h-12 object-contain" />
                    <span className="text-[11px] font-black text-orange-600 uppercase">নগদ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center font-black text-slate-700">
                    {PAYMENT_NUMBERS[paymentMethod]} 
                    <button onClick={() => { navigator.clipboard.writeText(PAYMENT_NUMBERS[paymentMethod]); alert('নম্বর কপি হয়েছে!'); }} className="text-blue-600 text-sm">📋 কপি</button>
                  </div>
                  <Input label="পেমেন্টকারির নাম" value={senderName} onChange={setSenderName} required />
                  <Input label="আপনার নম্বর" value={senderContact} onChange={setSenderContact} required />
                  <Input label="TrxID (ট্রানজেকশন আইডি)" value={trxId} onChange={setTrxId} required />
                  <Button variant="success" className="w-full py-4 mt-2" onClick={() => alert('পেমেন্ট সফল!')} loading={isProcessing}>নিশ্চিত করুন</Button>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
