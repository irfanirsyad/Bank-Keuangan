import { GoogleGenAI, Type } from "@google/genai";

export interface ExtractedReceipt {
  date: string;
  title: string;
  amount: number;
  category: string;
  description: string;
}

/**
 * Analyzes receipt image using Gemini AI Model
 * @param base64Image Base64 string of the receipt (with or without data:image prefix)
 * @param customApiKey Optional Custom API Key configured via Admin Dashboard Settings
 */
export async function analyzeReceipt(base64Image: string, customApiKey?: string): Promise<ExtractedReceipt> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("Gemini API Key is not configured. Please set GEMINI_API_KEY in Settings or your environment variable.");
  }

  // Clean base64 pattern
  let mimeType = "image/jpeg";
  let cleanBase64 = base64Image;
  
  if (base64Image.startsWith("data:")) {
    const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      cleanBase64 = match[2];
    }
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const prompt = `Analisis struk belanja ini. Ekstrak data berikut dan kembalikan dalam format JSON terstruktur:
1. date (Tanggal transaksi dalam format YYYY-MM-DD. Jika tidak terlihat, gunakan tanggal hari ini: 2026-05-31)
2. title (Nama toko / merchant, perbaiki ejaan agar rapi, contoh: 'Indomaret', 'Kopi Kenangan')
3. amount (Nominal total pembayaran akhir sebagai angka bulat murni, bersihkan karakter Rp atau titik ribuan)
4. category (Kategori yang paling cocok: Gaji, Saku Sekolah, Makanan, Hiburan, Tagihan, Belanja, Transportasi, atau Lainnya)
5. description (Deskripsi singkat berisi item-item yang dibeli)
SANGAT PENTING: Kembalikan JSON yang valid dan bersih.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64
          }
        },
        prompt
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: {
              type: Type.STRING,
              description: "Format transaksi YYYY-MM-DD"
            },
            title: {
              type: Type.STRING,
              description: "Nama merchant atau tempat pembelian"
            },
            amount: {
              type: Type.NUMBER,
              description: "Total harga belanjaan sebagai angka"
            },
            category: {
              type: Type.STRING,
              description: "Kategori transaksi"
            },
            description: {
              type: Type.STRING,
              description: "Ringkasan barang-barang yang dibeli"
            }
          },
          required: ["date", "title", "amount", "category", "description"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("Gemini AI did not return any text response.");
    }

    const parsed: ExtractedReceipt = JSON.parse(textResult.trim());
    return parsed;
  } catch (err: any) {
    console.error("Gemini receipt analysis crash:", err);
    throw new Error(err.message || "Gagal menganalisis struk belanja menggunakan Gemini AI.");
  }
}
