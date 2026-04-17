import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Send, Loader2, CheckCircle2, AlertCircle, 
    Search, ClipboardList, PenTool, ArrowRight,
    Cpu, Zap, Shield, MapPin, Clock, Info, Mic
} from 'lucide-react';
import MapPicker from '../components/MapPicker';

export default function CitizenPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const actionAreaRef = React.useRef(null);
    const [mode, setMode] = useState(null); // null, 'register', or 'status'
    const [step, setStep] = useState(1);
    const [isRecording, setIsRecording] = useState(false);
    const [volume, setVolume] = useState(0);
    const [recordingTime, setRecordingTime] = useState(0);
    const [dictationLang, setDictationLang] = useState('en-IN');
    const recognitionRef = React.useRef(null);
    const timerIntervalRef = React.useRef(null);
    const originalTextRef = React.useRef('');
    const audioContextRef = React.useRef(null);
    const analyserRef = React.useRef(null);
    const dataArrayRef = React.useRef(null);
    const sourceRef = React.useRef(null);
    const animationFrameRef = React.useRef(null);

    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);
            dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

            const updateVolume = () => {
                if (!analyserRef.current || !dataArrayRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
                const avg = sum / dataArrayRef.current.length;
                setVolume(avg);
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();
        } catch (err) {
            console.error("Audio Visualizer Error:", err);
        }
    };

    const stopVisualizer = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (sourceRef.current) sourceRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close().catch(()=>{});
        setVolume(0);
    };

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            stopVisualizer();
            clearInterval(timerIntervalRef.current);
            setRecordingTime(0);
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support Neural Speech Recognition.');
            return;
        }

        originalTextRef.current = formData.text;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = dictationLang;
        
        recognition.onresult = (event) => {
            let currentTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            
            setFormData(prev => ({ 
                ...prev, 
                text: (originalTextRef.current ? originalTextRef.current + ' ' : '') + currentTranscript 
            }));
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            stopVisualizer();
            clearInterval(timerIntervalRef.current);
            setRecordingTime(0);
            setIsRecording(false);
        };
        
        recognition.onend = () => {
            stopVisualizer();
            clearInterval(timerIntervalRef.current);
            setRecordingTime(0);
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        startVisualizer();
        
        setRecordingTime(0);
        timerIntervalRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
        
        setIsRecording(true);
    };

    // Sync mode with URL and scroll to action area
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const m = params.get('mode');
        if (m && (m === 'register' || m === 'status')) {
            setMode(m);
            if (actionAreaRef.current) {
                actionAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [location.search]);

    // Internal mode switch scroll
    useEffect(() => {
        if (actionAreaRef.current) {
            actionAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
    }, [mode]);
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [trackData, setTrackData] = useState(null);
    const [error, setError] = useState('');
    const [ticketId, setTicketId] = useState('');

    // Form State
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

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const resp = await axios.post('http://localhost:5000/complaint', formData);
            setTimeout(() => {
                setSuccessData(resp.data.data);
                setLoading(false);
            }, 100);
        } catch (err) {
            setError('Quantum link failed. Please retry.');
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
            setTimeout(() => {
                setTrackData(resp.data);
                setLoading(false);
            }, 100);
        } catch (err) {
            setError('Signal lost. ID not found.');
            setLoading(false);
        }
    };

    const categories = [
        'Street Light', 'Garbage', 'Public Toilet', 'Water Stagnation', 
        'Road and Footpath', 'Park and Playground', 'Public Health', 
        'Storm Water Drains', 'Voter ID', 'General'
    ];

    const areas = ['North Chennai', 'South Chennai', 'Central Chennai', 'West Chennai'];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Blueprint Landing Section */}
            <section className="relative min-h-screen flex flex-col pt-32 px-6">
                
                {/* The "Orange Rectangle" equivalent - Main Image Stage */}
                <div className="flex-1 max-w-[1400px] mx-auto w-full relative mb-12">
                    <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 group">
                        <img 
                            src="/futuristic-city.png" 
                            className="w-full h-full object-cover brightness-[0.6] group-hover:scale-105 transition-transform duration-10000 ease-linear"
                            alt="Smart City Control"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                        
                        {/* Overlay Content */}
                        <div className="absolute bottom-20 left-20 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-6">
                                <Zap className="w-4 h-4 text-indigo-400" />
                                Operation Intelligence Active
                            </div>
                            <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9] mb-8">
                                Secure <span className="text-indigo-500">Infrastructure</span> Uplink
                            </h2>
                            {!mode && (
                                <button 
                                    onClick={() => setMode('register')}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 animate-in slide-in-from-bottom-4 duration-1000 delay-500"
                                >
                                    Complain <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Integrated Action Area */}
            {mode && (
                <div ref={actionAreaRef} className="max-w-7xl mx-auto px-6 -mt-24 pb-20 relative z-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Interaction Area */}
                    <div className="lg:col-span-12">
                        <div className="glass-card rounded-[2.5rem] overflow-hidden neon-border min-h-[600px] flex flex-col">
                            {/* Tabs */}
                            <div className="flex bg-slate-900/40 p-2 gap-2">
                                <button 
                                    onClick={() => setMode('register')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        mode === 'register' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    <PenTool className="w-4 h-4" />
                                    Register Complaint
                                </button>
                                <button 
                                    onClick={() => setMode('status')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        mode === 'status' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    <ClipboardList className="w-4 h-4" />
                                    Track Complaint
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-10 flex-1 flex flex-col">
                                {mode === 'register' ? (
                                    <div className="animate-in fade-in duration-500 h-full flex flex-col">
                                        {successData ? (
                                            <div className="text-center py-20 space-y-6">
                                                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto glow-neon border-2 border-emerald-500/30">
                                                    <CheckCircle2 className="w-12 h-12" />
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="text-4xl font-black text-white px-2">INCIDENT LOGGED</h3>
                                                    <p className="text-slate-400 max-w-sm mx-auto uppercase tracking-widest text-[10px] font-bold">Encrypted ticket generated for {successData.department}</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-md mx-auto shadow-2xl">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Master Ticket ID</p>
                                                    <p className="text-5xl font-mono font-black text-indigo-400 tracking-tighter">{successData.ticket_id}</p>
                                                </div>
                                                <button 
                                                    onClick={() => { setSuccessData(null); setStep(1); setMode('status'); setTicketId(successData.ticket_id); }}
                                                    className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg"
                                                >
                                                    Initialize Tracking <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col">
                                                {/* Step Header */}
                                                <div className="flex justify-between items-center mb-10 px-2">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Phase 0{step}</h3>
                                                        <p className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                                            {step === 1 ? 'Citizen Identity' : step === 2 ? 'Incident Vector' : 'Grievance Payload'}
                                                        </p>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Register Complaint Portal</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3].map(s => (
                                                            <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* STEP 1: IDENTITY */}
                                                {step === 1 && (
                                                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Full Legal Name</label>
                                                                <input 
                                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                                                    placeholder="e.g. Vikram Sharma"
                                                                    value={formData.citizen_name}
                                                                    onChange={(e) => handleFieldChange('citizen_name', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Gender Identity</label>
                                                                <select 
                                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                                                                    value={formData.citizen_gender}
                                                                    onChange={(e) => handleFieldChange('citizen_gender', e.target.value)}
                                                                >
                                                                    <option>Male</option>
                                                                    <option>Female</option>
                                                                    <option>Other</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mobile Number</label>
                                                            <div className="flex gap-3">
                                                                <input 
                                                                    className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                                                                    placeholder="10 digit mobile number"
                                                                    value={formData.citizen_phone}
                                                                    maxLength={10}
                                                                    onChange={(e) => {
                                                                        const onlyNums = e.target.value.replace(/\D/g, '');
                                                                        if (onlyNums.length <= 10) handleFieldChange('citizen_phone', onlyNums);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <button 
                                                            disabled={formData.citizen_phone.length !== 10 || !formData.citizen_name}
                                                            onClick={() => setStep(2)}
                                                            className="w-full btn-primary py-5 flex items-center justify-center gap-3 disabled:opacity-30 transition-all active:scale-[0.98]"
                                                        >
                                                            Proceed to Location <ArrowRight className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* STEP 2: LOCATION */}
                                                {step === 2 && (
                                                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                                        {/* Map Picker */}
                                                        <MapPicker
                                                            onLocationChange={(locData) => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    location: locData.locationString,
                                                                    area: locData.area || prev.area,
                                                                    locality: locData.locality || prev.locality,
                                                                    citizen_pincode: locData.pincode || prev.citizen_pincode,
                                                                    specific_location: locData.displayName || prev.specific_location,
                                                                }));
                                                            }}
                                                        />

                                                        {/* Manual Override Fields */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Municipal Area (Auto-filled)</label>
                                                                <input 
                                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                                                    placeholder="Auto-detected from pin drop"
                                                                    value={formData.area}
                                                                    onChange={(e) => handleFieldChange('area', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Locality (Auto-filled)</label>
                                                                <input 
                                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                                                    placeholder="Auto-detected from pin drop"
                                                                    value={formData.locality}
                                                                    onChange={(e) => handleFieldChange('locality', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Specific Address / Landmark</label>
                                                            <textarea 
                                                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all min-h-[100px]"
                                                                placeholder="Or type an alternative specific location / landmark..."
                                                                value={formData.citizen_address}
                                                                onChange={(e) => handleFieldChange('citizen_address', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <button onClick={() => setStep(1)} className="px-8 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Back</button>
                                                            <button 
                                                                onClick={() => setStep(3)}
                                                                className="flex-1 btn-primary py-5 flex items-center justify-center gap-3"
                                                            >
                                                                Define Grievance <ArrowRight className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* STEP 3: GRIEVANCE */}
                                                {step === 3 && (
                                                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Issue Intelligence Category</label>
                                                                <div className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-2xl px-6 py-4 flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                                                    <span className="text-sm font-black text-indigo-400 uppercase tracking-widest">AI Auto-Detection Active</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Grievance Header</label>
                                                                <input 
                                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                                                    placeholder="Brief title (e.g. Water Line Fracture)"
                                                                    value={formData.title}
                                                                    onChange={(e) => handleFieldChange('title', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2 relative">
                                                            <div className="flex justify-between items-end ml-2 mb-2">
                                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Detailed Neural Payload (AI Processing Input)</label>
                                                                <div className="flex items-center gap-3">
                                                                    <select 
                                                                        value={dictationLang}
                                                                        onChange={(e) => setDictationLang(e.target.value)}
                                                                        disabled={isRecording}
                                                                        className="bg-slate-900 border border-white/10 text-[9px] font-black text-white uppercase tracking-widest rounded-xl px-2 py-1.5 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
                                                                    >
                                                                        <option value="en-IN">English</option>
                                                                        <option value="ta-IN">தமிழ்</option>
                                                                    </select>
                                                                    <button 
                                                                        onClick={toggleRecording}
                                                                        type="button"
                                                                        className={`flex items-center px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                                                                            isRecording 
                                                                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                                                                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                                        }`}
                                                                    >
                                                                        {isRecording ? (
                                                                        <>
                                                                            <Mic className="w-3 h-3 mr-2 text-rose-400 animate-pulse" />
                                                                            <div className="flex items-center gap-[2px] h-3 mr-2">
                                                                                {[0.4, 0.8, 1, 0.8, 0.4].map((mult, i) => (
                                                                                    <div 
                                                                                        key={i} 
                                                                                        className="w-[3px] bg-rose-400 rounded-full transition-all duration-75"
                                                                                        style={{ height: `${Math.max(2, Math.min(12, (volume / 30) * 12 * mult))}px` }}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                            <span className="mr-2 font-mono tracking-widest tabular-nums bg-rose-500/20 px-1.5 py-0.5 rounded text-[8px]">
                                                                                {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                                                                            </span>
                                                                            REC ACTIVE
                                                                        </>
                                                                    ) : (
                                                                        <><Mic className="w-3 h-3 mr-2" /> Voice Input</>
                                                                    )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <textarea 
                                                                className="w-full bg-slate-900/50 border border-white/10 rounded-3xl px-8 py-6 text-lg text-white focus:outline-none focus:border-indigo-500 transition-all min-h-[160px] placeholder:text-slate-700"
                                                                placeholder="Describe the incident details here..."
                                                                value={formData.text}
                                                                onChange={(e) => handleFieldChange('text', e.target.value)}
                                                                required
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                                                            <input 
                                                                type="checkbox"
                                                                className="w-6 h-6 rounded-xl border-white/10 bg-slate-900 text-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                                                                checked={formData.is_anonymous}
                                                                onChange={(e) => handleFieldChange('is_anonymous', e.target.checked)}
                                                            />
                                                            <div>
                                                                <p className="text-xs font-black text-white uppercase tracking-widest">Anonymous Encryption</p>
                                                                <p className="text-[9px] text-slate-500 uppercase font-bold">Hide identity from department nodes</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <button onClick={() => setStep(2)} className="px-8 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Back</button>
                                                            <button 
                                                                disabled={loading || !formData.text}
                                                                onClick={handleRegister}
                                                                className="flex-1 btn-primary py-5 flex items-center justify-center gap-3 relative overflow-hidden"
                                                            >
                                                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>Transmit Data</span> <Send className="w-5 h-5" /></>}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-500 space-y-10">
                                        <div className="px-2">
                                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Signal Status</h3>
                                            <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Track Progress Portal</p>
                                        </div>
                                        <form onSubmit={handleTrack} className="flex gap-4 p-2 bg-slate-900/50 border border-white/5 rounded-2xl group transition-all focus-within:border-indigo-500/50">
                                            <input 
                                                className="flex-1 bg-transparent border-none px-6 py-4 text-white focus:outline-none font-mono text-lg uppercase placeholder:text-slate-700"
                                                placeholder="SIGNAL ID (TKT-XXXXXX)"
                                                value={ticketId}
                                                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                                                required
                                            />
                                            <button disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                                Locate
                                            </button>
                                        </form>

                                        {error && (
                                            <div className="flex items-center gap-3 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 animate-in zoom-in-95 duration-300">
                                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                                <p className="text-xs font-black uppercase tracking-widest leading-loose">{error}</p>
                                            </div>
                                        )}

                                        {trackData && (
                                            <div className="glass-card rounded-[2.5rem] border border-white/10 overflow-hidden animate-in slide-in-from-top-8 duration-700 shadow-2xl">
                                                <div className="bg-indigo-600 px-8 py-3 flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">Temporal Logic Interface</span>
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live Uplink
                                                    </span>
                                                </div>
                                                <div className="p-10 space-y-8">
                                                    {/* Header Info */}
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                                                        <div>
                                                            <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                                                <Cpu className="w-4 h-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Validated Node</span>
                                                            </div>
                                                            <h4 className="text-5xl font-mono font-black tracking-tighter text-white">{trackData.ticket_id}</h4>
                                                            <div className="flex items-center gap-4 mt-3">
                                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{trackData.department}</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <Zap className="w-3 h-3" />
                                                                    Priority {trackData.priority_score}/10
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/5 px-8 py-6 rounded-[2rem] border border-white/5 text-center min-w-[220px] shadow-inner">
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Current Lifecycle</p>
                                                            <p className="text-xl font-black uppercase text-indigo-400 tracking-tighter">{trackData.status}</p>
                                                        </div>
                                                    </div>

                                                    {/* Progress Stepper */}
                                                    <div className="relative py-8 px-4">
                                                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 rounded-full" />
                                                        <div 
                                                            className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 -translate-y-1/2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                                                            style={{ 
                                                                width: trackData.status === 'RESOLVED' ? '100%' : 
                                                                       trackData.status === 'IN_PROGRESS' ? '66%' : '33%' 
                                                                }}
                                                        />
                                                        <div className="flex justify-between relative z-10">
                                                            {[
                                                                { label: 'Logged', status: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] },
                                                                { label: 'Neural Sort', status: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] },
                                                                { label: 'Active Op', status: ['IN_PROGRESS', 'RESOLVED'] },
                                                                { label: 'RESTORED', status: ['RESOLVED'] }
                                                            ].map((step, i) => {
                                                                const isActive = step.status.includes(trackData.status);
                                                                return (
                                                                    <div key={i} className="flex flex-col items-center gap-4">
                                                                        <div className={`w-6 h-6 rounded-full border-4 transition-all duration-700 ${isActive ? 'bg-indigo-500 border-indigo-400/20 shadow-[0_0_12px_rgba(99,102,241,0.5)] scale-110' : 'bg-slate-900 border-slate-800'}`} />
                                                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>{step.label}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group">
                                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                                <Clock className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Temporal Estimate</p>
                                                                <p className="font-bold text-slate-100 text-sm">{trackData.estimated_resolution_time}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group">
                                                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                                                <Info className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Severity Metadata</p>
                                                                <p className="font-bold text-slate-100 text-sm uppercase">{trackData.severity_label}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-8 rounded-3xl bg-slate-950/80 italic text-slate-400 border-l-4 border-indigo-600 shadow-inner text-lg leading-relaxed">
                                                        "{trackData.normalized_text}"
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!trackData && !loading && !error && (
                                            <div className="text-center py-20 opacity-20 animate-pulse">
                                                <Search className="w-20 h-20 mx-auto mb-6" />
                                                <p className="text-xl font-black uppercase tracking-[0.3em]">Temporal uplink ready...</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            )}

            {/* Futuristic Footer */}
            <footer className="border-t border-white/5 py-16 px-6 bg-slate-950/40 backdrop-blur-md mt-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 group cursor-pointer">
                         <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6 text-white" />
                         </div>
                         <span className="font-black uppercase tracking-[0.4em] text-sm italic group-hover:text-indigo-400 transition-colors">FixMyArea</span>
                    </div>
                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                        <span className="hover:text-indigo-400 transition-colors cursor-pointer border-b border-transparent hover:border-indigo-400 pb-1">Primary Node: 4892</span>
                        <span className="hover:text-indigo-400 transition-colors cursor-pointer border-b border-transparent hover:border-indigo-400 pb-1">Protocol: v4.x</span>
                        <span className="hover:text-indigo-400 transition-colors cursor-pointer border-b border-transparent hover:border-indigo-400 pb-1">Citizenship Rights</span>
                    </div>
                    <div className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">
                        &copy; 2026 Global Infrastructure Group
                    </div>
                </div>
            </footer>
        </div>
    );
}
