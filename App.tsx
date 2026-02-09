
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Doctor, Clinic, Medicine } from './types';
import { DOCTORS, CLINICS, MEDICINES, EMERGENCY_SERVICES, ABOUT_US_DATA, APP_VIDEOS } from './constants';
import { gemini } from './services/geminiService';
import { supabase } from './services/supabaseClient';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[24px] border border-slate-100 shadow-sm p-4 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{ children: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'danger' | 'success', className?: string }> = ({ children, onClick, variant = 'primary', className = "" }) => {
  const styles = {
    primary: "bg-blue-600 text-white",
    secondary: "bg-slate-100 text-slate-600",
    danger: "bg-red-500 text-white",
    success: "bg-green-600 text-white"
  };
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [healthSearch, setHealthSearch] = useState('');
  const [geminiResult, setGeminiResult] = useState('');
  const [showPayment, setShowPayment] = useState<{show: boolean, amount: number, item: string}>({show: false, amount: 0, item: ''});
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);

  const handleAIQuery = async () => {
    if (!healthSearch) return;
    setGeminiResult('আপনার সমস্যার তথ্য বিশ্লেষণ করা হচ্ছে...');
    try {
      const res = await gemini.consultHealth(healthSearch);
      setGeminiResult(res || 'দুঃখিত, কোনো তথ্য পাওয়া যায়নি।');
    } catch (err) {
      setGeminiResult('এআই সার্ভিস এই মুহূর্তে পাওয়া যাচ্ছে না।');
    }
  };

  const processPayment = () => {
    alert(`${paymentMethod} এর মাধ্যমে ৳${showPayment.amount} সফলভাবে প্রদান করা হয়েছে!`);
    setShowPayment({show: false, amount: 0, item: ''});
    setPaymentMethod(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-800">JB Healthcare</h1>
        <div className="flex gap-2">
           <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">JR</div>
        </div>
      </header>

      <main className="flex-1 p-6 mobile-p-safe space-y-8 overflow-y-auto no-scrollbar">
        
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[30px] text-white shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="p-1 bg-white/20 rounded-lg">🤖</span> AI ডাক্তার (ফ্রি)
              </h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="আপনার শরীর কেমন লাগছে?" 
                  className="w-full bg-white/20 border border-white/30 rounded-2xl py-3 px-5 text-sm outline-none placeholder:text-white/60 focus:bg-white/30 transition-all"
                  value={healthSearch}
                  onChange={(e) => setHealthSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
                />
                <button onClick={handleAIQuery} className="absolute right-2 top-1.5 bg-white text-blue-600 p-2 rounded-xl shadow-md active:scale-90 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </button>
              </div>
              {geminiResult && (
                <div className="mt-4 p-4 bg-black/10 rounded-2xl text-[10px] font-medium leading-relaxed border border-white/5 max-h-40 overflow-y-auto no-scrollbar">
                  {geminiResult}
                </div>
              )}
            </div>

            {/* Emergency Services */}
            <section>
              <h2 className="text-lg font-black text-slate-800 mb-4">ইমারজেন্সি সার্ভিস (বাসায়)</h2>
              <div className="grid grid-cols-2 gap-4">
                {EMERGENCY_SERVICES.map(s => (
                  <Card key={s.id} className="text-center hover:border-blue-400 cursor-pointer transition-colors" onClick={() => setShowPayment({show: true, amount: s.price, item: s.name})}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <h4 className="text-xs font-black">{s.name}</h4>
                    <p className="text-[9px] text-slate-400 mt-1">{s.description}</p>
                    <p className="text-blue-600 font-bold text-sm mt-2">৳{s.price}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Featured Doctors */}
            <section>
              <h2 className="text-lg font-black text-slate-800 mb-4">বিশেষজ্ঞ ডাক্তার</h2>
              <div className="space-y-4">
                {DOCTORS.map(d => (
                  <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-500">
                    <img src={d.image} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-50" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{d.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{d.specialty} • {d.degree}</p>
                      <Button onClick={() => setShowPayment({show: true, amount: 500, item: `সিরিয়াল: ${d.name}`})} className="mt-2 py-1.5 px-3">সিরিয়াল নিন</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'pharmacy' && (
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-5">
            {MEDICINES.map(m => (
              <Card key={m.id} className="text-center group">
                <div className="relative overflow-hidden rounded-xl mb-2">
                  <img src={m.image} className="w-full h-32 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">{m.name}</h4>
                <p className="text-blue-600 font-black mt-1">৳{m.price}</p>
                <Button onClick={() => setShowPayment({show: true, amount: m.price, item: m.name})} className="mt-3 w-full">কিনুন</Button>
              </Card>
            ))}
          </div>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === 'clinics' || activeTab === 'videos' || activeTab === 'about' || activeTab === 'profile') && (
           <div className="flex flex-col items-center justify-center py-20 text-slate-300">
             <div className="text-5xl mb-4 opacity-20">🏥</div>
             <p className="text-xs font-black uppercase tracking-widest">এই বিভাগটি শীঘ্রই আসছে</p>
           </div>
        )}
      </main>

      {/* Floating Moderator & Community Support */}
      <div className="fixed bottom-32 right-6 z-50 flex flex-col gap-4 items-end">
        {/* Facebook Group Button */}
        <div className="flex items-center group fab-container">
          <span className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 rounded-lg mr-2 shadow-xl transition-all duration-300 fab-label">ফেসবুক গ্রুপ</span>
          <a href="https://www.facebook.com/groups/yourgroup" target="_blank" className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg animate-float" style={{animationDelay: '0s'}}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.74h-2.94v-3.41h2.94v-2.511c0-2.915 1.78-4.502 4.38-4.502 1.246 0 2.316.093 2.628.135v3.048h-1.804c-1.414 0-1.688.672-1.688 1.658v2.172h3.375l-.44 3.41h-2.935v8.74h6.138c.732 0 1.325-.593 1.325-1.325v-21.352c0-.732-.593-1.325-1.325-1.325z"/></svg>
          </a>
        </div>

        {/* WhatsApp Button */}
        <div className="flex items-center group fab-container">
          <span className="opacity-0 group-hover:opacity-100 bg-green-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg mr-2 shadow-xl transition-all duration-300 fab-label">হোয়াটসঅ্যাপ</span>
          <a href="https://wa.me/8801700000000" target="_blank" className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg animate-float" style={{animationDelay: '0.8s'}}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.434 5.705 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>

        {/* Messenger Button */}
        <div className="flex items-center group fab-container">
          <span className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg mr-2 shadow-xl transition-all duration-300 fab-label">মেসেঞ্জার</span>
          <a href="https://m.me/yourpage" target="_blank" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg animate-float" style={{animationDelay: '1.5s'}}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.012.28 2.089.431 3.203.431 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.291 14.194l-3.147-3.354-6.142 3.354 6.756-7.18 3.262 3.354 6.027-3.354-6.756 7.18z"/></svg>
          </a>
        </div>
      </div>

      {/* Navigation Footer - Color & Lighting */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/90 backdrop-blur-xl flex justify-around items-center py-4 px-2 rounded-[30px] shadow-2xl border border-white/10">
        {[
          { id: 'home', label: 'হোম', icon: '🏠', color: 'text-cyan-400' },
          { id: 'clinics', label: 'ক্লিনিক', icon: '🏥', color: 'text-emerald-400' },
          { id: 'pharmacy', label: 'শপ', icon: '🛒', color: 'text-orange-400' },
          { id: 'videos', label: 'ভিডিও', icon: '🎥', color: 'text-rose-400' },
          { id: 'about', label: 'তথ্য', icon: 'ℹ️', color: 'text-indigo-400' },
          { id: 'profile', label: 'প্রোফাইল', icon: '👤', color: 'text-fuchsia-400' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? `${tab.color} scale-110 nav-glow` : 'text-slate-500 opacity-60'}`}>
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[7px] font-black uppercase tracking-widest">{tab.label}</span>
              {isActive && <div className={`w-1 h-1 rounded-full mt-0.5 ${tab.color.replace('text', 'bg')}`}></div>}
            </button>
          )
        })}
      </nav>

      {/* Payment Modal */}
      {showPayment.show && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-t-[40px] p-8 pb-12 space-y-6 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-black text-slate-800">পেমেন্ট নিশ্চিত করুন</h2>
                 <button onClick={() => setShowPayment({show: false, amount: 0, item: ''})} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
              </div>
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                 <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">সার্ভিস বিস্তারিত</p>
                 <p className="text-sm text-slate-800 font-bold mt-1">{showPayment.item}</p>
                 <div className="mt-3 flex items-baseline gap-1">
                   <span className="text-2xl font-black text-blue-600">৳{showPayment.amount}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">মাত্র</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 shadow-inner' : 'border-slate-100 hover:border-slate-200'}`}
                 >
                    <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-12 h-12 object-contain" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">বিকাশ</span>
                 </button>
                 <button 
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50 shadow-inner' : 'border-slate-100 hover:border-slate-200'}`}
                 >
                    <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="w-12 h-12 object-contain" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">নগদ</span>
                 </button>
              </div>
              <Button 
                variant="success" 
                className="w-full py-4 text-sm shadow-xl shadow-green-100" 
                disabled={!paymentMethod}
                onClick={processPayment}
              >
                পেমেন্ট সম্পন্ন করুন
              </Button>
           </div>
        </div>
      )}

    </div>
  );
}
