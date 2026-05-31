import React, { useState, useEffect } from "react";
import { 
  Users, 
  Settings, 
  Settings2, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  DollarSign, 
  Edit, 
  KeyRound, 
  Sparkles,
  PieChart
} from "lucide-react";
import { 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface AdminCMSProps {
  onToast: (msg: string, type: 'success' | 'warn' | 'info') => void;
  onClose: () => void;
}

export default function AdminCMS({ onToast, onClose }: AdminCMSProps) {
  // Configs and stats states
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [announcement, setAnnouncement] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [platformText, setPlatformText] = useState("");
  const [geminiKey, setGeminiKey] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setAnnouncement(data.stats.configs.announcement || "");
        setHeroImage(data.stats.configs.heroImage || "");
        setPlatformText(data.stats.configs.platformText || "");
        setGeminiKey(data.stats.configs.geminiApiKeySecured || "");
      } else {
        throw new Error(data.error || "Gagal mengambil data CMS.");
      }
    } catch (err: any) {
      onToast("Error CMS: " + err.message, "warn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcement,
          heroImage,
          platformText,
          geminiApiKeySecured: geminiKey
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      onToast("Pengaturan CMS Berhasil Disimpan!", "success");
      fetchStats();
    } catch (err: any) {
      onToast("Batal: " + err.message, "warn");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      onToast("Ulangi password baru Anda dengan benar.", "warn");
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onToast("Kata sandi Admin berhasil diubah!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      onToast("Error: " + err.message, "warn");
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <div id="cmsLoading" className="p-12 text-center text-sm font-semibold text-slate-500">
        Memuat Panel CMS Administrasi ManKeu ( Management Keuangan )...
      </div>
    );
  }

  // Format Recharts Candlestick data properly
  // Each candle holds low-high (wick) range array, and open-close (body) range array
  const formattedCandleData = stats?.candlestickData?.map((item: any) => {
    const isUp = item.close >= item.open;
    return {
      date: item.date,
      wick: [item.low, item.high],
      body: [item.open, item.close],
      isUp,
      // For chart tooltip helpers
      Open: item.open,
      Close: item.close,
      High: item.high,
      Low: item.low
    };
  }) || [];

  return (
    <div id="adminCMSContainer" className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900/90 via-indigo-950/90 to-slate-900/85 backdrop-blur-md text-white border border-white/10 rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold tracking-tight">ManKeu ( Management Keuangan ) Admin CMS</h2>
            <span className="text-[10px] bg-cyan-400/20 text-cyan-300 font-bold px-2 py-0.5 rounded">Protected Route</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">Konfigurasi teks sistem, pantau pertumbuhan user, kelola Gemini key, dan amati candlestick cashflow</p>
        </div>
        <button 
          id="exitCmsBtn"
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
        >
          Kembali ke Dashboard
        </button>
      </div>

      {/* 2. Platform aggregates counters */}
      <div id="cmsAggregatesBlock" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total User Terdaftar</p>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">{stats?.totalUsers} User</h4>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Platform Income</p>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">Rp {(stats?.totalIncome || 0).toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600"><TrendingDown className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Platform Expense</p>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">Rp {(stats?.totalExpense || 0).toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Platform Real Balance</p>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">Rp {(stats?.totalBalance || 0).toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* 3. Recharts Candlestick visualization */}
      <div id="candleVisualContainer" className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-600" />
            Grafik Candlestick Tren Keuangan Harian
          </h3>
          <p className="text-xs text-slate-400 mt-1">Menggambarkan harga Pembuka (Open), Penutup (Close), Tertinggi (High), dan Terendah (Low) kas keseluruhan platform</p>
        </div>

        <div className="h-[300px] w-full">
          {formattedCandleData.length === 0 ? (
            <div className="text-center text-slate-400 py-12 text-xs">Belum ada data cashflow harian untuk memetakan candlestick.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedCandleData} margin={{ top: 20, right: 5, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 100000', 'dataMax + 100000']} stroke="#94a3b8" />
                <Tooltip 
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-700 text-xs shadow-md space-y-1">
                        <p className="font-bold border-b border-white/10 pb-1">{data.date}</p>
                        <p>Open: <span className="font-semibold text-sky-300">Rp {data.Open.toLocaleString()}</span></p>
                        <p>Close: <span className="font-semibold text-cyan-300">Rp {data.Close.toLocaleString()}</span></p>
                        <p>High: <span className="font-semibold text-emerald-300">Rp {data.High.toLocaleString()}</span></p>
                        <p>Low: <span className="font-semibold text-rose-300">Rp {data.Low.toLocaleString()}</span></p>
                      </div>
                    );
                  }}
                />
                
                {/* Candlestick Wick (Low and High) rendered as ranges */}
                <Bar dataKey="wick" barSize={2} fill="#94a3b8">
                  {formattedCandleData.map((entry: any, index: number) => (
                    <Cell key={`wick-cell-${index}`} fill={entry.isUp ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>

                {/* Candlestick Body (Open and Close) rendered as ranges */}
                <Bar dataKey="body" barSize={14}>
                  {formattedCandleData.map((entry: any, index: number) => (
                    <Cell key={`body-cell-${index}`} fill={entry.isUp ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Split Settings & Security Forms */}
      <div id="formsLayout" className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Global CMS UI Editor & API Forms */}
        <div id="cmsEditor" className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-3 border-slate-100">
            <Edit className="w-4 h-4 text-sky-600" />
            UI Editor & API Pengaturan
          </h3>

          <form id="cmsForm" onSubmit={handleUpdateCMS} className="space-y-4 text-xs font-semibold text-slate-600">
            <div>
              <label className="block mb-1">Judul Pengumuman Global</label>
              <input 
                id="announcementInput"
                type="text" 
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Link Hero Background URL</label>
              <input 
                id="heroImageInput"
                type="text" 
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Sub-Teks Banner Utama</label>
              <textarea 
                id="platformTextInput"
                rows={2}
                value={platformText}
                onChange={(e) => setPlatformText(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-slate-800 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Secure Gemini API Key
              </label>
              <input 
                id="geminiKeyInput"
                type="password" 
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Disamarkan untuk keamanan"
                className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-slate-800 outline-none font-mono"
              />
            </div>

            <button 
              id="saveCmsBtn"
              type="submit" 
              disabled={savingSettings}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-colors"
            >
              {savingSettings ? "Menyimpan CMS..." : "Simpan Pengaturan Utama"}
            </button>
          </form>
        </div>

        {/* Change Password Admin forms */}
        <div id="securityEditor" className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-3 border-slate-100">
            <KeyRound className="w-4 h-4 text-cyan-600" />
            Keamanan Admin (Ganti Password)
          </h3>

          <form id="passForm" onSubmit={handleChangePassword} className="space-y-4 text-xs font-semibold text-slate-600">
            <div>
              <label className="block mb-1">Password Saat Ini</label>
              <input 
                id="currPassInput"
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password admin harian"
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Password Baru</label>
              <input 
                id="newPassInput"
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Konfirmasi Password Baru</label>
              <input 
                id="newPassConfirmInput"
                type="password" 
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Ulangi password baru"
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-slate-800 outline-none"
              />
            </div>

            <button 
              id="savePassBtn"
              type="submit" 
              disabled={changingPass}
              className="w-full bg-cyan-600 hover:bg-cyan-505 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-all"
            >
              {changingPass ? "Mengubah sandi..." : "Ubah Kata Sandi Admin"}
            </button>
          </form>
        </div>

      </div>

      {/* 5. User Management table */}
      <div id="users CMS" className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <div id="usersHeader" className="mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Manajemen User Terdaftar & Statistik Aktif
          </h3>
          <p className="text-xs text-slate-400 mt-1">Daftar akun formal terdaftar beserta batas limit harian mereka</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700">
            <thead>
              <tr className="border-b text-[10px] text-slate-400 uppercase font-bold">
                <th className="pb-3 pl-2">User ID</th>
                <th className="pb-3">Email Formal</th>
                <th className="pb-3">Verifikasi</th>
                <th className="pb-3">Batas Harian (Rp)</th>
                <th className="pb-3 text-right">Income</th>
                <th className="pb-3 text-right">Expense</th>
                <th className="pb-3 pr-2 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {stats?.userList?.map((u: any) => (
                <tr key={u.id} className="border-b border-slate-100 text-[11px] hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-2 font-mono text-slate-400">{u.id}</td>
                  <td className="py-3 text-slate-800 font-bold">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {u.verified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 font-mono">Rp {u.dailyLimit.toLocaleString()}</td>
                  <td className="py-3 text-right text-emerald-600 font-mono">Rp {u.stats.income.toLocaleString()}</td>
                  <td className="py-3 text-right text-rose-600 font-mono">Rp {u.stats.expense.toLocaleString()}</td>
                  <td className="py-3 pr-2 text-center">
                    <span className="text-[10px] bg-slate-150 text-slate-500 py-1 px-2.5 rounded-full font-bold">No Actions Needed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
