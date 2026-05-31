import React, { useState } from "react";
import { 
  Plus, 
  Download, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  AlertTriangle,
  Flame,
  CalendarCheck,
  ChevronRight,
  Settings
} from "lucide-react";
import { Transaction } from "../types";

interface DashboardProps {
  user: any;
  transactions: Transaction[];
  onAddTransactionClick: () => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateLimit: (newLimit: number) => void;
  onToast: (msg: string, type: 'success' | 'warn' | 'info') => void;
}

export default function Dashboard({ 
  user, 
  transactions, 
  onAddTransactionClick, 
  onDeleteTransaction, 
  onUpdateLimit,
  onToast
}: DashboardProps) {
  
  const [editingLimit, setEditingLimit] = useState(false);
  const [newLimitInput, setNewLimitInput] = useState(user.dailyLimit.toString());

  // 1. Calculate dynamic balances
  const totalIncome = transactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  const walletBalances = {
    Dana: 0,
    Cash: 0,
    Bank: 0
  };

  transactions.forEach((tx) => {
    const val = tx.type === 'pemasukan' ? tx.amount : -tx.amount;
    if (tx.wallet in walletBalances) {
      walletBalances[tx.wallet as 'Dana' | 'Cash' | 'Bank'] += val;
    }
  });

  // 2. Budget limits checking logic
  const todayStr = new Date().toISOString().split("T")[0];
  const todayExpenses = transactions
    .filter(t => t.date === todayStr && t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const limitWarningTriggered = user.dailyLimit > 0 && todayExpenses > user.dailyLimit;
  const progressPercent = user.dailyLimit > 0 
    ? Math.min(100, Math.round((todayExpenses / user.dailyLimit) * 100)) 
    : 0;

  const handleUpdateLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = Number(newLimitInput);
    if (isNaN(updated) || updated < 0) {
      onToast("Batas limit harian harus bernilai angka positif.", "warn");
      return;
    }
    onUpdateLimit(updated);
    setEditingLimit(false);
  };

  // 3. Weekly CSV download
  const handleDownloadCSV = () => {
    onToast("Mempersiapkan unduhan rekap mingguan...", "info");
    const link = document.createElement("a");
    link.href = `/api/transactions/export?userId=${user.id}`;
    link.setAttribute("download", `Rekap_Keuangan_Mingguan_${user.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category Icon Resolver
  const getCategoryIcon = (cat: string) => {
    const clean = cat ? cat.toLowerCase() : "";
    if (clean.includes("gaji")) return { class: "bg-emerald-100 text-emerald-700", label: "💰" };
    if (clean.includes("makan")) return { class: "bg-amber-100 text-amber-700", label: "🍳" };
    if (clean.includes("tagihan")) return { class: "bg-indigo-100 text-indigo-700", label: "🔌" };
    if (clean.includes("hiburan")) return { class: "bg-rose-100 text-rose-700", label: "🎬" };
    if (clean.includes("belanja")) return { class: "bg-cyan-100 text-cyan-700", label: "🛒" };
    if (clean.includes("saku")) return { class: "bg-sky-100 text-sky-700", label: "🎒" };
    if (clean.includes("trans")) return { class: "bg-blue-100 text-blue-700", label: "🛵" };
    return { class: "bg-slate-100 text-slate-700", label: "💳" };
  };

  return (
    <div id="dashboardSection" className="space-y-6">
      
      {/* 1. Overall Balance cards & wallet details */}
      <div id="financialAggregateBlock" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Main Wallet Summary Callout */}
        <div id="totalSaldoCard" className="bg-gradient-to-br from-cyan-600 via-sky-600 to-sky-700 rounded-[20px] p-6 text-white shadow-[0_15px_30px_rgba(14,165,233,0.15)] flex flex-col justify-between col-span-1 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-sky-400/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-xs text-cyan-100 font-medium tracking-wide">Total Saldo Terkonsolidasi (Bersih)</p>
              <h2 className="text-3xl font-black mt-1.5 tracking-tight">
                Rp {totalBalance.toLocaleString("id-ID")}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-cyan-200" />
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-6 z-10 relative">
            <div>
              <p className="text-[10px] text-cyan-100/80">Total Pemasukan</p>
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" /> Rp {totalIncome.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-cyan-100/80">Total Pengeluaran</p>
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1 mt-0.5">
                <TrendingDown className="w-3 h-3" /> Rp {totalExpense.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Small Pocket Wallets */}
        {(["Dana", "Cash", "Bank"] as const).map((w) => {
          const bal = walletBalances[w];
          const isPos = bal >= 0;
          return (
            <div 
              key={w}
              id={`walletCard-${w}`}
              className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">{w}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${isPos ? "bg-emerald-500" : "bg-red-500"}`} />
              </div>
              <div className="mt-4">
                <p className="text-[11px] text-slate-400">Saldo Dompet</p>
                <h4 className="text-lg font-bold text-slate-800 mt-0.5">
                  Rp {bal.toLocaleString("id-ID")}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Overrun Warning Indicators */}
      {limitWarningTriggered && (
        <div id="budgetLimitAlert" className="bg-rose-50/55 backdrop-blur-xs border border-rose-200/50 text-rose-800 px-5 py-4 rounded-3xl flex items-start gap-3.5 leading-relaxed shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0 animate-bounce" />
          <div>
            <h4 className="text-sm font-bold text-rose-900">Peringatan: Limit Pengeluaran Harian Tercapai!</h4>
            <p className="text-xs text-rose-700/90 mt-0.5">Total pengeluaran Anda hari ini (Rp {todayExpenses.toLocaleString("id-ID")}) sudah melebihi batas limit harian yang Anda tetapkan (Rp {user.dailyLimit.toLocaleString("id-ID")}). Hemat pengeluaran Anda!</p>
          </div>
        </div>
      )}

      {/* 3. Daily Budget and Action bar split */}
      <div id="budgetControlRow" className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Limit progress tracker */}
        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-5 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                Manajemen Budget Harian ({todayStr})
              </h4>
              <button 
                id="editLimitBtn"
                onClick={() => setEditingLimit(!editingLimit)}
                className="text-xs text-sky-600 font-bold hover:underline flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                Ubah Batas
              </button>
            </div>

            {editingLimit ? (
              <form id="limitUpdateForm" onSubmit={handleUpdateLimitSubmit} className="flex gap-2 mb-4 bg-slate-100/40 border border-slate-200/35 p-2 rounded-xl">
                <input 
                  id="limitInput"
                  type="number"
                  value={newLimitInput}
                  onChange={(e) => setNewLimitInput(e.target.value)}
                  placeholder="Instankan limit e.g. 500000"
                  className="bg-white border rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none flex-1"
                />
                <button type="submit" className="bg-sky-600 text-white rounded-lg px-3 py-1 text-xs font-bold hover:bg-sky-500 transition-colors">Terapkan</button>
                <button type="button" onClick={() => setEditingLimit(false)} className="text-slate-500 text-xs hover:underline px-2">Batal</button>
              </form>
            ) : null}

            {/* Range Bar */}
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden relative">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                  progressPercent >= 100 
                    ? "bg-rose-500" 
                    : progressPercent >= 80 
                      ? "bg-amber-500" 
                      : "bg-sky-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2.5 font-semibold text-slate-500">
              <span className="text-slate-700">Terpakai: Rp {todayExpenses.toLocaleString("id-ID")}</span>
              <span>Batas: Rp {user.dailyLimit.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl text-center text-xs text-slate-500 mt-4 border border-slate-100">
            {user.dailyLimit === 0 
              ? "Batas harian dinonaktifkan. Silakan 'Ubah Batas' untuk mengatur anggaran belanja harian Anda."
              : `Anggaran hari ini tersisa: Rp ${Math.max(0, user.dailyLimit - todayExpenses).toLocaleString("id-ID")} (${100 - progressPercent}% sisa)`}
          </div>
        </div>

        {/* Action Widgets */}
        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <CalendarCheck className="w-4 h-4 text-sky-600" />
              Kontrol Transaksi
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Tambahkan pengeluaran/pemasukan manual atau ekspor buku rekap minggu ini.</p>
          </div>

          <div className="space-y-2">
            <button
              id="dashboardAddTxBtn"
              onClick={onAddTransactionClick}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Catat Transaksi Manual
            </button>

            <button
              id="dashboardExportBtn"
              onClick={handleDownloadCSV}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Unduh Rekap (Mingguan) .CSV
            </button>
          </div>
        </div>
      </div>

      {/* 4. Ledger Ledger ledger logs */}
      <div id="recentTransactionsBlock" className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Catatan Transaksi Terbaru</h3>
            <p className="text-xs text-slate-400 mt-1">Daftar arus masuk dan keluar keuangan pribadi Anda</p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-600 py-1 px-2.5 rounded-full">
            {transactions.length} Transaksi
          </span>
        </div>

        {transactions.length === 0 ? (
          <div id="emptyTransactions" className="text-center py-12 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-600">Belum ada transaksi</p>
            <p className="text-xs text-slate-400 mt-0.5">Silakan gunakan manual form atau AI scan struk untuk memulainya.</p>
          </div>
        ) : (
          <div id="ledgerTableContainer" className="overflow-x-auto">
            <table className="w-full text-left font-medium text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  <th className="pb-3 pl-3">Transaksi</th>
                  <th className="pb-3">Tanggal</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Dompet</th>
                  <th className="pb-3 text-right">Nominal</th>
                  <th className="pb-3 text-right pr-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs select-text">
                {transactions.map((tx) => {
                  const isInc = tx.type === "pemasukan";
                  const badge = getCategoryIcon(tx.category);
                  return (
                    <tr 
                      key={tx.id}
                      id={`txRow-${tx.id}`}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${badge.class} shrink-0 shadow-sm`}>
                            {badge.label}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-none">{tx.title}</p>
                            {tx.description && (
                              <p className="text-[10px] text-slate-400 mt-1 max-w-xs truncate leading-normal" title={tx.description}>
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500 font-mono font-semibold">{tx.date}</td>
                      <td className="py-3.5">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold text-[10px]">{tx.category}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="text-slate-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          {tx.wallet}
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-bold text-sm font-mono ${isInc ? "text-emerald-600" : "text-rose-600"}`}>
                        {isInc ? "+" : "-"} Rp {tx.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 text-right pr-3">
                        <button
                          id={`deleteTx-${tx.id}`}
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
