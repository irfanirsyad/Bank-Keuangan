import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'database.json');

export interface DBUser {
  id: string;
  email: string;
  passwordHash: string; // Stored securely
  verified: boolean;
  role: 'user' | 'admin';
  dailyLimit: number;
  otpCode?: string;
  otpExpires?: number;
  createdAt: string;
}

export interface DBTransaction {
  id: string;
  userId: string;
  type: 'pemasukan' | 'pengeluaran';
  date: string; // YYYY-MM-DD
  title: string;
  category: string;
  amount: number;
  wallet: 'Dana' | 'Cash' | 'Bank';
  description?: string;
  createdAt: string;
}

export interface DBSchema {
  users: DBUser[];
  transactions: DBTransaction[];
  settings: {
    announcement: string;
    heroImage: string;
    platformText: string;
    geminiApiKeySecured: string;
  };
}

const DEFAULT_SETTINGS = {
  announcement: "Pemberitahuan: Pemindaian struk berbasis AI dengan Gemini 3.5 Flash sudah aktif secara penuh!",
  heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6SuQjjsnP_YyM-waF2k0rTWLwCxVlxMjexHb9SVTQ6H0oiRZ2xBbopkJDpUnVLCvm_tqlDUNZ2ENVM_YgR16DsUN4OVq0ylsHGg5Rg24c1EfAFN9JwWgeD9welaWVrVnO4XzepqjYBMS_dJjLsoMN6HnGSXzJyMDJDjdEs3P8pHW1X2RBv45UCJ6bzyGqz2SHxg5Lvmu6D-BjGDAeAfkALyXR1P_LpJFhK4a-SVBiJ7eZUYN4RWGnMcEHLqGgG9yYZaHiphlxp8s",
  platformText: "Revolusi Keuangan Dimulai dari ASFIN. Mengelola pengeluaran dan pemasukan dengan kecerdasan bertenaga AI.",
  geminiApiKeySecured: process.env.GEMINI_API_KEY || "MY_GEMINI_API_KEY"
};

const DEFAULT_USERS: DBUser[] = [
  {
    id: "admin-uid-1111",
    email: "admin@asfin.com",
    passwordHash: "admin123", // Simple plain or MD5 hash for demo, here simple matches
    verified: true,
    role: "admin",
    dailyLimit: 2000000,
    createdAt: new Date("2026-05-15T00:00:00Z").toISOString()
  },
  {
    id: "user-uid-2222",
    email: "user@asfin.com",
    passwordHash: "user123",
    verified: true,
    role: "user",
    dailyLimit: 500000,
    createdAt: new Date("2026-05-20T00:00:00Z").toISOString()
  }
];

const DEFAULT_TRANSACTIONS: DBTransaction[] = [
  {
    id: "tx-1",
    userId: "user-uid-2222",
    type: "pemasukan",
    date: "2026-05-25",
    title: "Gaji Bulanan Utama",
    category: "Gaji",
    amount: 8500000,
    wallet: "Bank",
    description: "Transfer gaji Mei dari kantor pusat.",
    createdAt: new Date("2026-05-25T08:00:00Z").toISOString()
  },
  {
    id: "tx-2",
    userId: "user-uid-2222",
    type: "pengeluaran",
    date: "2026-05-26",
    title: "Makan Siang & Kopi",
    category: "Makan",
    amount: 120000,
    wallet: "Dana",
    description: "Kopi Kenangan & Nasi Padang.",
    createdAt: new Date("2026-05-26T12:30:00Z").toISOString()
  },
  {
    id: "tx-3",
    userId: "user-uid-2222",
    type: "pengeluaran",
    date: "2026-05-27",
    title: "Tagihan Listrik PLN",
    category: "Tagihan",
    amount: 250000,
    wallet: "Bank",
    description: "Pembayaran token bulanan.",
    createdAt: new Date("2026-05-27T10:00:00Z").toISOString()
  },
  {
    id: "tx-4",
    userId: "user-uid-2222",
    type: "pengeluaran",
    date: "2026-05-28",
    title: "Nonton Bioskop IMAX",
    category: "Hiburan",
    amount: 85000,
    wallet: "Cash",
    description: "Weekend movie tiket.",
    createdAt: new Date("2026-05-28T19:45:00Z").toISOString()
  },
  {
    id: "tx-5",
    userId: "user-uid-2222",
    type: "pemasukan",
    date: "2026-05-29",
    title: "Hasil Jual Barang Bekas",
    category: "Lainnya",
    amount: 350000,
    wallet: "Cash",
    description: "COD monitor rusak.",
    createdAt: new Date("2026-05-29T14:20:00Z").toISOString()
  },
  {
    id: "tx-6",
    userId: "user-uid-2222",
    type: "pengeluaran",
    date: "2026-05-30",
    title: "Bensin Motor Bulanan",
    category: "Transportasi",
    amount: 150000,
    wallet: "Dana",
    description: "Pertamax Pertamina.",
    createdAt: new Date("2026-05-30T16:00:00Z").toISOString()
  },
  {
    id: "tx-7",
    userId: "user-uid-2222",
    type: "pengeluaran",
    date: "2026-05-31", // Current local date
    title: "Grosir Sembako Mingguan",
    category: "Belanja",
    amount: 350000,
    wallet: "Dana",
    description: "Belanja beras, minyak, dan telur di Indomaret.",
    createdAt: new Date("2026-05-31T07:49:00Z").toISOString()
  }
];

export function readDB(): DBSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DBSchema = {
        users: DEFAULT_USERS,
        transactions: DEFAULT_TRANSACTIONS,
        settings: DEFAULT_SETTINGS
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as DBSchema;
  } catch (err) {
    console.error("Error reading database file", err);
    return {
      users: DEFAULT_USERS,
      transactions: DEFAULT_TRANSACTIONS,
      settings: DEFAULT_SETTINGS
    };
  }
}

export function writeDB(data: DBSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
}
