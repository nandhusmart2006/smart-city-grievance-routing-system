import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CitizenPage from './pages/CitizenPage';
import AdminDashboard from './pages/AdminDashboard';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck, LayoutDashboard, User } from 'lucide-react';

import { useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <header className="fixed top-0 left-0 w-full z-50 p-6 pointer-events-none">
      <div className="max-w-[1600px] mx-auto flex items-start justify-between pointer-events-auto">
        {/* White Rectangle Brand Area */}
        <Link to="/" className="bg-white px-10 py-4 shadow-2xl group transition-all hover:scale-105 active:scale-95">
           <span className="text-slate-950 font-black text-3xl uppercase italic tracking-tighter">FixMyArea</span>
        </Link>
        
        {/* Navigation / Status */}
        <nav className="flex items-center gap-4">
          {!isAdmin ? (
            <>
              <Link to="/?mode=register" className="bg-white/10 backdrop-blur-xl border border-white/20 px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all hover:-translate-y-1 shadow-lg shadow-indigo-500/10">
                Register Complaint
              </Link>
              <Link to="/?mode=status" className="bg-white/10 backdrop-blur-xl border border-white/20 px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all hover:-translate-y-1 shadow-lg shadow-indigo-500/10">
                Track Complaint
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4 bg-slate-950/50 backdrop-blur-xl border border-indigo-500/30 px-8 py-4 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-in fade-in zoom-in duration-500">
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Secure Government Node</span>
               <div className="h-4 w-[1px] bg-white/10 mx-2" />
               <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Log Out</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-100 selection:bg-indigo-500/30">
        <Navigation />

        <main className="relative z-10 pt-28">
          <Routes>
            <Route path="/" element={<CitizenPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
