
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, Doctor, Clinic, Medicine, Order, Profile, Prescription, LabTest } from './types';
import { DOCTORS, CLINICS, MEDICINES, EMERGENCY_SERVICES, DISTRICTS, LAB_TESTS, SPECIALTIES } from './constants';
import { gemini } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { Share2, Bot, Video, Microscope, Ambulance, Star, ShieldCheck, Zap, MessageSquare, ArrowRight, X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
      className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 ${styles[variant]} ${className}`}
    >
      {loading ? (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
      ) : children}
    </button>
  );
};

// --- Update Notification for PWA ---
const UpdatePrompt: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setShow(true);
    window.addEventListener('swUpdateAvailable', handleUpdate);
    return () => window.removeEventListener('swUpdateAvailable', handleUpdate);
  }, []);

  if (!show) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-24 left-6 right-6 z-[400] bg-slate-900 text-white p-5 rounded-[32px] shadow-2xl flex items-center justify-between gap-4 border border-white/10"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
          <Zap size={20} fill="white" />
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest">নতুন আপডেট উপলব্ধ!</h4>
          <p className="text-[9px] text-slate-400 font-medium">সেরা পারফরম্যান্সের জন্য অ্যাপটি রিফ্রেশ করুন।</p>
        </div>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
      >
        রিফ্রেশ করুন
      </button>
    </motion.div>
  );
};

// --- Floating Download Prompt for Web Version ---
const DownloadFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Check if user has already interacted with the prompt
    const promptSeen = localStorage.getItem('jb_healthcare_apk_prompt_seen');
    if (promptSeen) return;

    // Show tooltip after 3 seconds of page load for the first time
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    setShowTooltip(false);
    // Persist seen state so it doesn't auto-prompt again
    localStorage.setItem('jb_healthcare_apk_prompt_seen', 'true');
  };

  const handleDownload = () => {
    setIsOpen(false);
    setShowTooltip(false);
    localStorage.setItem('jb_healthcare_apk_prompt_seen', 'true');
  };

  return (
    <div className="fixed bottom-24 right-6 z-[300]">
      <AnimatePresence>
        {(isOpen || showTooltip) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: 20 }}
            className="absolute bottom-20 right-0 w-72 bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 mb-2"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl">
                <Smartphone className="text-blue-600" size={24} />
              </div>
              <button 
                onClick={handleDismiss}
                className="p-1 hover:bg-slate-50 rounded-full text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            
            <h3 className="text-sm font-black text-slate-800 leading-tight mb-2 uppercase tracking-tight">
              জেবি হেলথকেয়ার অ্যাপ
            </h3>
            
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-5">
              সব ফিচারের সেরা অভিজ্ঞতার জন্য আমাদের অফিসিয়াল অ্যাপটি আপনার ফোনে ইনস্টল করুন। 
            </p>
            
            <div className="space-y-3">
              <a 
                href="/downloads/jb-healthcare.apk" 
                download="jb-healthcare.apk"
                onClick={handleDownload}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Download size={16} /> সরাসরি APK ডাউনলোড করুন
              </a>
              <p className="text-[8px] text-center text-rose-500 font-bold leading-tight">
                *মোবাইলে ডাউনলোড না হলে নতুন ট্যাবে (Open in New Tab) ওপেন করুন।
              </p>
              <div className="flex items-center justify-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest pt-1 border-t border-slate-50">
                <ShieldCheck size={10} /> Secure • Android Version v2.0
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setIsOpen(!isOpen); setShowTooltip(false); }}
        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 relative active:scale-90 transition-all border-4 border-white"
      >
        <Smartphone size={28} />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
        >
          <span className="w-2 h-2 bg-white rounded-full shadow-inner" />
        </motion.div>
      </motion.button>
    </div>
  );
};

// --- Admin Dashboard Component ---
const AdminDashboard: React.FC<{ profile: Profile, onLogout: () => void, ticker: string, setTicker: (val: string) => void, onUpdateTicker: () => void }> = ({ profile, onLogout, ticker, setTicker, onUpdateTicker }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'doctors' | 'orders' | 'hospitals' | 'labtests'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Admin Panel</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{profile.full_name}</p>
          </div>
          <button onClick={onLogout} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all active:scale-90">
             <X size={20} />
          </button>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className="bg-white border-b px-6 flex gap-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: <Zap size={14} /> },
          { id: 'doctors', label: 'Specialists', icon: <Bot size={14} /> },
          { id: 'orders', label: 'Booking Orders', icon: <MessageSquare size={14} /> },
          { id: 'hospitals', label: 'Clinics', icon: <Microscope size={14} /> },
          { id: 'labtests', label: 'Lab Tests', icon: <Star size={14} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`py-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-4 ${activeSubTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 space-y-8">
        {activeSubTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Specialists</p>
                 <p className="text-3xl font-black text-slate-800">{DOCTORS.length}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Districts</p>
                 <p className="text-3xl font-black text-slate-800">{DISTRICTS.length}</p>
              </div>
            </div>

            {/* Ticker Management */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-2xl text-red-600"><Zap size={20} fill="currentColor" /></div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Ticker Message Control</h3>
              </div>
              <textarea 
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-full bg-slate-50 p-6 rounded-[32px] border-2 border-slate-100 focus:border-blue-500 outline-none text-sm font-medium leading-relaxed"
                rows={3}
                placeholder="ম্যাসেজটি এখানে লিখুন..."
              />
              <Button onClick={onUpdateTicker} className="w-full py-5 rounded-[28px] shadow-lg shadow-blue-500/20">
                Update Ticker Message
              </Button>
            </div>

            <div className="bg-blue-600 p-8 rounded-[40px] text-white space-y-4">
               <h3 className="font-black uppercase tracking-tight flex items-center gap-2"><Smartphone size={20} /> Website Export Info</h3>
               <p className="text-[11px] font-medium leading-relaxed opacity-80">আপনি Hostinger-এ মেজবানি করার জন্য আপনার কোডটি 'Build' করে সেখানে আপলোড করতে পারেন। এতে আপনার কোনো খরচ হবে না।</p>
            </div>
          </div>
        )}

        {activeSubTab === 'doctors' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center">
               <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Specialists List</h2>
               <Button variant="success" className="px-6 py-2 rounded-xl text-[10px]">Add New</Button>
            </div>
            <div className="space-y-4">
              {DOCTORS.map(d => (
                <div key={d.id} className="bg-white p-4 rounded-[32px] border border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={d.image} className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-tight">{d.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{d.specialty}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-all"><Zap size={14} /></button>
                    <button className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-red-100 hover:text-red-600 transition-all"><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'orders' && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <MessageSquare size={32} />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Active Bookings</p>
            <p className="text-[10px] text-slate-400 font-medium max-w-xs mx-auto">সবগুলো বুকিং এবং ল্যাব টেস্টের অর্ডার এখানে দেখা যাবে।</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Input: React.FC<{
  label: string,
  type?: string,
  placeholder?: string,
  value?: string,
  defaultValue?: string,
  onChange?: (val: string) => void,
  required?: boolean,
  className?: string,
  name?: string
}> = ({ label, type = "text", placeholder, value, defaultValue, onChange, required = false, className = "", name }) => (
  <div className={`space-y-1.5 w-full ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">{label}</label>
    <input 
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange ? onChange(e.target.value) : null}
      required={required}
      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
    />
  </div>
);

// --- AI Doctor Component ---

const AIDoctor: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const currentQuery = query;
    setQuery(''); // Clear input immediately for better UX
    setIsThinking(true);
    setResponse('');
    const res = await gemini.consultHealth(currentQuery);
    setResponse(res || "দুঃখিত, কোনো উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।");
    setIsThinking(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response, isThinking]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-[150] bg-white flex flex-col"
    >
      <header className="px-6 py-4 border-b flex justify-between items-center bg-blue-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest">AI Doctor</h2>
            <p className="text-[8px] opacity-70 font-bold uppercase">Powered by Gemini AI</p>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
          <p className="text-xs font-bold text-slate-700 leading-relaxed">
            আসসালামু আলাইকুম! আমি জেবি হেলথকেয়ারের এআই ডাক্তার। আপনার কি কোনো স্বাস্থ্য সমস্যা আছে? আমাকে বিস্তারিত বলুন।
          </p>
        </div>

        {query && (
          <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none max-w-[85%] ml-auto text-white">
            <p className="text-xs font-bold leading-relaxed">{query}</p>
          </div>
        )}

        {isThinking && (
          <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none max-w-[85%] flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thinking...</span>
          </div>
        )}

        {response && (
          <div className="bg-slate-100 p-5 rounded-2xl rounded-tl-none max-w-[95%] border border-blue-100 shadow-sm">
            <div className="prose prose-sm max-w-none text-slate-700 text-xs font-medium leading-relaxed whitespace-pre-line">
              {response}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 border-t bg-slate-50">
        <form onSubmit={handleConsult} className="flex gap-3">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="আপনার সমস্যার কথা লিখুন..."
            className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blue-600 transition-all"
          />
          <button 
            type="submit" 
            disabled={isThinking || !query.trim()}
            className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-90 transition-all disabled:opacity-50"
          >
            <Zap size={24} fill="currentColor" />
          </button>
        </form>
        <p className="text-[8px] text-slate-400 text-center mt-4 font-bold uppercase tracking-widest">
          সতর্কবার্তা: এটি একটি এআই পরামর্শ, সরাসরি ডাক্তারের বিকল্প নয়।
        </p>
      </div>
    </motion.div>
  );
};

// --- Landing Page Component ---

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto no-scrollbar">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center px-8 text-center bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="z-10 space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Zap size={14} fill="currentColor" /> Digital Healthcare Solution
          </div>
          
          <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter">
            আপনার হাতের মুঠোয় <br />
            <span className="text-blue-600">ডিজিটাল ডাক্তার</span>
          </h1>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
            জেবি হেলথকেয়ারে আপনি পাচ্ছেন এআই ডাক্তার পরামর্শ, ভিডিও কনসাল্টেশন এবং জরুরি স্বাস্থ্যসেবা।
          </p>
          
          <div className="pt-8">
            <button 
              onClick={onStart}
              className="bg-blue-600 text-white px-10 py-5 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/40 active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
              শুরু করুন <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-0 w-full px-6"
        >
          <div className="bg-white rounded-t-[40px] shadow-2xl border-x border-t border-slate-100 p-8 flex justify-around items-center">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-800">৫০০০+</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">পরামর্শ</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-2xl font-black text-slate-800">৫০+</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">বিশেষজ্ঞ</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-2xl font-black text-slate-800">৪.৯/৫</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">রেটিং</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20 space-y-12 bg-white">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">আমাদের সেবাসমূহ</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">কেন আমাদের বেছে নেবেন?</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            { icon: <Bot className="text-blue-600" />, title: "AI ডাক্তার পরামর্শ", desc: "যেকোনো স্বাস্থ্য সমস্যায় তাৎক্ষণিক এআই পরামর্শ নিন।" },
            { icon: <Video className="text-emerald-600" />, title: "ভিডিও কনসাল্টেশন", desc: "দেশের সেরা বিশেষজ্ঞ ডাক্তারদের সাথে সরাসরি কথা বলুন।" },
            { icon: <Microscope className="text-indigo-600" />, title: "ল্যাব টেস্ট বুকিং", desc: "ঘরে বসেই ল্যাব টেস্ট বুক করুন এবং রিপোর্ট পান।" },
            { icon: <Ambulance className="text-red-600" />, title: "জরুরি SOS সেবা", desc: "২৪/৭ জরুরি অ্যাম্বুলেন্স এবং অক্সিজেন সাপোর্ট।" }
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 items-center p-6 bg-slate-50 rounded-[32px] border border-slate-100"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                {f.icon}
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight">{f.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-8 py-20 bg-slate-900 text-white rounded-t-[56px]">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Star size={14} fill="currentColor" className="text-yellow-400" /> Trusted by Thousands
          </div>
          
          <h2 className="text-3xl font-black leading-tight tracking-tighter">
            মানুষ কেন আমাদের <br /> পছন্দ করে?
          </h2>

          <div className="space-y-6 text-left">
            {[
              { name: "রাহাত হোসেন", text: "এআই ডাক্তার ফিচারটি অসাধারণ! অনেক দ্রুত পরামর্শ পাওয়া যায়।" },
              { name: "সুমাইয়া আক্তার", text: "ভিডিও কনসাল্টেশন করে অনেক উপকৃত হয়েছি। ডাক্তার খুব ভালো ছিলেন।" }
            ].map((r, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-[32px] border border-white/10">
                <p className="text-xs font-medium italic opacity-80 leading-relaxed">"{r.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black">{r.name[0]}</div>
                  <p className="text-[10px] font-black uppercase tracking-widest">{r.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-10">
            <button 
              onClick={onStart}
              className="w-full bg-white text-blue-600 py-5 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              এখনই শুরু করুন
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showAIDoctor, setShowAIDoctor] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubCategory, setHomeSubCategory] = useState<'doctors' | 'hospitals' | 'labtests' | 'emergency'>('doctors');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tickerMessage, setTickerMessage] = useState('জেবি হেলথকেয়ারে আপনাকে স্বাগত! যেকোনো প্রয়োজনে কল করুন: ০১৫১৮৩৯৫৭৭২');

  // Specialty Scroll Ref
  const specialtyScrollRef = useRef<HTMLDivElement>(null);

  // Specialist Filtering
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  // Multi-Order Cart State
  const [cart, setCart] = useState<{id: string, name: string, price: number, type: 'test' | 'emergency'}[]>([]);

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Modals & Auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'moderator'>('login');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState<{show: boolean, amount: number, item: string, shipping: number, isVideo?: boolean, isClinic?: boolean, hospitalName?: string}>({show: false, amount: 0, item: '', shipping: 0});
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [paymentType, setPaymentType] = useState<'online' | 'offline'>('online');
  const [trxId, setTrxId] = useState('');
  
  // Moderator/Admin Control States
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Clinic[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [historyTab, setHistoryTab] = useState<'info' | 'history' | 'admin'>('info');
  const [adminSubTab, setAdminSubTab] = useState<'log' | 'users' | 'orders' | 'settings' | 'data'>('log');
  const [adminDataTab, setAdminDataTab] = useState<'doctors' | 'hospitals' | 'tests'>('doctors');
  const [selectedUserRecords, setSelectedUserRecords] = useState<{p: Profile, recs: Prescription[], ords: Order[]} | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'JB Healthcare',
          text: 'জেবি হেলথকেয়ার - আপনার ডিজিটাল ডাক্তার। স্বাস্থ্যসেবা এখন আপনার হাতের মুঠোয়।',
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('অ্যাপ লিঙ্ক কপি করা হয়েছে!');
      }
    } catch (err) {
      console.error('Sharing failed', err);
    }
  };

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
          let { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          
          if (!prof) {
            // Create profile if missing (using metadata)
            const newProf = {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'User',
              phone: session.user.user_metadata?.phone || '',
              role: UserRole.PATIENT,
              status: 'active'
            };
            const { data: createdProf, error: insErr } = await supabase.from('profiles').insert(newProf).select().single();
            if (!insErr) prof = createdProf;
            else prof = newProf as any;
          }
          
          if (prof) setProfile(prof);
        }
      }
      const { data: settings } = await supabase.from('settings').select('*').eq('key', 'ticker_message').single();
      if (settings) setTickerMessage(settings.value);
      
      // Fetch initial data
      await fetchData();
      
      setIsLoading(false);
    };
    init();
    
    // Check if landing has been seen
    const hasSeenLanding = sessionStorage.getItem('jb_landing_seen');
    if (hasSeenLanding) setShowLanding(false);
  }, []);

  const fetchData = async () => {
    const [docRes, hospRes, testRes] = await Promise.all([
      supabase.from('doctor').select('*'),
      supabase.from('hospital').select('*'),
      supabase.from('lab_test').select('*')
    ]);
    
    // Fallback to constants if DB is empty (Initial Seed simulation)
    setDoctors(docRes.data && docRes.data.length > 0 ? docRes.data : DOCTORS);
    setHospitals(hospRes.data && hospRes.data.length > 0 ? hospRes.data : CLINICS);
    setLabTests(testRes.data && testRes.data.length > 0 ? testRes.data : LAB_TESTS);
  };

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
        } else {
          throw new Error('ভুল ইউজারনেম বা পাসওয়ার্ড!');
        }
      } else if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: emailVal, password: passVal });
        if (error) throw error;
        
        // Ensure profile exists
        let { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        
        if (!prof) {
          // Create profile if missing
          const newProf = {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || 'User',
            phone: data.user.user_metadata?.phone || '',
            role: UserRole.PATIENT,
            status: 'active'
          };
          const { data: createdProf, error: insErr } = await supabase.from('profiles').insert(newProf).select().single();
          if (!insErr) prof = createdProf;
          else prof = newProf as any;
        }

        if (prof?.status === 'pending') {
          await supabase.auth.signOut();
          throw new Error('অ্যাকাউন্টটি পেন্ডিং।');
        }
        setUser(data.user);
        setProfile(prof);
        setShowAuthModal(false);
      } else {
        const fullName = formData.get('fullName') as string;
        const phone = formData.get('phone') as string;
        
        if (!fullName || !phone || !emailVal || !passVal) {
          throw new Error('দয়া করে সব তথ্য পূরণ করুন!');
        }
        
        if (!emailVal.includes('@') || !emailVal.includes('.')) {
          throw new Error('সঠিক ইমেইল অ্যাড্রেস দিন!');
        }
        
        if (passVal.length < 6) {
          throw new Error('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে!');
        }

        const { data, error } = await supabase.auth.signUp({ 
          email: emailVal, 
          password: passVal,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে!');
          }
          throw error;
        }
        
        if (data.user) {
          const newProf = { 
            id: data.user.id, 
            full_name: fullName, 
            phone, 
            role: UserRole.PATIENT, 
            status: 'active' 
          };
          
          // Try to insert profile, but don't block if it fails (might be RLS issue if session is null)
          const { error: profileError } = await supabase.from('profiles').insert(newProf);
          
          if (profileError) {
            console.error("Profile Insert Error during signup:", profileError);
          }

          if (data.session) {
            setUser(data.user);
            setProfile(newProf as any);
            setShowAuthModal(false);
          } else {
            alert('রেজিস্ট্রেশন সফল হয়েছে! দয়া করে আপনার ইমেইল চেক করুন এবং অ্যাকাউন্টটি ভেরিফাই করুন।');
            setShowAuthModal(false);
          }
        }
      }
    } catch (err: any) { 
      console.error("Auth Error Detail:", err);
      let msg = 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      if (err.message === 'Failed to fetch') {
        msg = 'সার্ভারের সাথে সংযোগ করা যাচ্ছে না। আপনার ইন্টারনেট সংযোগ বা সুপাবেস ইউআরএল চেক করুন।';
      } else if (err.message) {
        msg = `এরর: ${err.message}`;
      }
      alert(msg); 
    }
    finally { setIsProcessing(false); }
  };

  const logout = async () => {
    localStorage.removeItem('jb_moderator_session');
    await supabase.auth.signOut();
    window.location.reload();
  };

  const toggleCartItem = (item: {id: string, name: string, price: number, type: 'test' | 'emergency'}) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      return [...prev, item];
    });
  };

  const startCheckout = () => {
    if (cart.length === 0) return;
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    const itemNames = cart.map(i => i.name).join(', ');
    const hasEmergency = cart.some(i => i.type === 'emergency');
    const shipping = hasEmergency ? 100 : 0;
    setShowPayment({ show: true, amount: totalAmount, item: itemNames, shipping });
  };

  const filteredDoctors = useMemo(() => {
    let list = doctors;
    if (selectedHospitalId) list = list.filter(d => d.clinics.includes(selectedHospitalId));
    if (selectedSpecialty) list = list.filter(d => d.specialty.toLowerCase() === selectedSpecialty.toLowerCase());
    return list.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, selectedHospitalId, selectedSpecialty, doctors]);

  const filteredLabTests = useMemo(() => {
    return labTests.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, labTests]);

  const masterLogFiltered = useMemo(() => {
    return allPrescriptions.filter(p => 
      p.patient_name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      p.doctor_name.toLowerCase().includes(adminSearchTerm.toLowerCase())
    );
  }, [allPrescriptions, adminSearchTerm]);

  const submitOrder = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (paymentType === 'online' && !trxId) {
      alert('অনুগ্রহ করে TrxID দিন');
      return;
    }
    setIsProcessing(true);
    const newOrder: Order = {
      user_id: user.id,
      user_email: user.email || 'guest@jb.com',
      item_name: showPayment.item,
      amount: showPayment.amount,
      shipping: showPayment.shipping,
      payment_method: paymentType === 'offline' ? 'Cash at Clinic' : (paymentMethod || 'bkash'),
      payment_type: paymentType,
      sender_name: profile?.full_name || 'Guest',
      sender_contact: profile?.phone || '',
      trx_id: paymentType === 'offline' ? `OFFLINE-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : trxId,
      hospital_name: showPayment.hospitalName,
      status: 'pending'
    };

    const { error } = await supabase.from('orders').insert(newOrder);
    if (!error) {
      alert('অর্ডারটি সফল হয়েছে! মডারেটর কিছুক্ষণের মধ্যে যোগাযোগ করবেন।');
      setShowPayment({ show: false, amount: 0, item: '', shipping: 0 });
      setCart([]);
      setTrxId('');
      setPaymentType('online');
      fetchUserData();
    } else {
      alert('অর্ডার সম্পন্ন করা যায়নি।');
    }
    setIsProcessing(false);
  };

  // --- Data Management Functions ---
  const handleSaveData = async (type: 'doctor' | 'hospital' | 'lab_test', item: any) => {
    if (!user || profile?.role !== UserRole.ADMIN) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from(type).upsert(item);
      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(`সুপাবেস এরর: ${error.message} (Code: ${error.code})`);
      }
      alert('সফলভাবে সেভ হয়েছে!');
      setShowAddModal(false);
      setEditingItem(null);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'সেভ করা যায়নি।');
    } finally {
      setIsProcessing(false);
    }
  };

  const seedDatabase = async () => {
    if (!user || profile?.role !== UserRole.ADMIN || !confirm('এটি আপনার সুপাবেস অ্যাকাউন্টে প্রাথমিক ডেটা যোগ করবে। আপনি কি নিশ্চিত?')) return;
    setIsProcessing(true);
    try {
      // Attempt to seed
      const { error: dErr } = await supabase.from('doctor').upsert(DOCTORS);
      const { error: hErr } = await supabase.from('hospital').upsert(CLINICS);
      const { error: tErr } = await supabase.from('lab_test').upsert(LAB_TESTS);
      
      if (dErr || hErr || tErr) {
        throw new Error(`সিডিং এরর: ${dErr?.message || ''} ${hErr?.message || ''} ${tErr?.message || ''}`);
      }
      
      alert('ডেটাবেস সফলভাবে সিড হয়েছে!');
      await fetchData();
    } catch (err: any) {
      alert('সিড করা যায়নি। সম্ভবত টেবিলগুলো তৈরি করা নেই। এরর: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteData = async (type: 'doctor' | 'hospital' | 'lab_test', id: string) => {
    if (!user || profile?.role !== UserRole.ADMIN || !confirm('আপনি কি নিশ্চিত?')) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from(type).delete().eq('id', id);
      if (error) throw error;
      alert('সফলভাবে ডিলিট হয়েছে!');
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert('ডিলিট করা যায়নি।');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Update ticker message in database ---
  const updateTicker = async () => {
    if (!user || profile?.role !== UserRole.ADMIN) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'ticker_message', value: tickerMessage }, { onConflict: 'key' });
      
      if (error) throw error;
      alert('Ticker সফলভাবে আপডেট হয়েছে!');
    } catch (err: any) {
      console.error(err);
      alert('Ticker আপডেট করা যায়নি।');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">JB HEALTHCARE...</div>;

  if (profile?.role === UserRole.ADMIN) {
    return (
      <AdminDashboard 
        profile={profile} 
        onLogout={logout} 
        ticker={tickerMessage} 
        setTicker={setTickerMessage} 
        onUpdateTicker={updateTicker} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto relative overflow-hidden shadow-2xl">
      
      <AnimatePresence>
        {showLanding && (
          <LandingPage onStart={() => {
            setShowLanding(false);
            sessionStorage.setItem('jb_landing_seen', 'true');
          }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAIDoctor && (
          <AIDoctor onClose={() => setShowAIDoctor(false)} />
        )}
      </AnimatePresence>

      {/* Ticker */}
      <div className="bg-red-600 text-white py-2 overflow-hidden whitespace-nowrap z-50 shadow-md">
        <div className="animate-marquee inline-block pl-[100%] font-black text-[10px] uppercase tracking-wider">
          {tickerMessage} • ইমারজেন্সি হেল্পলাইন: ০১৫১৮৩৯৫৭৭২ • 
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 py-4 border-b flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-slate-800 tracking-tight cursor-pointer" onClick={() => { setActiveTab('home'); setHomeSubCategory('doctors'); setSelectedHospitalId(null); setSelectedSpecialty(null); }}>
          <span className="text-blue-600">JB</span> Healthcare
        </h1>
        <div className="flex gap-2 items-center">
           <button onClick={handleShare} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border-2 border-slate-50 active:scale-90 transition-all" title="Share App">
             <Share2 size={16} />
           </button>
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
            {/* Category Menu */}
            <div className="grid grid-cols-4 gap-2">
               {[
                 { id: 'doctors', icon: '👨‍⚕️', label: 'ডক্টর' },
                 { id: 'hospitals', icon: '🏥', label: 'হাসপাতাল' },
                 { id: 'labtests', icon: '🔬', label: 'ল্যাব টেস্ট' },
                 { id: 'emergency', icon: '🆘', label: 'SOS সেবা' }
               ].map(cat => (
                 <button 
                   key={cat.id} 
                   onClick={() => { 
                     setHomeSubCategory(cat.id as any); 
                     setSelectedHospitalId(null); 
                     setSearchTerm(''); 
                     setSelectedSpecialty(null);
                   }}
                   className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${homeSubCategory === cat.id ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-50'}`}
                 >
                   <span className="text-xl">{cat.icon}</span>
                   <span className="text-[8px] font-black uppercase tracking-wider text-center">{cat.label}</span>
                 </button>
               ))}
            </div>

            {/* AI Doctor Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden group cursor-pointer"
              onClick={() => setShowAIDoctor(true)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all duration-500" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                    <Zap size={10} fill="currentColor" /> New Feature
                  </div>
                  <h3 className="text-lg font-black tracking-tight">AI ডাক্তারের পরামর্শ নিন</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">তাৎক্ষণিক স্বাস্থ্য সমাধান</p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <Bot size={32} className="text-blue-400" />
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
               <div className="flex justify-between items-center bg-slate-100/50 p-2 rounded-2xl">
                  <h2 className="text-[11px] font-black text-slate-800 uppercase ml-2 tracking-wide">
                    {homeSubCategory === 'doctors' ? 'বিশেষজ্ঞ ডক্টর' : homeSubCategory === 'hospitals' ? 'হাসপাতাল লিস্ট' : homeSubCategory === 'labtests' ? 'ল্যাব টেস্ট' : 'জরুরি SOS সেবা'}
                  </h2>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="খুঁজুন..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="bg-white border-none rounded-xl py-2 px-3 text-[10px] font-bold outline-none w-36 shadow-sm" 
                    />
                    <span className="absolute right-2 top-2 text-slate-300 text-[10px]">🔍</span>
                  </div>
               </div>

               {homeSubCategory === 'doctors' && (
                 <div className="space-y-6">
                    {/* Video Consultation Section */}
                    {!selectedSpecialty && !selectedHospitalId && (
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] text-white shadow-xl shadow-blue-500/20">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-black uppercase tracking-widest">Live Video Consultation</h3>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase">Online Now</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                          {doctors.filter(d => d.isVideoConsultant).map(vd => (
                            <div key={vd.id} className="min-w-[140px] bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center text-center">
                              <img src={vd.image} className="w-14 h-14 rounded-full border-2 border-white/50 mb-2 object-cover" />
                              <p className="text-[10px] font-black leading-tight mb-1">{vd.name}</p>
                              <p className="text-[8px] opacity-70 mb-2">{vd.specialty}</p>
                              <button 
                                onClick={() => setShowPayment({show: true, amount: vd.consultationFee || 500, item: `Video Consult: ${vd.name}`, shipping: 0, isVideo: true})}
                                className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg"
                              >
                                Call Now
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Specialty Bar - Modern On-Going / Draggable Design */}
                    <div className="relative w-full group">
                        <div 
                          ref={specialtyScrollRef}
                          className="flex gap-4 overflow-x-auto no-scrollbar pb-3 px-1 scroll-smooth cursor-grab active:cursor-grabbing"
                        >
                            <button 
                                onClick={() => setSelectedSpecialty(null)}
                                className={`flex flex-col items-center gap-2 min-w-[75px] transition-all duration-300 ${selectedSpecialty === null ? 'scale-110 active:scale-100' : 'opacity-40 hover:opacity-100'}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-xl transition-all border-2 ${selectedSpecialty === null ? 'bg-blue-600 text-white border-blue-400' : 'bg-white border-slate-100'}`}>✨</div>
                                <span className={`text-[9px] font-black uppercase tracking-tighter text-center ${selectedSpecialty === null ? 'text-blue-600' : 'text-slate-400'}`}>All Docs</span>
                            </button>
                            {SPECIALTIES.map(spec => (
                                <button 
                                    key={spec.id}
                                    onClick={() => setSelectedSpecialty(spec.name)}
                                    className={`flex flex-col items-center gap-2 min-w-[75px] transition-all duration-300 ${selectedSpecialty === spec.name ? 'scale-110 active:scale-100' : 'opacity-40 hover:opacity-100'}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-xl transition-all border-2 ${selectedSpecialty === spec.name ? 'bg-blue-600 text-white border-blue-400' : 'bg-white border-slate-100'}`}>{spec.icon}</div>
                                    <span className={`text-[9px] font-black uppercase tracking-tighter text-center ${selectedSpecialty === spec.name ? 'text-blue-600' : 'text-slate-400'}`}>{spec.name}</span>
                                </button>
                            ))}
                        </div>
                        {/* Decorative Gradient Fade */}
                        <div className="absolute top-0 right-0 h-14 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity"></div>
                    </div>

                    <div className="space-y-4 pb-36">
                       {filteredDoctors.length > 0 ? filteredDoctors.map(d => (
                         <Card key={d.id} className="flex gap-4 items-center border-l-4 border-l-blue-600 hover:border-l-8 hover:shadow-lg transition-all">
                           <img src={d.image} className="w-20 h-20 rounded-3xl object-cover border bg-slate-50 shadow-sm" />
                           <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <h4 className="font-black text-[14px] text-slate-800 leading-tight">{d.name}</h4>
                                <span className="text-[10px] font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">⭐ {d.rating}</span>
                             </div>
                             <p className="text-[10px] text-blue-600 font-black uppercase mt-1 tracking-wider">{d.specialty}</p>
                             <p className="text-[9px] text-slate-400 font-bold leading-snug mt-1 italic">{d.degree}</p>
                             <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                      {d.schedule}
                                  </span>
                                  {d.consultationFee && <span className="text-[10px] font-black text-blue-600 mt-0.5">Fee: ৳{d.consultationFee}</span>}
                                </div>
                                <div className="flex gap-2">
                                  {d.isVideoConsultant && (
                                    <button onClick={() => setShowPayment({show: true, amount: d.consultationFee || 500, item: `Video Consult: ${d.name}`, shipping: 0, isVideo: true})} className="text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1">
                                      <span>📹</span> Video
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      const hospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals.find(h => h.id === d.clinics[0]);
                                      setShowPayment({
                                        show: true, 
                                        amount: d.consultationFee || 500, 
                                        item: `Consultation: ${d.name}`, 
                                        shipping: 0, 
                                        isClinic: true,
                                        hospitalName: hospital?.name
                                      });
                                    }} 
                                    className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                  >
                                    সিরিয়াল নিন
                                  </button>
                                </div>
                             </div>
                           </div>
                         </Card>
                       )) : (
                         <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center">
                           <div className="text-5xl mb-4 animate-bounce">🧐</div>
                           <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">No Specialist Found</p>
                           <button onClick={() => setSelectedSpecialty(null)} className="bg-slate-100 text-[10px] font-black text-slate-600 px-6 py-3 rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest">Show All Doctors</button>
                         </div>
                       )}
                    </div>
                 </div>
               )}

               {homeSubCategory === 'hospitals' && (
                 <div className="space-y-4 pb-36">
                    {hospitals.map(c => (
                      <Card key={c.id} className="p-0 overflow-hidden relative cursor-pointer group" onClick={() => { setSelectedHospitalId(c.id); setHomeSubCategory('doctors'); }}>
                         <img src={c.image} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-6 text-white">
                            <h4 className="font-black text-base uppercase tracking-tight">{c.name}</h4>
                            <p className="text-[10px] font-bold uppercase opacity-80 mt-1">{c.address}</p>
                         </div>
                      </Card>
                    ))}
                 </div>
               )}

               {homeSubCategory === 'labtests' && (
                  <div className="grid grid-cols-1 gap-3 pb-36">
                    {filteredLabTests.length > 0 ? filteredLabTests.map(test => {
                      const isInCart = cart.find(i => i.id === test.id);
                      return (
                        <Card 
                          key={test.id} 
                          className={`flex justify-between items-center border-l-4 transition-all ${isInCart ? 'border-l-blue-600 bg-blue-50/50' : 'border-l-slate-200'}`}
                          onClick={() => toggleCartItem({...test, type: 'test'})}
                        >
                           <div>
                              <h4 className={`text-[12px] font-black uppercase tracking-tight ${isInCart ? 'text-blue-700' : 'text-slate-800'}`}>{test.name}</h4>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">Clinical Diagnostic</p>
                           </div>
                           <div className="text-right flex items-center gap-3">
                              <p className="text-blue-600 font-black text-sm">৳{test.price}</p>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${isInCart ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'border-slate-200 text-slate-200'}`}>
                                {isInCart ? '✓' : '+'}
                              </div>
                           </div>
                        </Card>
                      );
                    }) : <div className="text-center py-20 text-slate-300 font-black text-[10px] uppercase tracking-widest">No Tests Found</div>}
                  </div>
               )}

               {homeSubCategory === 'emergency' && (
                  <div className="space-y-4 pb-36">
                    {EMERGENCY_SERVICES.map(s => {
                      const isInCart = cart.find(i => i.id === s.id);
                      return (
                        <Card 
                          key={s.id} 
                          className={`flex justify-between items-center border-l-4 transition-all ${isInCart ? 'border-l-red-600 bg-red-50/50' : 'border-l-slate-200'}`}
                          onClick={() => toggleCartItem({...s, type: 'emergency'})}
                        >
                           <div className="flex gap-4 items-center">
                              <span className="text-3xl drop-shadow-sm">{s.icon}</span>
                              <div>
                                 <h4 className={`text-[12px] font-black ${isInCart ? 'text-red-700' : 'text-slate-800'}`}>{s.name}</h4>
                                 <p className="text-[9px] text-slate-400 font-medium">{s.description}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <p className="text-red-600 font-black text-sm">৳{s.price}</p>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${isInCart ? 'bg-red-600 border-red-600 text-white shadow-md' : 'border-slate-200 text-slate-200'}`}>
                                  {isInCart ? '✓' : '+'}
                              </div>
                           </div>
                        </Card>
                      );
                    })}
                  </div>
               )}
            </div>
          </div>
        )}

        {cart.length > 0 && activeTab === 'home' && (
          <div className="fixed bottom-28 left-4 right-4 z-50 animate-in slide-in-from-bottom-20 duration-500">
            <div className="bg-slate-900 text-white rounded-[32px] p-5 flex justify-between items-center shadow-2xl border border-white/10">
               <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{cart.length} ITEMS SELECTED</p>
                  <p className="text-xl font-black">৳{cart.reduce((s, i) => s + i.price, 0)}</p>
               </div>
               <button onClick={startCheckout} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-blue-500/20">
                  CHECKOUT
               </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5">
            <Card className="flex items-center gap-5 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-inner">
               <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white text-3xl font-black shadow-xl border-4 border-white">
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
              <button onClick={() => setHistoryTab('info')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${historyTab === 'info' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>Account</button>
              <button onClick={() => setHistoryTab('history')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${historyTab === 'history' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>Medical Log</button>
              {profile?.role === UserRole.ADMIN && (
                <button onClick={() => setHistoryTab('admin')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${historyTab === 'admin' ? 'bg-white shadow-md text-red-600' : 'text-slate-400'}`}>Moderator</button>
              )}
            </div>

            {historyTab === 'admin' && profile?.role === UserRole.ADMIN && (
              <div className="space-y-8 pb-28">
                <div className="flex border-b pt-2 gap-6 overflow-x-auto no-scrollbar">
                   <button onClick={() => setAdminSubTab('log')} className={`pb-3 text-[11px] font-black uppercase whitespace-nowrap tracking-wider ${adminSubTab === 'log' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Visits</button>
                   <button onClick={() => setAdminSubTab('users')} className={`pb-3 text-[11px] font-black uppercase whitespace-nowrap tracking-wider ${adminSubTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Users</button>
                   <button onClick={() => setAdminSubTab('orders')} className={`pb-3 text-[11px] font-black uppercase whitespace-nowrap tracking-wider ${adminSubTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Orders</button>
                   <button onClick={() => setAdminSubTab('data')} className={`pb-3 text-[11px] font-black uppercase whitespace-nowrap tracking-wider ${adminSubTab === 'data' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Manage Data</button>
                   <button onClick={() => setAdminSubTab('settings')} className={`pb-3 text-[11px] font-black uppercase whitespace-nowrap tracking-wider ${adminSubTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Settings</button>
                </div>

                {adminSubTab === 'data' && (
                  <div className="space-y-6">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button onClick={() => setAdminDataTab('doctors')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${adminDataTab === 'doctors' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Doctors</button>
                      <button onClick={() => setAdminDataTab('hospitals')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${adminDataTab === 'hospitals' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Hospitals</button>
                      <button onClick={() => setAdminDataTab('tests')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${adminDataTab === 'tests' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>Tests</button>
                    </div>

                    <Button onClick={() => { setEditingItem({}); setTempImage(null); setShowAddModal(true); }} className="w-full py-3 rounded-xl">+ Add New {adminDataTab}</Button>

                    <div className="space-y-3">
                      {adminDataTab === 'doctors' && doctors.map(d => (
                        <Card key={d.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <img src={d.image} className="w-10 h-10 rounded-lg object-cover border" />
                            <div>
                              <p className="text-xs font-black">{d.name}</p>
                              <p className="text-[9px] text-slate-400">{d.specialty} • {d.degree}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(d); setTempImage(d.image); setShowAddModal(true); }} className="text-blue-600 text-[10px] font-black uppercase">Edit</button>
                            <button onClick={() => handleDeleteData('doctor', d.id)} className="text-red-600 text-[10px] font-black uppercase">Del</button>
                          </div>
                        </Card>
                      ))}
                      {adminDataTab === 'hospitals' && hospitals.map(h => (
                        <Card key={h.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <img src={h.image} className="w-10 h-10 rounded-lg object-cover border" />
                            <div>
                              <p className="text-xs font-black">{h.name}</p>
                              <p className="text-[9px] text-slate-400">{h.address}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(h); setTempImage(h.image); setShowAddModal(true); }} className="text-blue-600 text-[10px] font-black uppercase">Edit</button>
                            <button onClick={() => handleDeleteData('hospital', h.id)} className="text-red-600 text-[10px] font-black uppercase">Del</button>
                          </div>
                        </Card>
                      ))}
                      {adminDataTab === 'tests' && labTests.map(t => (
                        <Card key={t.id} className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-black">{t.name}</p>
                            <p className="text-[9px] text-slate-400">Price: ৳{t.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(t); setShowAddModal(true); }} className="text-blue-600 text-[10px] font-black uppercase">Edit</button>
                            <button onClick={() => handleDeleteData('lab_test', t.id)} className="text-red-600 text-[10px] font-black uppercase">Del</button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {adminSubTab === 'log' && (
                  <div className="space-y-4">
                     <input type="text" placeholder="Search visits..." className="w-full bg-white border shadow-sm rounded-2xl py-3 px-5 text-xs font-bold outline-none" value={adminSearchTerm} onChange={(e) => setAdminSearchTerm(e.target.value)} />
                     {masterLogFiltered.map((p) => (
                       <Card key={p.id} className="border-l-4 border-l-blue-600">
                          <p className="text-[9px] font-black text-slate-400 uppercase">{new Date(p.created_at).toLocaleString()}</p>
                          <h4 className="font-black text-sm text-slate-800 mt-1">{p.patient_name} ➔ {p.doctor_name}</h4>
                          <div className="mt-2 bg-slate-50 p-3 rounded-xl text-[10px] text-slate-600 leading-relaxed italic">{p.medicines}</div>
                       </Card>
                     ))}
                  </div>
                )}

                {adminSubTab === 'users' && (
                  <div className="space-y-3">
                     {allProfiles.map(p => (
                       <Card key={p.id} className="flex justify-between items-center py-4 hover:bg-slate-50 shadow-none border-b rounded-none" onClick={() => setSelectedUserRecords({ p, recs: allPrescriptions.filter(pr => pr.patient_id === p.id), ords: allOrders.filter(o => o.user_id === p.id) })}>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-black text-blue-600">{p.full_name[0]}</div>
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

                {adminSubTab === 'orders' && (
                   <div className="space-y-4">
                      {allOrders.map(o => (
                        <Card key={o.id} className="border-l-4 border-l-amber-500">
                           <div className="flex justify-between mb-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(o.created_at!).toLocaleDateString()}</p>
                              <Badge status={o.status} />
                           </div>
                           <h4 className="text-[11px] font-black text-slate-800 leading-tight">{o.item_name}</h4>
                           {o.hospital_name && <p className="text-[9px] font-black text-blue-600 uppercase mt-1">📍 {o.hospital_name}</p>}
                           <p className="text-[10px] text-slate-500 font-bold mt-1">Customer: {o.sender_name} ({o.sender_contact})</p>
                           <p className="text-blue-600 font-black text-xs mt-2">৳{o.amount + o.shipping} • Trx: {o.trx_id}</p>
                        </Card>
                      ))}
                   </div>
                )}

                {adminSubTab === 'settings' && (
                  <div className="space-y-4">
                     <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-4">
                       <p className="text-[10px] font-black text-amber-700 uppercase mb-2">Database Setup</p>
                       <p className="text-[9px] text-amber-600 mb-3 leading-relaxed">যদি সেভ না হয়, তবে প্রথমে এই বাটনটি ক্লিক করে আপনার সুপাবেস অ্যাকাউন্টে টেবিলগুলোর ডেটা সিড করুন।</p>
                       <Button variant="secondary" className="w-full py-3 text-amber-700 border border-amber-200" onClick={seedDatabase} loading={isProcessing}>Setup Database (Seed)</Button>
                     </div>
                     <textarea value={tickerMessage} onChange={(e) => setTickerMessage(e.target.value)} className="w-full bg-white border-2 p-4 rounded-[32px] text-sm h-32 outline-none focus:border-blue-500 transition-all" />
                     <Button variant="danger" className="w-full py-4 rounded-2xl" onClick={updateTicker} loading={isProcessing}>Update Home Ticker</Button>
                  </div>
                )}
              </div>
            )}
            
            {historyTab === 'history' && (
              <div className="space-y-4 pb-28">
                 {allPrescriptions.length > 0 ? allPrescriptions.map(p => (
                   <Card key={p.id} className="border-l-4 border-l-blue-600">
                     <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{p.doctor_name} • {new Date(p.created_at).toLocaleDateString()}</h4>
                     <div className="mt-2 bg-blue-50/50 p-4 rounded-[28px] border border-blue-50 text-[11px] text-slate-700 leading-relaxed whitespace-pre-line font-medium italic">{p.medicines}</div>
                   </Card>
                 )) : <div className="text-center py-24 opacity-30 font-black uppercase text-xs tracking-widest">Medical history is empty</div>}
              </div>
            )}

            {historyTab === 'info' && (
               <div className="space-y-4 pt-4">
                  <Button onClick={handleShare} variant="primary" className="w-full py-4 rounded-[28px] flex items-center justify-center gap-3">
                    <Share2 size={20} /> অ্যাপটি শেয়ার করুন (Share App)
                  </Button>
                  <Button onClick={() => window.open('https://wa.me/8801518395772', '_blank')} variant="success" className="w-full py-4 rounded-[28px] flex items-center justify-center gap-3">
                    <span className="text-xl">💬</span> Contact Support (WhatsApp)
                  </Button>
                  <Button onClick={logout} variant="secondary" className="w-full py-4 rounded-[28px] text-red-500 font-black">LOGOUT ACCOUNT</Button>
               </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Recent Orders</h2>
            <div className="space-y-4 pb-28">
              {allOrders.map(order => (
                <Card key={order.id} className="border-l-4 border-l-amber-500 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 max-w-[70%]">
                      <p className="text-[12px] font-black text-slate-800 leading-snug">{order.item_name}</p>
                      {order.hospital_name && <p className="text-[9px] font-black text-blue-600 uppercase">📍 {order.hospital_name}</p>}
                    </div>
                    <Badge status={order.status} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold flex justify-between bg-slate-50 p-3 rounded-[20px] items-center">
                    <span className="text-blue-600 text-sm">৳{order.amount + order.shipping}</span>
                    <span className="tracking-widest">TRX: {order.trx_id.substring(0,10)}...</span>
                  </div>
                </Card>
              ))}
              {allOrders.length === 0 && <div className="text-center py-24 opacity-30 font-black text-xs uppercase tracking-[0.3em]">No orders yet</div>}
            </div>
          </div>
        )}
      </main>

      {/* Modern Floating Navigation Bar */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/95 backdrop-blur-2xl flex justify-around items-center py-5 rounded-[40px] shadow-2xl border border-white/10 overflow-hidden">
        <button onClick={() => { setActiveTab('home'); setHomeSubCategory('doctors'); setSelectedHospitalId(null); setSelectedSpecialty(null); }} className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'text-blue-400 scale-125' : 'text-slate-500 opacity-60'}`}>
          <span className="text-2xl drop-shadow-md">🏠</span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-center">Home</span>
        </button>
        <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'orders' ? 'text-yellow-400 scale-125' : 'text-slate-500 opacity-60'}`}>
          <span className="text-2xl drop-shadow-md">📜</span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-center">Orders</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'profile' ? 'text-fuchsia-400 scale-125' : 'text-slate-500 opacity-60'}`}>
          <span className="text-2xl drop-shadow-md">👤</span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-center">Profile</span>
        </button>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <Card className="w-full max-w-sm p-10 space-y-8 animate-in zoom-in-95 duration-200 rounded-[48px]">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{authMode === 'login' ? 'Login' : authMode === 'moderator' ? 'Moderator' : 'Register'}</h2>
            <form onSubmit={handleAuth} className="space-y-5">
              {authMode === 'register' && (
                <><Input label="Full Name" name="fullName" required /><Input label="Phone Number" name="phone" required /></>
              )}
              <Input label={authMode === 'moderator' ? "Username" : "Email"} name="email" type={authMode === 'moderator' ? "text" : "email"} required />
              <Input label="Password" name="password" type="password" required />
              <Button type="submit" loading={isProcessing} className="w-full py-4 mt-2 rounded-2xl">Continue</Button>
            </form>
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 text-center">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{authMode === 'login' ? 'Create New Account' : 'Back to Login'}</button>
              <button onClick={() => setAuthMode('moderator')} className="text-[10px] font-black text-red-600 uppercase border-t pt-3 tracking-widest opacity-60">Admin/Moderator Dashboard</button>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-colors">Dismiss</button>
            </div>
          </Card>
        </div>
      )}

      {/* Data Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-8 space-y-6 max-h-[90vh] overflow-y-auto rounded-[32px]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase">Manage {adminDataTab}</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const rawData: any = Object.fromEntries(formData.entries());
              const id = editingItem?.id || Math.random().toString(36).substr(2, 9);
              
              let finalData: any = { id };

              if (adminDataTab === 'doctors') {
                finalData = {
                  ...finalData,
                  name: rawData.name,
                  degree: rawData.degree,
                  specialty: rawData.specialty,
                  districts: [rawData.district],
                  clinics: [rawData.clinic],
                  schedule: rawData.schedule,
                  image: tempImage || editingItem?.image || `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&sig=${id}`,
                  availableToday: true,
                  rating: editingItem?.rating || 5.0
                };
              } else if (adminDataTab === 'hospitals') {
                finalData = {
                  ...finalData,
                  name: rawData.name,
                  district: rawData.district,
                  address: rawData.address,
                  image: tempImage || editingItem?.image || `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400&sig=${id}`,
                  doctors: editingItem?.doctors || []
                };
              } else if (adminDataTab === 'tests') {
                finalData = {
                  ...finalData,
                  name: rawData.name,
                  price: Number(rawData.price)
                };
              }
              
              handleSaveData(
                adminDataTab === 'doctors' ? 'doctor' : 
                adminDataTab === 'hospitals' ? 'hospital' : 'lab_test', 
                finalData
              );
            }} className="space-y-4">
              {(adminDataTab === 'doctors' || adminDataTab === 'hospitals') && (
                <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  {tempImage ? (
                    <img src={tempImage} className="w-32 h-32 rounded-2xl object-cover shadow-md border-2 border-white" />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 text-4xl">🖼️</div>
                  )}
                  <label className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-blue-700 transition-colors">
                    ছবি সিলেক্ট করুন
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">গ্যালারি থেকে ছবি আপলোড করুন</p>
                </div>
              )}
              {adminDataTab === 'doctors' && (
                <>
                  <Input label="Name" name="name" defaultValue={editingItem?.name} required />
                  <Input label="Degree" name="degree" defaultValue={editingItem?.degree} required />
                  <Input label="Specialty" name="specialty" defaultValue={editingItem?.specialty} required />
                  <Input label="District" name="district" defaultValue={editingItem?.districts?.[0]} required />
                  <Input label="Clinic ID" name="clinic" defaultValue={editingItem?.clinics?.[0]} required />
                  <Input label="Schedule" name="schedule" defaultValue={editingItem?.schedule} required />
                </>
              )}
              {adminDataTab === 'hospitals' && (
                <>
                  <Input label="Hospital Name" name="name" defaultValue={editingItem?.name} required />
                  <Input label="District" name="district" defaultValue={editingItem?.district} required />
                  <Input label="Address" name="address" defaultValue={editingItem?.address} required />
                </>
              )}
              {adminDataTab === 'tests' && (
                <>
                  <Input label="Test Name" name="name" defaultValue={editingItem?.name} required />
                  <Input label="Price" name="price" type="number" defaultValue={editingItem?.price} required />
                </>
              )}
              <Button type="submit" loading={isProcessing} className="w-full py-4 rounded-2xl">Save Changes</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Payment/Checkout Modal */}
      {showPayment.show && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-t-[56px] p-10 pb-14 space-y-8 max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-20 duration-500">
              <div className="flex justify-between items-center border-b pb-5">
                 <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Order Summary</h2>
                 <button onClick={() => setShowPayment({show: false, amount: 0, item: '', shipping: 0})} className="text-slate-300 text-3xl font-bold hover:text-slate-600">✕</button>
              </div>
              
              <div className="space-y-5">
                 {(showPayment.isClinic || showPayment.isVideo) && (
                   <div className="flex gap-3 bg-slate-50 p-2 rounded-3xl border border-slate-100">
                     <button 
                       onClick={() => { setPaymentType('online'); setPaymentMethod(null); }}
                       className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${paymentType === 'online' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                     >
                       Pay Online
                     </button>
                     {!showPayment.isVideo && (
                       <button 
                         onClick={() => { setPaymentType('offline'); setPaymentMethod(null); }}
                         className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${paymentType === 'offline' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                       >
                         Pay at Clinic
                       </button>
                     )}
                   </div>
                 )}

                 {showPayment.isVideo && (
                   <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
                     <span className="text-xl">📹</span>
                     <p className="text-[10px] font-black text-emerald-700 uppercase leading-tight">Video call consultations must be paid online to confirm your slot.</p>
                   </div>
                 )}

                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Details:</p>
                    <p className="text-[12px] font-black text-slate-700 leading-relaxed italic">{showPayment.item}</p>
                    {showPayment.hospitalName && (
                      <p className="text-[10px] font-black text-blue-600 uppercase mt-2 border-t pt-2 border-slate-200">
                        📍 {showPayment.hospitalName}
                      </p>
                    )}
                 </div>
                 <div className="bg-blue-600 p-8 rounded-[40px] text-white text-center shadow-2xl shadow-blue-500/30">
                    <p className="text-4xl font-black">৳{showPayment.amount + showPayment.shipping}</p>
                    <p className="text-[10px] font-black opacity-70 uppercase mt-2 tracking-[0.2em]">Total Bill Payable {showPayment.shipping > 0 ? '(+৳১০০ Home Visit)' : ''}</p>
                 </div>
              </div>

              {paymentType === 'online' ? (
                <>
                  {!paymentMethod ? (
                    <div className="grid grid-cols-2 gap-6">
                      <button onClick={() => setPaymentMethod('bkash')} className="p-8 border-2 border-slate-50 rounded-[40px] flex flex-col items-center gap-4 bg-white hover:border-pink-500 hover:shadow-xl transition-all active:scale-95 group">
                        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 font-black text-xs">bKash</div>
                        <span className="text-[11px] font-black text-pink-600 uppercase tracking-[0.2em]">Pay bKash</span>
                      </button>
                      <button onClick={() => setPaymentMethod('nagad')} className="p-8 border-2 border-slate-50 rounded-[40px] flex flex-col items-center gap-4 bg-white hover:border-orange-500 hover:shadow-xl transition-all active:scale-95 group">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-black text-xs">Nagad</div>
                        <span className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em]">Pay Nagad</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
                      <div className="p-6 bg-blue-50 rounded-[32px] flex justify-between items-center border border-blue-100 shadow-inner">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-blue-400 uppercase mb-1">Send Money to:</span>
                            <span className="text-blue-700 text-xl font-black tracking-widest">{PAYMENT_NUMBERS[paymentMethod]}</span>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(PAYMENT_NUMBERS[paymentMethod]); alert('Number Copied!'); }} className="bg-blue-600 text-white text-[10px] font-black px-6 py-3.5 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors">COPY</button>
                      </div>
                      <Input label="Transaction ID (TrxID)" placeholder="Enter 10-digit ID" required value={trxId} onChange={setTrxId} />
                      <Button variant="success" className="w-full py-5 mt-4 rounded-3xl" onClick={submitOrder} loading={isProcessing}>VERIFY & CONFIRM</Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
                   <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
                     <p className="text-[11px] font-black text-amber-700 uppercase mb-2">Cash on Visit</p>
                     <p className="text-[10px] text-amber-600 leading-relaxed">আপনি সরাসরি ক্লিনিকে গিয়ে ফি পরিশোধ করতে পারবেন। আপনার সিরিয়ালটি কনফার্ম করার জন্য নিচের বাটনে ক্লিক করুন।</p>
                   </div>
                   <Button variant="success" className="w-full py-5 rounded-3xl" onClick={submitOrder} loading={isProcessing}>CONFIRM APPOINTMENT</Button>
                </div>
              )}
           </div>
        </div>
      )}

      <DownloadFAB />
      <UpdatePrompt />

    </div>
  );
}
