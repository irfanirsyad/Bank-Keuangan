export interface User {
  id: string;
  email: string;
  verified: boolean;
  role: 'user' | 'admin';
  dailyLimit: number;
  createdAt: string;
}

export interface Transaction {
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

export interface AppSettings {
  geminiApiKey: string;
  announcement: string;
  heroImage: string;
  platformText: string;
}

export interface OTPRecord {
  email: string;
  code: string;
  expiresAt: number;
}
