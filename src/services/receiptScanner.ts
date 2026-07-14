import { createWorker } from 'tesseract.js';

export interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  rawText: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Comida': ['restaurant', 'cafe', 'coffee', 'mcdonald', 'starbucks', 'burger', 'pizza', 'food', 'dining', 'lunch', 'dinner', 'breakfast', 'comida', 'restaurante', 'taqueria', 'tacos'],
  'Transporte': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'toll', 'transport', 'gasolina', 'estacionamiento', 'peaje'],
  'Suscripciones': ['subscription', 'monthly', 'netflix', 'spotify', 'amazon prime', 'suscripcion', 'mensual'],
  'Salud': ['pharmacy', 'hospital', 'doctor', 'medical', 'health', 'farmacia', 'hospital', 'medico', 'salud'],
  'Housing & Utilities': ['electric', 'water', 'internet', 'rent', 'utility', 'luz', 'agua', 'internet', 'renta'],
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

function extractDate(text: string): string {
  const patterns = [
    { regex: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, handler: (m: RegExpMatchArray) => `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` },
    { regex: /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, handler: (m: RegExpMatchArray) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` },
    { regex: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s+(\d{1,2}),?\s+(\d{4})/i, handler: (m: RegExpMatchArray) => {
      const months: Record<string, string> = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
      return `${m[3]}-${months[m[1].toLowerCase().slice(0, 3)]}-${m[2].padStart(2, '0')}`;
    }},
    { regex: /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s+(\d{4})/i, handler: (m: RegExpMatchArray) => {
      const months: Record<string, string> = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
      return `${m[3]}-${months[m[2].toLowerCase().slice(0, 3)]}-${m[1].padStart(2, '0')}`;
    }},
  ];

  for (const { regex, handler } of patterns) {
    const match = text.match(regex);
    if (match) {
      const dateStr = handler(match);
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return dateStr;
    }
  }

  return new Date().toISOString().split('T')[0];
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

  return bestCategory;
}

export async function scanReceipt(file: File): Promise<ReceiptData> {
  const worker = await createWorker('eng');

  try {
    const { data } = await worker.recognize(file);
    const rawText = data.text;

    const merchant = extractMerchant(rawText);
    const amount = extractAmount(rawText);
    const date = extractDate(rawText);
    const category = detectCategory(rawText);

    return { merchant, amount, date, category, rawText };
  } finally {
    await worker.terminate();
  }
}
