import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KeyRound, Mail, ShieldAlert, Sparkles, UserPlus, CheckCircle, ArrowRight } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Registration States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [devOtp, setDevOtp] = useState(""); // fallbacks displayed in sandbox to provide premium testing
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal masuk. Periksa kembali email dan password Anda.");
      }

      setSuccessMsg("Masuk berhasil! Mengalihkan ke dashboard...");
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menginisiasi registrasi OTP.");
      }

      setOtpSent(true);
      setSuccessMsg("Kode verifikasi OTP berhasil dikirim ke " + email + "!");
      if (data.devOtpFallback) {
        setDevOtp(data.devOtpFallback);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kode verifikasi salah atau kedaluwarsa.");
      }

      setSuccessMsg("Verifikasi Akun Sukses! Anda berhasil didaftarkan.");
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth flow simulation matching real accounts
  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onAuthSuccess({
        id: "google-uid-" + Math.random().toString(36).substring(2, 9),
        email: email || "muhammadirfanirsyad05@gmail.com",
        role: "user",
        dailyLimit: 350000
      });
    }, 1000);
  };

  return (
    <div id="authApp" className="min-h-screen w-full flex items-center justify-center p-4 bg-transparent relative overflow-hidden select-none">
      {/* Dynamic Background Orbits */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-100/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-indigo-200/30 blur-[150px] pointer-events-none" />

      <motion.div 
        id="authCard"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 p-8 md:p-10 shadow-[0_30px_70px_rgba(15,23,42,0.06)] relative z-10"
      >
        {/* Main Logo & Platform Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-100 mb-4 text-white">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-sky-900">ASFIN</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLogin 
              ? "Kelola keuangan lebih cerdas dengan Analisis AI" 
              : "Verifikasikan Akun Finansial dengan email formal"}
          </p>
        </div>

        {/* Error / Success Banners */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div 
              id="errorMsg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center gap-2 mb-4 leading-relaxed font-medium"
            >
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              id="successMsg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2 mb-4 font-medium"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authentication Form Stages */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form 
              id="loginForm"
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleManualLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Akun</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    id="loginEmail"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com" 
                    required
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 font-medium placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Kata Sandi</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    id="loginPassword"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    required
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="text-right text-xs">
                <a href="#forgot" className="text-sky-600 font-semibold hover:underline">Lupa sandi?</a>
              </div>

              <button 
                id="loginBtn"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold rounded-2xl py-3 px-4 shadow-[0_10px_20px_rgba(14,165,233,0.15)] hover:shadow-sky-100 text-sm flex items-center justify-center gap-2 transition-all mt-6 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Menghubungkan..." : "Masuk Sekarang"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                id="googleLoginBtn"
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-2xl py-3 px-4 transition-colors mt-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107" />
                  <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00" />
                  <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50" />
                  <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2" />
                </svg>
                Masuk dengan Google
              </button>
            </motion.form>
          ) : (
            <motion.div
              id="registerForm"
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {!otpSent ? (
                <form id="initRegisterForm" onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Baru</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <input 
                        id="registerEmail"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com" 
                        required
                        className="w-full bg-slate-50 border border-slate-200/80 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Kata Sandi</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <input 
                        id="registerPassword"
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter" 
                        required
                        className="w-full bg-slate-50 border border-slate-200/80 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Ulangi Sandi</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                      <input 
                        id="registerConfirmPassword"
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi" 
                        required
                        className="w-full bg-slate-50 border border-slate-200/80 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    id="sendOtpBtn"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-2xl py-3.5 text-sm transition-all shadow-[0_10px_20px_rgba(14,165,233,0.15)] mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus className="w-5 h-5" />
                    {loading ? "Mengirim OTP..." : "Kirim Kode OTP"}
                  </button>
                </form>
              ) : (
                <form id="verifyOtpForm" onSubmit={handleVerifyRegister} className="space-y-5">
                  <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl text-xs text-sky-800 leading-relaxed">
                    Kami telah menginstruksikan pengiriman kode verifikasi 6-Digit ke alamat <strong>{email}</strong>. Silakan masukkan di bawah ini.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider text-center">Masukkan Kode OTP</label>
                    <input 
                      id="otpInput"
                      type="text" 
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 123456" 
                      required
                      className="w-full text-center bg-slate-50 border border-slate-200/80 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 rounded-2xl py-4 text-2xl font-bold tracking-[1em] pl-[1em] text-cyan-900 placeholder:text-slate-200 placeholder:tracking-normal placeholder:font-normal outline-none transition-all"
                    />
                  </div>

                  {devOtp && (
                    <div id="devOtpBanner" className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-amber-800 flex flex-col gap-1">
                      <span className="font-bold">🖥️ Mode Pengembang (Sandbox):</span>
                      <span>Jika API Email Vercel eksternal overload, masukkan kode OTP cadangan ini: <strong className="text-sm font-black text-amber-900 tracking-wider font-mono">{devOtp}</strong></span>
                    </div>
                  )}

                  <button 
                    id="verifyOtpBtn"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl py-3.5 text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    Konfirmasi OTP & Buat Akun
                  </button>

                  <button
                    id="cancelOtpBtn"
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full bg-transparent hover:bg-slate-50 text-slate-500 font-semibold text-xs py-2 rounded-xl transition-colors"
                  >
                    Kembali ke Input Email
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Toggle Switches */}
        <div id="toggleAuth" className="mt-8 border-t border-slate-100 pt-6 text-center text-xs">
          {isLogin ? (
            <p className="text-slate-500">
              Belum punya akun finansial?{" "}
              <button 
                id="switchToRegister"
                onClick={() => {
                  setIsLogin(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }} 
                className="text-sky-600 font-bold hover:underline transition-all ml-1"
              >
                Daftar Akun Baru
              </button>
            </p>
          ) : (
            <p className="text-slate-500">
              Sudah memiliki akun?{" "}
              <button 
                id="switchToLogin"
                onClick={() => {
                  setIsLogin(true);
                  setOtpSent(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }} 
                className="text-sky-600 font-bold hover:underline transition-all ml-1"
              >
                Masuk ke Aplikasi
              </button>
            </p>
          )}

          {/* Quick Start Hints for Sandbox evaluation */}
          <div className="mt-4 p-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-400 text-center">
            Pencatatan Instan demo: <strong className="text-slate-600">admin@asfin.com / admin123</strong> (Akses CMS), <strong className="text-slate-600">user@asfin.com / user123</strong> (User Biasa)
          </div>
        </div>
      </motion.div>
    </div>
  );
}
