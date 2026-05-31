import { Request, Response, Router } from "express";
import { readDB, writeDB, DBUser } from "../../../server-db.js";

const router = Router();

// Cache for temporary OTP records before verification
interface PendingRegistration {
  email: string;
  passwordHash: string;
  otpCode: string;
  expiresAt: number;
}

// Memory or dynamic store
let pendingRegistrations: PendingRegistration[] = [];

/**
 * Endpoint for sending OTP as part of registration initiation
 * POST /api/auth/register/send-otp
 */
router.post("/send-otp", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email dan Password wajib diisi." });
    return;
  }

  // Cross-site scripting (XSS) input sanitization mockup/manual
  const sanitizedEmail = email.replace(/[<>'"&]/g, "").trim().toLowerCase();

  // Check if user already exists
  const db = readDB();
  const existingUser = db.users.find((u) => u.email === sanitizedEmail);
  if (existingUser && existingUser.verified) {
    res.status(400).json({ error: "Email ini sudah terdaftar." });
    return;
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store in pending registration stack
  pendingRegistrations = pendingRegistrations.filter((p) => p.email !== sanitizedEmail);
  pendingRegistrations.push({
    email: sanitizedEmail,
    passwordHash: password, // For simplicity we store submitted, but can hash
    otpCode,
    expiresAt
  });

  // Get email credentials from env with fallback
  const gmailUser = process.env.GMAIL_USER || "muhammadirfanirsyad05@gmail.com";
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || "abcd efgh ijkl mnop";
  const apiKey = process.env.EMAIL_API_KEY || "YOUR_API_KEY";

  console.log(`[AUTH REGISTRATION] Generating OTP Code ${otpCode} for ${sanitizedEmail}`);

  try {
    const emailResponse = await fetch("https://api-fix-merah.vercel.app/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: apiKey,
        to: sanitizedEmail,
        subject: "Verifikasi Registrasi Pencatatan Keuangan",
        text: `Kode OTP Anda adalah: ${otpCode}. Kode ini hanya berlaku 1x untuk pendaftaran di ASFIN.`,
        gmailUser: gmailUser,
        gmailAppPassword: gmailAppPassword
      })
    });

    const bodyText = await emailResponse.text();
    console.log("[AUTH REGISTRATION] Email REST API response status:", emailResponse.status, bodyText);

    res.json({
      success: true,
      message: "Kode OTP berhasil dikirim ke email Anda.",
      // For local development and demonstration in sandbox if email REST fails or is mock
      devOtpFallback: otpCode 
    });
  } catch (error: any) {
    console.error("[AUTH REGISTRATION] Failed to dispatch email via external REST:", error);
    res.status(500).json({
      error: "Gagal mengirimkan kode verifikasi OTP. Silakan gunakan Kode Pengembang: " + otpCode,
      devOtpFallback: otpCode
    });
  }
});

/**
 * Endpoint for verifying OTP and creating the user
 * POST /api/auth/register/verify
 */
router.post("/verify", async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ error: "Email dan Kode OTP wajib disertakan." });
    return;
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedOtp = otp.trim();

  // Find corresponding pending registration
  const record = pendingRegistrations.find(
    (p) => p.email === sanitizedEmail && p.otpCode === sanitizedOtp
  );

  if (!record) {
    res.status(400).json({ error: "Kode OTP tidak cocok atau email salah." });
    return;
  }

  if (Date.now() > record.expiresAt) {
    res.status(400).json({ error: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." });
    return;
  }

  // OTP verified! Create user in custom db
  const db = readDB();
  
  // Remove user if they were unverified, to re-create
  db.users = db.users.filter((u) => u.email !== sanitizedEmail);

  const newUser: DBUser = {
    id: "user-" + Math.random().toString(36).substring(2, 11),
    email: sanitizedEmail,
    passwordHash: record.passwordHash,
    verified: true,
    role: "user",
    dailyLimit: 500000, // Default 500,000 IDR limit
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  // Clear pending record
  pendingRegistrations = pendingRegistrations.filter((p) => p.email !== sanitizedEmail);

  // Return authenticated payload
  res.json({
    success: true,
    message: "Registrasi berhasil! Anda sekarang terverifikasi.",
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      dailyLimit: newUser.dailyLimit
    }
  });
});

export default router;
