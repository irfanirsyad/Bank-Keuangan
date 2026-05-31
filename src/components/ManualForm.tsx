import React, { useState } from "react";
import { PlusCircle, X, Check, AlertTriangle, Wallet } from "lucide-react";

interface ManualFormProps {
  userId: string;
  onSuccess: (newTx: any, warningMessage?: string) => void;
  onClose: () => void;
  initialData?: {
    type?: 'pemasukan' | 'pengeluaran';
    date?: string;
    title?: string;
    category?: string;
    amount?: number;
    description?: string;
  };
}

export default function ManualForm({ userId, onSuccess, onClose, initialData }: ManualFormProps) {
  const [type, setType] = useState<'pemasukan' | 'pengeluaran'>(initialData?.type || "pengeluaran");
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [amount, setAmount] = useState(initialData?.amount ? initialData.amount.toString() : "");
  const [wallet, setWallet] = useState<'Dana' | 'Cash' | 'Bank'>("Dana");
  const [description, setDescription] = useState(initialData?.description || "");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleWalletSelect = (chosen: 'Dana' | 'Cash' | 'Bank') => {
    setWallet(chosen);
  };

  const handleTypeSelect = (chosen: 'pemasukan' | 'pengeluaran') => {
    setType(chosen);
    setCategory(""); // Reset category when type toggled to match dropdown options
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Mohon masukkan judul transaksi.");
      return;
    }
    if (!category) {
      setErrorMsg("Mohon pilih kategori transaksi.");
      return;
    }
    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg("Mohon masukkan nominal angka yang valid dan positif.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type,
          date,
          title,
          category,
          amount: val,
          wallet,
          description
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mencatatkan transaksi.");
      }

      onSuccess(data.transaction, data.warning || undefined);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pre-configured dynamic lists from rules
  const incomeCategories = ["Gaji", "Saku Sekolah", "Investasi", "Hadiah", "Freelance", "Lainnya"];
  const expenseCategories = ["Makanan", "Hiburan", "Tagihan", "Belanja", "Transportasi", "Kesehatan", "Pendidikan", "Lainnya"];

  const categoriesToRender = type === "pemasukan" ? incomeCategories : expenseCategories;

  return (
    <div id="manualFormModal" className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        id="manualFormContainer"
        className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_30px_70px_rgba(15,23,42,0.12)] overflow-hidden border border-white/80 flex flex-col"
      >
        {/* Header Block with Toggles */}
        <div id="formHeader" className="bg-blue-50/50 px-6 py-5 border-b border-blue-100/35 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              {initialData ? "Review Hasil Scan AI" : "Catat Transaksi Manual"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Masukkan rincian data cash flow harian Anda</p>
          </div>
          <button 
            id="closeFormBtn"
            onClick={onClose}
            className="p-2 hover:bg-slate-200/60 rounded-full transition-colors text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="transactionEntries" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div id="formError" className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-center gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Transaction Type Choice Toggles */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="typePemasukan"
                type="button"
                onClick={() => handleTypeSelect("pemasukan")}
                className={`py-3 rounded-2xl font-bold text-sm tracking-wide border transition-all ${
                  type === "pemasukan"
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Pemasukan (+)
              </button>
              <button
                id="typePengeluaran"
                type="button"
                onClick={() => handleTypeSelect("pengeluaran")}
                className={`py-3 rounded-2xl font-bold text-sm tracking-wide border transition-all ${
                  type === "pengeluaran"
                    ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-100"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Pengeluaran (-)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Tanggal</label>
              <input
                id="txDate"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-3 px-4 text-sm outline-none transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Kategori</label>
              <select
                id="txCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-3 px-4 text-sm text-slate-700 outline-none transition-all"
              >
                <option value="">Pilih Kategori...</option>
                {categoriesToRender.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title Inputs */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Judul Transaksi</label>
            <input
              id="txTitle"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gaji Pokok Tambahan, Kopi Sore, Tiket Liburan"
              className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-3.5 px-4 text-sm outline-none transition-all font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nominal Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Jumlah Nominal (Rp)</label>
              <input
                id="txAmount"
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:font-normal"
              />
            </div>

            {/* Wallet Selector Toggles */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Dompet</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
                {(["Dana", "Cash", "Bank"] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleWalletSelect(w)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      wallet === w
                        ? "bg-white text-sky-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional description textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Deskripsi (Opsional)</label>
            <textarea
              id="txDescription"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Berikan informasi tambahan jika diperlukan..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-3.5 px-4 text-sm outline-none transition-all resize-none text-slate-700"
            />
          </div>

          {/* Save trigger buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              id="cancelBtn"
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors outline-none"
            >
              Batal
            </button>
            <button
              id="saveBtn"
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
