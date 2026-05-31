import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  LogOut, 
  User, 
  ShieldCheck, 
  BarChart, 
  Smartphone, 
  Scan, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  ReceiptJapaneseYen,
  Flame,
  LayoutDashboard,
  ChevronRight
} from "lucide-react";
import AuthPage from "./components/AuthPage.js";
import Dashboard from "./components/Dashboard.js";
import ManualForm from "./components/ManualForm.js";
import ReceiptScanner from "./components/ReceiptScanner.js";
import AdminCMS from "./components/AdminCMS.js";
import { Transaction } from "./types.js";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'scanner' | 'admin'>('dashboard');
  
  // Custom global system content synced with Admin editor CMS
  const [cmsConfig, setCmsConfig] = useState<any>({
    announcement: "Pemberitahuan: Pemindaian struk berbasis AI dengan Gemini 3.5 Flash sudah aktif secara penuh!",
    heroImage: "",
    platformText: "Revolusi Keuangan Dimulai dari ASFIN. Mengelola pengeluaran dan pemasukan dengan kecerdasan bertenaga AI.",
  });

  // Modal manual forms representation
  const [showManualForm, setShowManualForm] = useState(false);
  const [scannerPreFill, setScannerPreFill] = useState<any>(null);

  // Flow State
  // 'landing' | 'auth' | 'app'
  const [appFlowState, setAppFlowState] = useState<'landing' | 'auth' | 'app'>('landing');

  // Custom visual toast alerts
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warn' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'warn' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync / retrieve transaction logs on successful authentication
  const fetchUserTransactions = async (uid: string) => {
    try {
      const response = await fetch(`/api/transactions?userId=${uid}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Gagal mengambil data transaksi user:", err);
    }
  };

  // Sync CMS configs at start
  const fetchCmsData = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (response.ok && data.success) {
        setCmsConfig({
          announcement: data.stats.configs.announcement,
          heroImage: data.stats.configs.heroImage,
          platformText: data.stats.configs.platformText,
        });
      }
    } catch (err) {
      console.log("CMS not preloaded yet:", err);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const handleAuthSuccess = (userPayload: any) => {
    setCurrentUser(userPayload);
    setAppFlowState('app');
    fetchUserTransactions(userPayload.id);
    fetchCmsData(); // reload live CMS announcements
    showToast(`Selamat datang kembali, ${userPayload.email}!`, "success");
  };

  const handleAddNewTransaction = (newTx: any, warningMessage?: string) => {
    // Add to state list
    setTransactions((prev) => [newTx, ...prev]);
    setShowManualForm(false);
    setScannerPreFill(null);
    showToast("Transaksi berhasil dicatat!", "success");

    if (warningMessage) {
      // Trigger limit warning alert
      setTimeout(() => {
        showToast(warningMessage, "warn");
      }, 500);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan transaksi ini?")) return;

    try {
      const response = await fetch(`/api/transactions/${id}?userId=${currentUser.id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        showToast("Transaksi berhasil dihapus.", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast("Gagal menghapus: " + err.message, "warn");
    }
  };

  const handleUpdateLimit = async (newLimit: number) => {
    try {
      const response = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, dailyLimit: newLimit })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentUser((prev: any) => ({ ...prev, dailyLimit: newLimit }));
        // Refresh transactions to verify bounds
        fetchUserTransactions(currentUser.id);
        showToast("Batas limit belanja harian berhasil diperbarui!", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast("Gagal memperbarui batas: " + err.message, "warn");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppFlowState('landing');
    setTransactions([]);
    setActiveView('dashboard');
    showToast("Sesi Anda telah diakhiri. Berhasil keluar.", "info");
  };

  const handleScannerTrigger = (prefillData: any) => {
    setScannerPreFill(prefillData);
    setShowManualForm(true);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans flex flex-col relative overflow-x-hidden selection:bg-blue-100">
      
      {/* Frosted Glass Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-45 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-300 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-200 blur-[120px]"></div>
      </div>
      
      {/* 1. Global Custom Toast Banner overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            id="toastAlert"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-[9999] max-w-sm rounded-2xl p-4 shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all ${
              toast.type === "success" 
                ? "bg-white/95 border-emerald-100 text-slate-800 shadow-emerald-50" 
                : toast.type === "warn" 
                  ? "bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-50" 
                  : "bg-sky-50/95 border-sky-150 text-sky-900 shadow-sky-50"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : toast.type === "warn" ? (
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-sky-600 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold leading-none capitalize mb-1">System Notification</p>
              <p className="text-xs font-semibold leading-relaxed text-slate-600">{toast.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Page segments router */}

      {/* STAGE A: LANDING PAGE */}
      {appFlowState === 'landing' && (
        <div id="landingView" className="flex-1 flex flex-col justify-between bg-[#006591] text-white relative">
          
          {/* Static Backdrop overlay matching specs images */}
          <div className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay pointer-events-none">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6SuQjjsnP_YyM-waF2k0rTWLwCxVlxMjexHb9SVTQ6H0oiRZ2xBbopkJDpUnVLCvm_tqlDUNZ2ENVM_YgR16DsUN4OVq0ylsHGg5Rg24c1EfAFN9JwWgeD9welaWVrVnO4XzepqjYBMS_dJjLsoMN6HnGSXzJyMDJDjdEs3P8pHW1X2RBv45UCJ6bzyGqz2SHxg5Lvmu6D-BjGDAeAfkALyXR1P_LpJFhK4a-SVBiJ7eZUYN4RWGnMcEHLqGgG9yYZaHiphlxp8s" 
              className="w-full h-full object-cover" 
              alt="landing bg" 
            />
          </div>

          {/* Landing Header */}
          <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-5 bg-white/10 backdrop-blur-md border-b border-white/15">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg shadow">🧾</div>
              <span className="text-xl font-black tracking-tight">ASFIN</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAppFlowState('auth')} 
                className="text-sm font-bold text-slate-100 hover:text-white transition-colors"
              >
                Masuk
              </button>
              <button 
                onClick={() => setAppFlowState('auth')} 
                className="bg-white text-sky-850 font-bold px-5 py-2.5 rounded-full text-xs hover:scale-105 active:scale-95 transition-transform shadow-md"
              >
                Mulai Gratis
              </button>
            </div>
          </nav>

          {/* Hero segment */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-8"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              AI-Powered Financial Assistant
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              Revolusi Keuangan <br />
              <span className="text-yellow-300">Dimulai dari ASFIN</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg md:text-xl text-slate-100/90 max-w-2xl font-medium tracking-wide mb-10"
            >
              {cmsConfig.platformText}
            </motion.p>

            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setAppFlowState('auth')}
              className="bg-white text-sky-900 font-extrabold px-9 py-4 rounded-full text-sm shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:shadow-white/20 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
            >
              Mulai Gratis Sekarang
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          {/* Features segment */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
            <h3 className="text-center text-sm uppercase tracking-widest font-extrabold text-slate-200 mb-10">Fitur Unggulan ASFIN</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-2"><Smartphone className="w-6 h-6" /></div>
                <h4 className="font-bold text-base">Input Manual</h4>
                <p className="text-xs text-slate-200/80 leading-relaxed font-semibold">Catat transaksi dengan cepat dan mudah kapan saja dimana saja.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-2"><Scan className="w-6 h-6 animate-pulse" /></div>
                <h4 className="font-bold text-base">Scan AI</h4>
                <p className="text-xs text-slate-200/80 leading-relaxed font-semibold">Foto struk otomatis terinput ke sistem berkat kecerdasan buatan.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-2"><BarChart className="w-6 h-6" /></div>
                <h4 className="font-bold text-base">Laporan Keuangan</h4>
                <p className="text-xs text-slate-200/80 leading-relaxed font-semibold">Analisis mendalam kondisi keuangan Anda dengan visualisasi interaktif.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-2"><ShieldCheck className="w-6 h-6" /></div>
                <h4 className="font-bold text-base">Keamanan Terjamin</h4>
                <p className="text-xs text-slate-200/80 leading-relaxed font-semibold">Data Anda aman dengan enkripsi tingkat tinggi dan privasi terjaga.</p>
              </div>

            </div>
          </div>

          {/* Landing Footer */}
          <footer className="relative z-10 border-t border-white/10 bg-black/10 py-6 text-center text-xs text-slate-300">
            <p>© 2026 ASFIN - Pencatatan Keuangan untuk Ipanzx. Semua hak dilindungi.</p>
          </footer>

        </div>
      )}

      {/* STAGE B: USER PORTAL AUTH */}
      {appFlowState === 'auth' && (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}

      {/* STAGE C: AUTHENTICATED SYSTEM APP */}
      {appFlowState === 'app' && (
        <div id="fullApplicationLayout" className="flex-1 flex flex-col md:flex-row">
          
          {/* Sidebar Area */}
          <aside id="sideNavDrawer" className="w-full md:w-64 bg-white/70 backdrop-blur-xl flex flex-col shrink-0 border-r border-slate-200/40 z-10">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-base shadow text-white">🧾</div>
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">ASFIN</span>
              </div>
              <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">PRO</span>
            </div>

            {/* Profiles detail snippet */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/20 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {currentUser.email.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{currentUser.email}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mt-0.5">{currentUser.role || "User"}</p>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <nav className="p-4 flex-grow space-y-1.5 flex flex-col">
              <button
                id="sidebarDashboardBtn"
                onClick={() => setActiveView('dashboard')}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2.5 ${
                  activeView === "dashboard"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200 border border-blue-600"
                    : "hover:bg-slate-100/40 text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard / Saldo
              </button>

              <button
                id="sidebarScannerBtn"
                onClick={() => setActiveView('scanner')}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2.5 ${
                  activeView === "scanner"
                    ? "bg-blue-600 text-white shadow-sm border border-blue-600"
                    : "hover:bg-slate-100/40 text-slate-500 hover:text-slate-800"
                }`}
              >
                <Scan className="w-4 h-4" />
                Scan Struk AI
              </button>

              {/* Protected Route verification check: only render admin node for role === 'admin' */}
              {currentUser.role === "admin" && (
                <button
                  id="sidebarAdminBtn"
                  onClick={() => setActiveView('admin')}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2.5 ${
                    activeView === "admin"
                      ? "bg-indigo-600 text-white shadow-sm border border-indigo-600"
                      : "hover:bg-slate-100/40 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Admin Dashboard CMS
                </button>
              )}
            </nav>

            {/* Logout buttons */}
            <div className="p-4 border-t border-slate-100">
              <button
                id="logoutBtn"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-transparent hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-transparent hover:border-rose-100 font-bold text-xs rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Keluar Sesi
              </button>
            </div>
          </aside>

          {/* Primary workspace layout container panel */}
          <main id="mainWorkspaceArea" className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
            
            {/* Global system announcements fetched from configs settings */}
            {cmsConfig.announcement && (
              <div id="cmsAnnouncement" className="bg-sky-50 border border-sky-100 text-sky-850 py-3 px-5 rounded-2xl mb-6 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-semibold">{cmsConfig.announcement}</span>
              </div>
            )}

            {/* Render view segments dynamically */}
            {activeView === 'dashboard' && (
              <Dashboard
                user={currentUser}
                transactions={transactions}
                onAddTransactionClick={() => {
                  setScannerPreFill(null);
                  setShowManualForm(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                onUpdateLimit={handleUpdateLimit}
                onToast={showToast}
              />
            )}

            {activeView === 'scanner' && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
                  <ReceiptScanner 
                    onScanComplete={handleScannerTrigger} 
                    onToast={showToast} 
                  />
                </div>
                <div className="md:col-span-2 bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-6">
                  <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-3">Cara Menggunakan Scan AI</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">Pemindaian Struk Belanja Bertenaga Gemini AI mengotomasi perekaman kas Anda hanya dalam beberapa detik:</p>
                  <ul className="space-y-3.5 text-xs text-slate-600 font-semibold selection:bg-cyan-50">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 bg-sky-100 text-sky-700 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">1</span>
                      <span>Unggah file foto struk belanjaan Anda ke dalam area unggahan di sisi kiri.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 bg-sky-100 text-sky-700 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">2</span>
                      <span>Model AI Gemini 3.5 Flash akan memindai merchant, mendeteksi harga total, tanggal pembelian, dan merekomendasikan kategori.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 bg-sky-100 text-sky-700 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">3</span>
                      <span>Formulir entri otomatis akan terbuka, memungkinkan Anda untuk meninjau detail pengeluaran sebelum menyimpannya secara resmi ke database.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeView === 'admin' && (
              <AdminCMS 
                onToast={showToast}
                onClose={() => setActiveView('dashboard')}
              />
            )}

          </main>

        </div>
      )}

      {/* Manual & Pre-filled scanning Form overlay modals */}
      {showManualForm && (
        <ManualForm
          userId={currentUser?.id}
          onSuccess={handleAddNewTransaction}
          onClose={() => {
            setShowManualForm(false);
            setScannerPreFill(null);
          }}
          initialData={scannerPreFill}
        />
      )}

    </div>
  );
}
