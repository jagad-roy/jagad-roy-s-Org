
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
  const [homeSubCategory, setHomeSubCategory] = useState<'doctors' | 'hospitals' | 'medicine' | 'emergency'>('doctors');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tickerMessage, setTickerMessage] = useState('জেবি হেলথকেয়ার - এ.আর জেনারেল, ইবাদত, মৌনো, প্যাসিফিক এবং গ্রিন সাইন হাসপাতাল এখন আপনার হাতের নাগালে।');

  // Search & Navigation
  const [searchTerm, setSearchTerm] = useState('');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Modals
  const [showPayment, setShowPayment] = useState<{show: boolean, amount: number, item: string, shipping: number}>({show: false, amount: 0, item: '', shipping: 0});
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'moderator'>('login');
  
  // Admin Data
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [historyTab, setHistoryTab] = useState<'info' | 'history' | 'admin'>('info');
  const [adminSubTab, setAdminSubTab] = useState<'master' | 'users' | 'orders' | 'settings'>('master');

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

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const emailInput = (formData.get('email') as string).trim();
    const passwordInput = formData.get('password') as string;

    try {
      if (authMode === 'moderator') {
        if (emailInput === 'modaretor' && passwordInput === 'jagad01750') {
          const adminProfile: Profile = { id: 'admin-master', full_name: 'Main Admin', role: UserRole.ADMIN, status: 'active', phone: '01518395772' };
          setUser({ id: adminProfile.id, email: 'admin@jb.com' });
          setProfile(adminProfile);
          localStorage.setItem('jb_moderator_session', JSON.stringify(adminProfile));
          setShowAuthModal(false);
          alert('মডারেটর হিসেবে প্রবেশ করেছেন!');
        } else {
          throw new Error('ভুল ইউজারনেম বা পাসওয়ার্ড!');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput });
        if (error) throw error;
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
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

  const filteredDoctors = useMemo(() => {
    let list = DOCTORS;
    if (selectedHospitalId) {
      list = list.filter(d => d.clinics.includes(selectedHospitalId));
    }
    return list.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, selectedHospitalId]);

  const filteredAdminPrescriptions = useMemo(() => {
    return allPrescriptions.filter(p => 
      p.patient_name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      p.doctor_name.toLowerCase().includes(adminSearchTerm.toLowerCase())
    );
  }, [allPrescriptions, adminSearchTerm]);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">JB HEALTHCARE...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Ticker */}
      <div className="bg-red-600 text-white py-2 overflow-hidden whitespace-nowrap z-50">
        <div className="animate-marquee inline-block pl-[100%] font-black text-[10px] uppercase tracking-wider">
          {tickerMessage} • সাপোর্ট: ০১৫১৮৩৯৫৭৭২ • 
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-slate-800 tracking-tight cursor-pointer" onClick={() => { setActiveTab('home'); setSelectedHospitalId(null); setSearchTerm(''); }}>
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
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Quick Menu */}
            <div className="grid grid-cols-4 gap-3">
               {[
                 { id: 'doctors', icon: '👨‍⚕️', label: 'ডক্টর' },
                 { id: 'hospitals', icon: '🏥', label: 'হাসপাতাল' },
                 { id: 'medicine', icon: '💊', label: 'ওষুধ' },
                 { id: 'emergency', icon: '🆘', label: 'সেবা' }
               ].map(cat => (
                 <button 
                   key={cat.id} 
                   onClick={() => { setHomeSubCategory(cat.id as any); setSelectedHospitalId(null); }}
                   className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${homeSubCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                 >
                   <span className="text-xl">{cat.icon}</span>
                   <span className="text-[8px] font-black uppercase tracking-wider">{cat.label}</span>
                 </button>
               ))}
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                    {homeSubCategory === 'doctors' && (selectedHospitalId ? 'ডক্টর লিস্ট' : 'বিশেষজ্ঞ ডক্টরগণ')}
                    {homeSubCategory === 'hospitals' && 'সেরা হাসপাতালসমূহ'}
                    {homeSubCategory === 'medicine' && 'ওষুধের দোকান'}
                    {homeSubCategory === 'emergency' && 'জরুরি সেবাসমূহ'}
                  </h2>
                  <input type="text" placeholder="খুঁজুন..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-100 border-none rounded-xl py-2 px-3 text-[10px] font-bold outline-none w-32 ring-1 ring-slate-200" />
               </div>

               <div className="space-y-4">
                  {homeSubCategory === 'doctors' && (
                    <>
                      {selectedHospitalId && (
                        <button onClick={() => setSelectedHospitalId(null)} className="text-[10px] font-black text-blue-600 uppercase mb-2">← সকল ডাক্তার</button>
                      )}
                      {filteredDoctors.map(d => (
                        <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-500">
                          <img src={d.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm border" />
                          <div className="flex-1">
                            <h4 className="font-bold text-[13px] text-slate-800">{d.name}</h4>
                            <p className="text-[9px] text-blue-600 font-black uppercase">{d.specialty}</p>
                            <p className="text-[8px] text-slate-400 font-bold">{d.degree}</p>
                            <div className="flex justify-between items-center mt-2">
                               <p className="text-[8px] font-black text-emerald-600">{d.schedule}</p>
                               <button onClick={() => setShowPayment({show: true, amount: 500, item: `সিরিয়াল: ${d.name}`, shipping: 0})} className="text-[9px] bg-blue-600 text-white px-3 py-1.5 rounded-xl font-black shadow-md">বুকিং</button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </>
                  )}

                  {homeSubCategory === 'hospitals' && CLINICS.map(c => (
                    <Card key={c.id} className="p-0 overflow-hidden relative group cursor-pointer" onClick={() => { setSelectedHospitalId(c.id); setHomeSubCategory('doctors'); }}>
                       <img src={c.image} className="w-full h-36 object-cover" />
                       <div className="p-4 bg-white/95 backdrop-blur-md absolute bottom-0 left-0 right-0 border-t flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm text-slate-800">{c.name}</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">{c.address}</p>
                          </div>
                          <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded">ডক্টর দেখুন</span>
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
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="flex items-center gap-4 py-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black">
                 {profile?.full_name?.[0] || '👤'}
               </div>
               <div>
                  <h4 className="font-black text-lg text-slate-800">{profile?.full_name}</h4>
                  <p className="text-[10px] text-blue-600 uppercase font-black">{profile?.role}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{profile?.phone}</p>
               </div>
            </Card>

            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button onClick={() => setHistoryTab('info')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${historyTab === 'info' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>তথ্য</button>
              <button onClick={() => setHistoryTab('history')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${historyTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>ইতিহাস</button>
              {profile?.role === UserRole.ADMIN && (
                <button onClick={() => setHistoryTab('admin')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${historyTab === 'admin' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400'}`}>ম্যানেজমেন্ট</button>
              )}
            </div>

            {historyTab === 'admin' && profile?.role === UserRole.ADMIN && (
              <div className="space-y-6 animate-in fade-in pb-20">
                {/* Visual Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-600 p-4 rounded-3xl text-white text-center shadow-lg shadow-blue-100">
                    <p className="text-xl font-black">{allProfiles.filter(p => p.role === UserRole.PATIENT).length}</p>
                    <p className="text-[7px] font-black uppercase">পেশেন্ট</p>
                  </div>
                  <div className="bg-indigo-600 p-4 rounded-3xl text-white text-center shadow-lg shadow-indigo-100">
                    <p className="text-xl font-black">{allProfiles.filter(p => p.role === UserRole.DOCTOR).length}</p>
                    <p className="text-[7px] font-black uppercase">ডক্টর</p>
                  </div>
                  <div className="bg-emerald-600 p-4 rounded-3xl text-white text-center shadow-lg shadow-emerald-100">
                    <p className="text-xl font-black">{allPrescriptions.length}</p>
                    <p className="text-[7px] font-black uppercase">ভিজিট</p>
                  </div>
                </div>

                <div className="flex gap-4 border-b overflow-x-auto no-scrollbar pt-2">
                   <button onClick={() => setAdminSubTab('master')} className={`pb-2 text-[10px] font-black uppercase whitespace-nowrap ${adminSubTab === 'master' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>মাস্টার কনসাল্টেশন লগ</button>
                   <button onClick={() => setAdminSubTab('users')} className={`pb-2 text-[10px] font-black uppercase whitespace-nowrap ${adminSubTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>ইউজার লিস্ট</button>
                   <button onClick={() => setAdminSubTab('orders')} className={`pb-2 text-[10px] font-black uppercase whitespace-nowrap ${adminSubTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>অর্ডার</button>
                </div>

                {adminSubTab === 'master' && (
                  <div className="space-y-4">
                     <div className="relative">
                        <input type="text" placeholder="সার্চ দিন (রোগী/ডাক্তার)..." className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none" value={adminSearchTerm} onChange={(e) => setAdminSearchTerm(e.target.value)} />
                     </div>
                     <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {filteredAdminPrescriptions.map((p, idx) => (
                          <div key={p.id} className="relative flex items-center justify-between group">
                             <div className="flex items-center w-full">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow shadow-blue-100 z-10 shrink-0">
                                   <span className="text-[10px] font-black">{idx + 1}</span>
                                </div>
                                <Card className="ml-4 flex-1 border-l-4 border-l-blue-500 p-4">
                                   <div className="flex justify-between items-start">
                                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">পেশেন্ট: {p.patient_name}</p>
                                      <span className="text-[8px] font-black text-slate-400">{new Date(p.created_at).toLocaleDateString('bn-BD')}</span>
                                   </div>
                                   <div className="mt-2 flex items-center gap-2">
                                      <span className="text-[10px]">👨‍⚕️</span>
                                      <p className="text-[10px] font-bold text-blue-600 uppercase">{p.doctor_name}</p>
                                   </div>
                                   <div className="mt-1 bg-slate-50 p-2 rounded-lg text-[9px] text-slate-500 italic">
                                      {p.medicines.substring(0, 50)}...
                                   </div>
                                </Card>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {adminSubTab === 'users' && (
                   <div className="space-y-3">
                      {allProfiles.map(p => (
                        <Card key={p.id} className="flex justify-between items-center py-3">
                           <div>
                              <p className="text-xs font-black">{p.full_name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">{p.role} • {p.phone}</p>
                           </div>
                           <Badge status={p.status} />
                        </Card>
                      ))}
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
                     <div className="mt-2 bg-slate-50 p-3 rounded-xl border">
                        <p className="text-[10px] text-slate-700 font-medium whitespace-pre-line leading-relaxed">{p.medicines}</p>
                     </div>
                   </Card>
                 )) : (
                   <div className="text-center py-20 opacity-20 font-black uppercase text-xs">কোনো ইতিহাস নেই</div>
                 )}
              </div>
            )}

            {historyTab === 'info' && (
               <div className="space-y-4">
                  <Button onClick={() => window.open('https://wa.me/8801518395772', '_blank')} variant="success" className="w-full py-4 shadow-green-50">লাইভ সাপোর্ট (হোয়াটসঅ্যাপ)</Button>
                  <Button onClick={logout} variant="danger" className="w-full py-4 shadow-red-50">লগ আউট</Button>
               </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">অর্ডার হিস্ট্রি</h2>
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
              {allOrders.length === 0 && <p className="text-center py-20 opacity-20 font-black text-xs">কোনো অর্ডার নেই</p>}
            </div>
          </div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/95 backdrop-blur-2xl flex justify-around items-center py-5 px-3 rounded-[36px] shadow-2xl border border-white/10">
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

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <Card className="w-full max-w-sm p-8 space-y-5 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 mb-4">{authMode === 'login' ? 'লগিন' : authMode === 'moderator' ? 'মডারেটর লগিন' : 'নিবন্ধন'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input label={authMode === 'moderator' ? "ইউজারনেম" : "ইমেইল"} name="email" placeholder={authMode === 'moderator' ? "modaretor" : "example@mail.com"} required />
              <Input label="পাসওয়ার্ড" name="password" type="password" placeholder="••••••••" required />
              <Button type="submit" loading={isProcessing} className="w-full py-4">প্রবেশ করুন</Button>
            </form>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setAuthMode('moderator')} className="text-[10px] font-black text-red-600 uppercase tracking-widest pt-2">মডারেটর লগিন</button>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 font-bold text-xs uppercase text-center mt-2">বাতিল</button>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment.show && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[48px] p-8 pb-12 space-y-6 max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                 <h2 className="text-xl font-black text-slate-800">পেমেন্ট: {showPayment.item}</h2>
                 <button onClick={() => setShowPayment({show: false, amount: 0, item: '', shipping: 0})} className="text-slate-400 text-2xl font-bold">✕</button>
              </div>
              <div className="bg-blue-50 p-6 rounded-[32px] text-center shadow-inner">
                 <p className="text-3xl font-black text-blue-600">৳{showPayment.amount + showPayment.shipping}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">সর্বমোট পরিমাণ</p>
              </div>
              {!paymentMethod ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMethod('bkash')} className="p-6 border-2 border-slate-50 rounded-[28px] flex flex-col items-center gap-3 bg-white">
                    <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-12 h-12" />
                    <span className="text-[11px] font-black text-pink-600 uppercase">বিকাশ</span>
                  </button>
                  <button onClick={() => setPaymentMethod('nagad')} className="p-6 border-2 border-slate-50 rounded-[28px] flex flex-col items-center gap-3 bg-white">
                    <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="w-12 h-12" />
                    <span className="text-[11px] font-black text-orange-600 uppercase">নগদ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center font-black">
                    <span className="text-slate-700">{PAYMENT_NUMBERS[paymentMethod]}</span>
                    <button onClick={() => { navigator.clipboard.writeText(PAYMENT_NUMBERS[paymentMethod]); alert('কপি হয়েছে!'); }} className="text-blue-600 text-xs">📋 কপি</button>
                  </div>
                  <Input label="পেমেন্ট ট্রানজেকশন আইডি (TrxID)" placeholder="ABC123XYZ" required value="" />
                  <Button variant="success" className="w-full py-4 mt-2" onClick={() => { alert('রিকোয়েস্ট পাঠানো হয়েছে!'); setShowPayment({show: false, amount: 0, item: '', shipping: 0}); setPaymentMethod(null); }}>নিশ্চিত করুন</Button>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
