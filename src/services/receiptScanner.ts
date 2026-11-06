import { createWorker } from 'tesseract.js';
import { scanReceiptImage } from '../api/receipts';

export interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  rawText: string;
}

const VALID_CATEGORIES = ['Ahorro', 'Comida', 'Casa', 'Gastos Varios', 'Ocio', 'Salud', 'Suscripciones'];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Comida': ['restaurant', 'cafe', 'coffee', 'mcdonald', 'starbucks', 'burger', 'pizza', 'food', 'dining', 'lunch', 'dinner', 'breakfast', 'comida', 'restaurante', 'taqueria', 'tacos'],
  'Transporte': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'toll', 'transport', 'gasolina', 'estacionamiento', 'peaje'],
  'Suscripciones': ['subscription', 'monthly', 'netflix', 'spotify', 'amazon prime', 'suscripcion', 'mensual'],
  'Salud': ['pharmacy', 'hospital', 'doctor', 'medical', 'health', 'farmacia', 'hospital', 'medico', 'salud'],
  'Casa': ['electric', 'water', 'internet', 'rent', 'utility', 'luz', 'agua', 'internet', 'renta', 'home', 'casa', 'house'],
  'Software SaaS': ['software', 'saas', 'cloud', 'hosting', 'domain', 'aws', 'google cloud', 'microsoft'],
  'Gastos Varios': ['store', 'shop', 'market', 'walmart', 'target', 'costco', 'tienda', 'supermarket'],
};

function extractAmount(text: string): number {
  const patterns = [
    /(?:total|sum|amount|grand\s*total|balance\s*due|total\s*due|total\s*amount)[:\s]*\$?([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.\d{2})\s*$/m,
    /\$\s*([\d,]+\.\d{2})/,
    /([\d,]+\.\d{2})\s*(?:usd|mxn|eur)/i,
    /(?:total|sum|amount)[:\s]*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(num) && num > 0 && num < 1000000) return num;
    }
  }

  const allNumbers = text.match(/\d+\.\d{2}/g);
  if (allNumbers && allNumbers.length > 0) {
    const amounts = allNumbers.map(n => parseFloat(n)).filter(n => n > 0 && n < 1000000);
    if (amounts.length > 0) return Math.max(...amounts);
  }

  return 0;
}

function extractMerchant(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const skipPatterns = /^\d|^total|^sum|^amount|^tax|^tip|^change|^cash|^credit|^debit|^visa|^master|^date|^time|^receipt|^inv|^order|^#\s*\d/i;

  for (const line of lines.slice(0, 5)) {
    if (line.length < 3 || line.length > 60) continue;
    if (skipPatterns.test(line)) continue;
    if (/^\$/.test(line)) continue;
    if (/^\d+\.\d{2}$/.test(line)) continue;
    return line.replace(/[^\w\s&'.,-]/g, '').trim();
  }

  return lines[0]?.replace(/[^\w\s&'.,-]/g, '').trim() || 'Unknown Merchant';
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  let bestCategory = 'Gastos Varios';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return VALID_CATEGORIES.includes(bestCategory) ? bestCategory : 'Gastos Varios';
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function scanWithAI(file: File): Promise<ReceiptData> {
  const imageUrl = await fileToDataUrl(file);
  const result = await scanReceiptImage(imageUrl);

  return {
    merchant: result.merchant,
    amount: result.amount,
    date: new Date().toISOString().split('T')[0],
    category: result.category,
    rawText: '',
  };
}

async function scanWithOCR(file: File): Promise<ReceiptData> {
  const worker = await createWorker('eng');

  try {
    const { data } = await worker.recognize(file);
    const rawText = data.text;

    const merchant = extractMerchant(rawText);
    const amount = extractAmount(rawText);
    const category = detectCategory(rawText);

    return {
      merchant,
      amount,
      date: new Date().toISOString().split('T')[0],
      category,
      rawText,
    };
  } finally {
    await worker.terminate();
  }
}

export async function scanReceipt(file: File): Promise<ReceiptData> {
  try {
    return await scanWithAI(file);
  } catch (error) {
    console.error('AI receipt scan failed, falling back to OCR:', error);
  }
  return scanWithOCR(file);
}
