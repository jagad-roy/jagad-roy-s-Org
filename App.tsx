
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Doctor, Clinic, Medicine } from './types';
import { DOCTORS, CLINICS, MEDICINES, EMERGENCY_SERVICES, ABOUT_US_DATA, APP_VIDEOS } from './constants';
import { gemini } from './services/geminiService';
import { supabase } from './services/supabaseClient';

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
  disabled?: boolean
}> = ({ children, onClick, variant = 'primary', className = "", disabled = false }) => {
  const styles = {
    primary: "bg-blue-600 text-white shadow-blue-100 shadow-lg",
    secondary: "bg-slate-100 text-slate-600",
    danger: "bg-red-500 text-white shadow-red-100 shadow-lg",
    success: "bg-green-600 text-white shadow-green-100 shadow-lg"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [healthSearch, setHealthSearch] = useState('');
  const [geminiResult, setGeminiResult] = useState('');
  const [showPayment, setShowPayment] = useState<{show: boolean, amount: number, item: string, shipping: number}>({show: false, amount: 0, item: '', shipping: 0});
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [trxId, setTrxId] = useState('');

  const PAYMENT_NUMBERS = {
    bkash: '01518395772',
    nagad: '01846800973'
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

  const processPayment = () => {
    if (!trxId) {
      alert('অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) দিন।');
      return;
    }
    const total = showPayment.amount + showPayment.shipping;
    alert(`${paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} এর মাধ্যমে ৳${total} পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে। মডারেটর শীঘ্রই যাচাই করে সার্ভিস নিশ্চিত করবে। ট্রানজেকশন আইডি: ${trxId}`);
    setShowPayment({show: false, amount: 0, item: '', shipping: 0});
    setPaymentMethod(null);
    setTrxId('');
  };

  const openPayment = (item: string, price: number, isShippable: boolean) => {
    setPaymentMethod(null); // Reset payment method state
    setTrxId(''); // Reset TRX ID
    setShowPayment({
      show: true,
      amount: price,
      item: item,
      shipping: isShippable ? 100 : 0 // Emergency & Medicine adds 100 Tk Transport Cost
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">JB Healthcare</h1>
        <div className="flex gap-2">
           <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-black shadow-inner">JR</div>
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
                  placeholder="যেমন: মাথা ব্যথা হলে কি করব?" 
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
                <h2 className="text-lg font-black text-slate-800 tracking-tight">ইমারজেন্সি সার্ভিস (বাসায়)</h2>
                <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">+ ১০০৳ পরিবহন</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {EMERGENCY_SERVICES.map(s => (
                  <Card key={s.id} className="text-center cursor-pointer border-slate-100 hover:border-blue-400 group" onClick={() => openPayment(s.name, s.price, true)}>
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                    <h4 className="text-xs font-black text-slate-700">{s.name}</h4>
                    <p className="text-[9px] text-slate-400 mt-1 line-clamp-1">{s.description}</p>
                    <p className="text-blue-600 font-black text-sm mt-2">৳{s.price}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Doctors */}
            <section>
              <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight">বিশেষজ্ঞ ডাক্তার</h2>
              <div className="space-y-4">
                {DOCTORS.map(d => (
                  <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-500">
                    <img src={d.image} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-50" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">{d.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{d.specialty} • {d.degree}</p>
                      <Button onClick={() => openPayment(`সিরিয়াল: ${d.name}`, 500, false)} className="mt-2 py-1.5 px-4 text-[9px]">সিরিয়াল নিন</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'pharmacy' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5">
             <div className="bg-orange-500 p-6 rounded-[30px] text-white shadow-xl flex justify-between items-center">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest mb-1">মেডিসিন শপ</h3>
                   <p className="text-[10px] font-bold opacity-90">বাসায় ডেলিভারি ১০০ টাকা</p>
                </div>
                <div className="text-4xl">💊</div>
             </div>
             <div className="grid grid-cols-2 gap-4">
              {MEDICINES.map(m => (
                <Card key={m.id} className="text-center group flex flex-col">
                  <div className="relative overflow-hidden rounded-2xl mb-3 flex-1 flex items-center justify-center bg-slate-50 p-4">
                    <img src={m.image} className="w-full h-28 object-contain group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-xs font-black text-slate-700 line-clamp-1">{m.name}</h4>
                  <p className="text-blue-600 font-black mt-1">৳{m.price}</p>
                  <Button onClick={() => openPayment(m.name, m.price, true)} className="mt-3 w-full py-2">অর্ডার দিন</Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'clinics' || activeTab === 'videos' || activeTab === 'about' || activeTab === 'profile') && (
           <div className="flex flex-col items-center justify-center py-24 text-slate-300">
             <div className="text-5xl mb-4 opacity-20">🏥</div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">শীঘ্রই আসছে...</p>
           </div>
        )}
      </main>

      {/* Floating Buttons */}
      <div className="fixed bottom-32 right-6 z-50 flex flex-col gap-4 items-end">
        <a href="https://wa.me/8801518395772" target="_blank" className="group flex items-center gap-3">
          <span className="opacity-0 group-hover:opacity-100 bg-green-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-xl transition-all translate-x-2 group-hover:translate-x-0">হোয়াটসঅ্যাপ</span>
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg animate-float">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.434 5.705 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
        </a>
      </div>

      {/* Navigation Footer - Ultra Lighting & Coloring */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/95 backdrop-blur-2xl flex justify-around items-center py-5 px-3 rounded-[36px] shadow-2xl border border-white/10 ring-1 ring-white/5">
        {[
          { id: 'home', label: 'হোম', icon: '🏠', color: 'text-cyan-400', glow: 'glow-cyan' },
          { id: 'clinics', label: 'ক্লিনিক', icon: '🏥', color: 'text-emerald-400', glow: 'glow-emerald' },
          { id: 'pharmacy', label: 'শপ', icon: '🛒', color: 'text-orange-400', glow: 'glow-orange' },
          { id: 'videos', label: 'ভিডিও', icon: '🎥', color: 'text-rose-400', glow: 'glow-rose' },
          { id: 'about', label: 'তথ্য', icon: 'ℹ️', color: 'text-indigo-400', glow: 'glow-indigo' },
          { id: 'profile', label: 'প্রোফাইল', icon: '👤', color: 'text-fuchsia-400', glow: 'glow-fuchsia' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? `${tab.color} scale-125 ${tab.glow}` : 'text-slate-500 opacity-60 hover:opacity-100'}`}
            >
              <span className="text-xl drop-shadow-md">{tab.icon}</span>
              <span className={`text-[7px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-80'}`}>{tab.label}</span>
              {isActive && (
                <div className={`w-1 h-1 rounded-full mt-0.5 ${tab.color.replace('text', 'bg')} shadow-xl animate-pulse`}></div>
              )}
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
                 <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">সার্ভিস চার্জ</p>
                    <p className="text-sm text-slate-800 font-bold">৳{showPayment.amount}</p>
                 </div>
                 {showPayment.shipping > 0 && (
                   <div className="flex justify-between items-center text-blue-600 font-bold">
                      <p className="text-[10px] uppercase font-black tracking-widest">পরিবহন খরচ (Transport)</p>
                      <p className="text-sm">৳{showPayment.shipping}</p>
                   </div>
                 )}
                 <div className="h-px bg-slate-200 my-2"></div>
                 <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">সর্বমোট পরিশোধযোগ্য</p>
                    <p className="text-2xl font-black text-blue-600">৳{showPayment.amount + showPayment.shipping}</p>
                 </div>
              </div>

              {!paymentMethod ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">পেমেন্ট মেথড বেছে নিন</p>
                  <div className="grid grid-cols-2 gap-4">
                     <button 
                      onClick={() => setPaymentMethod('bkash')}
                      className="p-5 rounded-3xl border-2 border-slate-100 flex flex-col items-center gap-3 hover:border-pink-500 hover:bg-pink-50 transition-all shadow-sm active:scale-95"
                     >
                        <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center p-2">
                           <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" className="w-full h-full object-contain" alt="bKash" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">বিকাশ</span>
                     </button>
                     <button 
                      onClick={() => setPaymentMethod('nagad')}
                      className="p-5 rounded-3xl border-2 border-slate-100 flex flex-col items-center gap-3 hover:border-orange-500 hover:bg-orange-50 transition-all shadow-sm active:scale-95"
                     >
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center p-2">
                           <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="w-full h-full object-contain" alt="Nagad" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">নগদ</span>
                     </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in zoom-in-95 duration-200">
                  <div className={`p-6 rounded-[32px] border-2 shadow-inner ${paymentMethod === 'bkash' ? 'border-pink-100 bg-pink-50' : 'border-orange-100 bg-orange-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm">
                        <img 
                          src={paymentMethod === 'bkash' ? "https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" : "https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png"} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <p className={`font-black text-xs uppercase tracking-wide ${paymentMethod === 'bkash' ? 'text-pink-600' : 'text-orange-600'}`}>
                        {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} সেন্ড মানি করুন
                      </p>
                    </div>
                    
                    <div className="bg-white/90 backdrop-blur p-4 rounded-2xl border border-white flex justify-between items-center shadow-sm">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase">পার্সোনাল নম্বর</p>
                        <p className="text-lg font-black text-slate-800 tracking-wider">
                          {PAYMENT_NUMBERS[paymentMethod]}
                        </p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(PAYMENT_NUMBERS[paymentMethod])}
                        className={`p-3 rounded-xl ${paymentMethod === 'bkash' ? 'bg-pink-100 text-pink-600' : 'bg-orange-100 text-orange-600'} active:scale-90 transition-transform shadow-md`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      </button>
                    </div>
                    
                    <p className="mt-4 text-[10px] text-slate-500 font-medium text-center italic leading-relaxed">
                      উপরের নম্বরে মোট ৳{showPayment.amount + showPayment.shipping} <span className="font-black text-slate-800 underline">সেন্ড মানি</span> করার পর নিচে ট্রানজেকশন আইডি দিন।
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">ট্রানজেকশন আইডি (TrxID)</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: ABC123XYZ" 
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none rounded-2xl font-black text-slate-700 transition-all uppercase placeholder:text-slate-300"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => setPaymentMethod(null)}>মেথড পরিবর্তন</Button>
                    <Button variant="success" className="flex-[2]" onClick={processPayment} disabled={!trxId}>নিশ্চিত করুন</Button>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
