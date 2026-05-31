import React, { useState, useRef } from "react";
import { Camera, FileText, Upload, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface ReceiptScannerProps {
  onScanComplete: (data: {
    type: 'pemasukan' | 'pengeluaran';
    title: string;
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => void;
  onToast: (msg: string, type: 'success' | 'warn' | 'info') => void;
}

export default function ReceiptScanner({ onScanComplete, onToast }: ReceiptScannerProps) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Format berkas tidak didukung. Mohon hanya pilih file gambar struk (.png, .jpg, .jpeg)");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const base64Str = await convertToBase64(file);
      
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64Str })
      });
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Gagal memindai struk.");
      }

      // Scanner Analyzed success! Trigger prefill form
      onToast("Foto berhasil dianalisis", "success");
      
      onScanComplete({
        type: "pengeluaran", // Struk is usually expense (pengeluaran)
        title: resData.data.title,
        amount: resData.data.amount,
        category: resData.data.category,
        description: resData.data.description,
        date: resData.data.date
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memproses gambar. Pastikan API key dikonfigurasi.");
      onToast("AI Scan Gagal: " + (err.message || "Koneksi terputus"), "warn");
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Pre-load demo receipt strings to test the Gemini scanner if the user doesn't have an immediate receipt image on hand
  const handleQuickDemoScan = async () => {
    setLoading(true);
    setErrorMsg("");
    onToast("Memulai demo auto-scanning ...", "info");

    try {
      // Small transparent mock pixel base64 to hit the server route with valid format
      const base64Str = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64Str })
      });
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error);
      }

      onToast("Foto berhasil dianalisis", "success");
      onScanComplete({
        type: "pengeluaran",
        title: resData.data.title,
        amount: resData.data.amount,
        category: resData.data.category,
        description: resData.data.description,
        date: resData.data.date
      });
    } catch (err: any) {
      // In case no Gemini API key, pre-populate demo values so the feature stands out and works out of the box
      console.log("Demo simulation scan loaded due to missing credentials:", err);
      setTimeout(() => {
        onToast("Foto berhasil dianalisis (Demo Mode)", "success");
        onScanComplete({
          type: "pengeluaran",
          title: "Warung Kopi Kenangan Blok M",
          amount: 45000,
          category: "Makanan",
          description: "1x Kopi Susu Gula Aren, 1x Croissant Coklat",
          date: new Date().toISOString().split("T")[0]
        });
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div 
      id="receiptScannerCard"
      className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl p-6 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            Pindai Struk Belanja (Gemini AI)
          </h3>
          <p className="text-xs text-slate-400 mt-1">Unggah struk untuk penginputan otomatis bertenaga AI</p>
        </div>
      </div>

      {errorMsg && (
        <div id="scanError" className="bg-amber-50/80 border border-amber-200/60 text-amber-800 p-3.5 rounded-2xl text-xs mb-4 flex items-start gap-2 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Target scanning drop zone */}
      <div 
        id="dropZone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`flex-1 min-h-[180px] rounded-[22px] border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all relative overflow-hidden ${
          dragActive 
            ? "border-blue-500 bg-blue-50/50" 
            : "border-slate-300/60 hover:border-blue-400 hover:bg-slate-100/25"
        }`}
      >
        <input 
          id="scannerFileInput"
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {loading ? (
          <div id="scanningState" className="flex flex-col items-center select-none z-10">
            {/* Animated sweep line simulating radar */}
            <div className="w-16 h-16 rounded-full bg-cyan-100/60 flex items-center justify-center text-cyan-600 relative overflow-hidden animate-pulse">
              <Camera className="w-8 h-8" />
              <div className="absolute top-0 left-0 w-full h-[3px] bg-sky-500 animate-[bounce_1.5s_infinite] shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-4">Gemini AI sedang membaca struk...</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs px-4">Translasi gambar ke nominal, merchant, kategori, dan deskripsi</p>
          </div>
        ) : (
          <div id="idleState" className="flex flex-col items-center select-none z-10 group">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-700">Tarik & Lepas gambar struk belanja</p>
            <p className="text-xs text-slate-400 mt-1">atau klik untuk menelusuri galeri/file</p>
            <span className="text-[10px] text-sky-600/80 bg-sky-50 py-1 px-2.5 rounded-full mt-3 font-semibold">Mendukung JPEG, PNG</span>
          </div>
        )}

        {/* Ambient pulse background logic during loading */}
        {loading && (
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-50/20 via-transparent to-sky-50/20 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Quick Demo Assist Button */}
      <div className="mt-4 pt-3 border-t border-slate-100/80 flex justify-between items-center gap-3">
        <span className="text-[10px] text-slate-500 font-medium">Braket deteksi struk otomatis</span>
        <button
          id="demoScanBtn"
          type="button"
          onClick={handleQuickDemoScan}
          disabled={loading}
          className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          Gunakan Struk Contoh
        </button>
      </div>
    </div>
  );
}
