import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, Loader2, CheckCircle2, AlertCircle, 
    Search, ClipboardList, PenTool, ArrowRight,
    Cpu, Zap, Shield, MapPin, Clock, Info, Mic, ChevronRight
} from 'lucide-react';
import MapPicker from '../components/MapPicker';

export default function CitizenPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const actionAreaRef = React.useRef(null);
    const recognitionRef = React.useRef(null);
    const timerIntervalRef = React.useRef(null);
    const [mode, setMode] = useState(null); 
    const [step, setStep] = useState(1);
    const [isRecording, setIsRecording] = useState(false);
    const [volume, setVolume] = useState(0);
    const [lang, setLang] = useState('en'); // 'en' or 'ta'
    const [recordingTime, setRecordingTime] = useState(0);
    const dictationLang = lang === 'ta' ? 'ta-IN' : 'en-IN';

    const translations = {
        en: {
            portal_title: 'Smart City Citizen Portal',
            hero_title_1: 'Your Voice,',
            hero_title_2: 'Our Action.',
            hero_desc: 'A next-generation grievance platform for modern urban living. Secure, AI-powered, and transparent.',
            btn_submit: 'Submit Grievance',
            btn_track: 'Track Status',
            new_request: 'New Request',
            track_signal: 'Track Signal',
            phase_1: 'Phase 01',
            phase_2: 'Phase 02',
            phase_3: 'Phase 03',
            personal_identity: 'Personal Identity',
            incident_vector: 'Incident Vector',
            grievance_payload: 'Grievance Payload',
            full_name: 'Full Name',
            mobile: 'Mobile',
            btn_specify_loc: 'Specify Location',
            btn_incident_details: 'Incident Details',
            btn_log_incident: 'Log Incident',
            desc_placeholder: 'Tell us what happened...',
            voice_input: 'Voice Input',
            recording: 'Recording...',
            listening: 'Listening...',
            back: 'Back',
            confirmed_address: 'Confirmed Address',
            description: 'Description',
            return_home: 'Return to Home',
            status_terminal: 'Status Terminal',
            locate_signal: 'Locate Your Signal',
            track: 'Track',
            ref_id: 'Reference ID',
            signal_transmitted: 'Signal Transmitted',
            active_response_node: 'Active Response Node',
            priority: 'Priority',
            stage: 'Stage',
            resolution_target: 'Resolution Target',
            neural_severity: 'Neural Severity'
        },
        ta: {
            portal_title: 'ஸ்மார்ட் சிட்டி குடிமக்கள் போர்டல்',
            hero_title_1: 'உங்கள் குரல்,',
            hero_title_2: 'எங்கள் செயல்.',
            hero_desc: 'நவீன நகர்ப்புற வாழ்க்கைக்கான அடுத்த தலைமுறை புகார் தளம். பாதுகாப்பானது மற்றும் வெளிப்படையானது.',
            btn_submit: 'புகாரைச் சமர்ப்பிக்கவும்',
            btn_track: 'நிலையை அறிய',
            new_request: 'புதிய கோரிக்கை',
            track_signal: 'சிக்னலைக் கண்காணிக்கவும்',
            phase_1: 'கட்டம் 01',
            phase_2: 'கட்டம் 02',
            phase_3: 'கட்டம் 03',
            personal_identity: 'தனிப்பட்ட அடையாளம்',
            incident_vector: 'சம்பவ இடம்',
            grievance_payload: 'புகார் விவரம்',
            full_name: 'முழு பெயர்',
            mobile: 'கைபேசி எண்',
            btn_specify_loc: 'இடத்தைக் குறிப்பிடவும்',
            btn_incident_details: 'சம்பவ விவரங்கள்',
            btn_log_incident: 'புகாரைப் பதிவு செய்யவும்',
            desc_placeholder: 'என்ன நடந்தது என்று சொல்லுங்கள்...',
            voice_input: 'குரல் உள்ளீடு',
            recording: 'பதிவு செய்கிறது...',
            listening: 'குரலைக் கேட்கிறது...',
            back: 'பின்செல்',
            confirmed_address: 'உறுதிப்படுத்தப்பட்ட முகவரி',
            description: 'விளக்கம்',
            return_home: 'முகப்பு பக்கத்திற்குச் செல்லவும்',
            status_terminal: 'நிலை முனையம்',
            locate_signal: 'உங்கள் சிக்னலைக் கண்டறியவும்',
            track: 'கண்காணிக்கவும்',
            ref_id: 'குறிப்பு எண்',
            signal_transmitted: 'சிக்னல் அனுப்பப்பட்டது',
            active_response_node: 'செயலில் உள்ள பதில் முனை',
            priority: 'முன்னுரிமை',
            stage: 'நிலை',
            resolution_target: 'மதிப்பிடப்பட்ட தீர்வு நேரம்',
            neural_severity: 'நரம்பியல் தீவிரம்'
        }
    };

    const t = translations[lang];

    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [trackData, setTrackData] = useState(null);
    const [error, setError] = useState('');
    const [ticketId, setTicketId] = useState('');
    const [interimText, setInterimText] = useState('');

    const [formData, setFormData] = useState({
        text: '',
        citizen_name: '',
        citizen_phone: '',
        citizen_email: '',
        citizen_gender: 'Male',
        citizen_address: '',
        citizen_pincode: '',
        area: '',
        locality: '',
        street_name: '',
        specific_location: '',
        category: 'Garbage',
        title: '',
        is_anonymous: false
    });
    const categories = [
        'Street Light', 'Garbage', 'Public Toilet', 'Water Stagnation', 
        'Road and Footpath', 'Park and Playground', 'Public Health', 
        'Storm Water Drains', 'Voter ID', 'General'
    ];

    // Simplified simulated waves for 100% recording reliability
    const WaveAnimator = () => (
        <div className="flex items-center gap-1 h-4 px-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                    key={i}
                    animate={{ 
                        height: [4, 16, 4],
                        opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                        duration: 0.8, 
                        repeat: Infinity, 
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                    className="w-1 bg-sky-500 rounded-full"
                />
            ))}
        </div>
    );

    const toggleRecording = () => {
        if (isRecording) {
            console.log('Stopping recording...');
            recognitionRef.current?.stop();
            clearInterval(timerIntervalRef.current);
            setRecordingTime(0);
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech Recognition not supported in this browser.');
            return;
        }

        setError('');
        console.log('Starting recognition in:', dictationLang);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = dictationLang;
        
        recognition.onresult = (event) => {
            let finalizedTranscript = '';
            let currentInterim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalizedTranscript += event.results[i][0].transcript;
                } else {
                    currentInterim += event.results[i][0].transcript;
                }
            }
            
            setInterimText(currentInterim);

            if (finalizedTranscript) {
                setFormData(prev => ({ 
                    ...prev, 
                    text: (prev.text ? prev.text.trim() + ' ' : '') + finalizedTranscript.trim() 
                }));
            }
        };

        recognition.onstart = () => {
            console.log('Recognition successfully started');
            setError('');
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error event:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please click the lock icon in the URL bar and allow microphone access.');
            } else if (event.error === 'network') {
                setError('Network error. Speech recognition requires an active internet connection.');
            } else {
                setError(`Voice Input Error: ${event.error}`);
            }
            setIsRecording(false);
            setInterimText('');
            clearInterval(timerIntervalRef.current);
        };

        recognition.onend = () => {
            console.log('Recognition session ended');
            setIsRecording(false);
            setInterimText('');
            clearInterval(timerIntervalRef.current);
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
            setRecordingTime(0);
            timerIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
            setIsRecording(true);
        } catch (err) {
            setError('Failed to start voice input. Please check microphone permissions.');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const m = params.get('mode');
        if (m && (m === 'register' || m === 'status')) {
            setMode(m);
            actionAreaRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.search]);

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const handleFieldChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const resp = await axios.post('http://localhost:5000/complaint', formData);
            setSuccessData(resp.data.data);
            setLoading(false);
        } catch (err) {
            setError('Submission failed. Please check your connection.');
            setLoading(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!ticketId.trim()) return;
        setLoading(true);
        setError('');
        try {
            const resp = await axios.get(`http://localhost:5000/complaint/${ticketId.trim()}`);
            setTrackData(resp.data);
            setLoading(false);
        } catch (err) {
            setError('Ticket ID not found. Verify and try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-950 font-sans selection:bg-sky-200">
            {/* Elegant Hero Section */}
            <section className="relative h-[85vh] flex flex-col justify-center items-center px-6 overflow-hidden bg-slate-950">
                {/* Language Dropdown */}
                <div className="absolute top-8 right-8 z-[60] flex items-center gap-3">
                    <div className="flex bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-xl">
                        <button 
                            onClick={() => setLang('en')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                        >
                            EN
                        </button>
                        <button 
                            onClick={() => setLang('ta')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'ta' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                        >
                            தமிழ்
                        </button>
                    </div>
                </div>

                <div className="absolute inset-0 opacity-40">
                    <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale" alt="City" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                        <Shield size={14} /> {t.portal_title}
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                        {t.hero_title_1} <br />
                        <span className="text-sky-500 italic">{t.hero_title_2}</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto mb-12 leading-relaxed">
                        {t.hero_desc}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button 
                            onClick={() => { setMode('register'); actionAreaRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                            className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-12 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-sky-500/20 active:scale-95"
                        >
                            {t.btn_submit} <ArrowRight className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => { setMode('status'); actionAreaRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md px-12 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            {t.btn_track}
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Main Action Area */}
            <div ref={actionAreaRef} className="max-w-5xl mx-auto px-6 -mt-24 pb-32 relative z-20">
                <AnimatePresence mode="wait">
                    {mode && (
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            className="bg-white rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden"
                        >
                            {/* Mode Toggle Tabs */}
                            <div className="flex bg-slate-50 p-2 gap-2">
                                <button 
                                    onClick={() => setMode('register')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                                        mode === 'register' ? 'bg-white text-slate-950 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <PenTool size={16} /> {t.new_request}
                                </button>
                                <button 
                                    onClick={() => setMode('status')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                                        mode === 'status' ? 'bg-white text-slate-950 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <Search size={16} /> {t.track_signal}
                                </button>
                            </div>

                            <div className="p-8 md:p-14">
                                {mode === 'register' ? (
                                    <div className="space-y-12">
                                        {successData ? (
                                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-10 space-y-8">
                                                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border-2 border-emerald-100">
                                                    <CheckCircle2 size={48} />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-4xl font-black tracking-tighter uppercase italic">{t.signal_transmitted}</h3>
                                                    <p className="text-slate-500 font-medium">Your grievance has been successfully logged.</p>
                                                </div>
                                                <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 max-w-sm mx-auto shadow-inner">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">{t.ref_id}</p>
                                                    <p className="text-5xl font-mono font-black text-sky-600 tracking-tighter">{successData.ticket_id}</p>
                                                </div>
                                                <button 
                                                    onClick={() => navigate('/')}
                                                    className="inline-flex items-center gap-3 text-slate-400 hover:text-slate-950 font-black uppercase tracking-widest text-xs transition-colors"
                                                >
                                                    {t.return_home} <ChevronRight size={16} />
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <div className="space-y-10">
                                                {/* Progress Bar */}
                                                <div className="flex items-center gap-4">
                                                    {[1, 2, 3].map(s => (
                                                        <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-sky-500' : 'bg-slate-100'}`} />
                                                    ))}
                                                </div>

                                                <div className="min-h-[400px]">
                                                    {step === 1 && (
                                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                                            <div className="space-y-1">
                                                                <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{t.phase_1}</h4>
                                                                <h3 className="text-4xl font-black tracking-tighter uppercase italic">{t.personal_identity}</h3>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.full_name}</label>
                                                                    <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all" value={formData.citizen_name} onChange={e => handleFieldChange('citizen_name', e.target.value)} placeholder="e.g. Aditi Rao" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.mobile}</label>
                                                                    <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all font-mono" value={formData.citizen_phone} onChange={e => handleFieldChange('citizen_phone', e.target.value.replace(/\D/g, ''))} maxLength={10} placeholder="10 digit number" />
                                                                </div>
                                                            </div>
                                                            <button disabled={!formData.citizen_name || formData.citizen_phone.length < 10} onClick={() => setStep(2)} className="w-full btn-action py-5 flex items-center justify-center gap-3 disabled:opacity-30">
                                                                {t.btn_specify_loc} <ArrowRight size={18} />
                                                            </button>
                                                        </motion.div>
                                                    )}

                                                    {step === 2 && (
                                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                                            <div className="space-y-1">
                                                                <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{t.phase_2}</h4>
                                                                <h3 className="text-4xl font-black tracking-tighter uppercase italic">{t.incident_vector}</h3>
                                                            </div>
                                                            <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl">
                                                                <MapPicker onLocationChange={loc => setFormData(p => ({ ...p, location: loc.locationString, area: loc.area, locality: loc.locality, citizen_address: loc.displayName }))} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.confirmed_address}</label>
                                                                <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-sky-500/50 transition-all min-h-[80px]" value={formData.citizen_address} onChange={e => handleFieldChange('citizen_address', e.target.value)} />
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <button onClick={() => setStep(1)} className="px-10 rounded-2xl border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">{t.back}</button>
                                                                <button onClick={() => setStep(3)} className="flex-1 btn-action py-5 flex items-center justify-center gap-3">{t.btn_incident_details} <ChevronRight size={18} /></button>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {step === 3 && (
                                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                                            <div className="space-y-1">
                                                                <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{t.phase_3}</h4>
                                                                <h3 className="text-4xl font-black tracking-tighter uppercase italic">{t.grievance_payload}</h3>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div className="flex justify-between items-center ml-1">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.description}</label>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex bg-slate-100 p-1 rounded-xl">
                                                                            <button 
                                                                                onClick={() => setLang('en')}
                                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                                            >
                                                                                EN
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setLang('ta')}
                                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${lang === 'ta' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                                            >
                                                                                தமிழ்
                                                                            </button>
                                                                        </div>
                                                                        <button onClick={toggleRecording} className={`flex items-center gap-4 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isRecording ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-950 text-white hover:bg-slate-800'}`}>
                                                                            <Mic size={16} className={isRecording ? 'animate-pulse' : ''} /> 
                                                                            {isRecording ? (
                                                                                <div className="flex items-center gap-3 border-l border-white/20 pl-3">
                                                                                    <span className="font-mono">{formatTime(recordingTime)}</span>
                                                                                    <WaveAnimator />
                                                                                </div>
                                                                            ) : t.voice_input}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <textarea 
                                                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-10 py-8 text-xl text-slate-900 focus:outline-none focus:border-sky-500/50 transition-all min-h-[200px]" 
                                                                    placeholder={t.desc_placeholder} 
                                                                    value={isRecording ? (formData.text + (interimText ? ' ' + interimText : '')) : formData.text} 
                                                                    onChange={e => handleFieldChange('text', e.target.value)} 
                                                                />
                                                                {isRecording && (
                                                                    <div className="absolute bottom-6 left-10 flex items-center gap-2 text-sky-500 animate-pulse">
                                                                        <div className="w-2 h-2 bg-sky-500 rounded-full" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest">{t.listening}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <button onClick={() => setStep(2)} className="px-10 rounded-2xl border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">{t.back}</button>
                                                                <button onClick={handleRegister} disabled={loading || !formData.text} className="flex-1 btn-action py-5 flex items-center justify-center gap-3">
                                                                    {loading ? <Loader2 className="animate-spin" /> : <>{t.btn_log_incident} <Send size={18} /></>}
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-widest font-mono">{t.status_terminal}</h4>
                                            <h3 className="text-4xl font-black tracking-tighter uppercase italic">{t.locate_signal}</h3>
                                        </div>
                                        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                                            <input className="flex-1 bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-5 text-slate-950 focus:outline-none focus:border-sky-500/50 text-lg font-mono uppercase tracking-widest" value={ticketId} onChange={e => setTicketId(e.target.value.toUpperCase())} placeholder="TKT-XXXXXX" />
                                            <button className="bg-slate-950 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">{t.track}</button>
                                        </form>

                                        {trackData && (
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-1 border border-slate-100 rounded-[2.5rem] shadow-inner bg-slate-50/50">
                                                <div className="bg-white rounded-[2rem] p-10 space-y-10 shadow-sm">
                                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                                        <div>
                                                            <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2 font-mono">{t.active_response_node}</p>
                                                            <h5 className="text-5xl font-black tracking-tighter uppercase italic text-slate-950">{trackData.ticket_id}</h5>
                                                            <div className="flex gap-4 mt-3">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-50 rounded-lg">{trackData.department}</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-sky-500 px-3 py-1 bg-sky-50 rounded-lg">{t.priority} {trackData.priority_score}/10</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end md:items-end">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.stage}</p>
                                                            <div className="px-6 py-2 bg-slate-950 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] italic">
                                                                {trackData.status}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 p-8 rounded-[2rem] text-lg text-slate-500 italic leading-relaxed shadow-inner">
                                                        "{trackData.normalized_text}"
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <Clock size={20} className="text-sky-500" />
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.resolution_target}</p>
                                                                <p className="font-bold text-slate-900">{trackData.estimated_resolution_time}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <Info size={20} className="text-sky-500" />
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.neural_severity}</p>
                                                                <p className="font-bold text-slate-900 uppercase">{trackData.severity_label}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="py-20 px-6 border-t border-slate-100">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <Shield size={24} />
                        </div>
                        <span className="font-black italic uppercase tracking-[0.3em] text-lg">FixMyArea</span>
                    </div>
                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="hover:text-slate-950 cursor-pointer transition-colors">Safety</span>
                        <span className="hover:text-slate-950 cursor-pointer transition-colors">Nodes</span>
                        <span className="hover:text-slate-950 cursor-pointer transition-colors">Terms</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
