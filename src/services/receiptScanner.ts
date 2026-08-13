import { createWorker } from 'tesseract.js';

export interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  rawText: string;
}

const ABACUS_AI_URL = (import.meta.env.VITE_ABACUS_AI_URL as string) || 'https://routellm.abacus.ai/v1';
const ABACUS_AI_RAW_KEY = (import.meta.env.VITE_ABACUS_AI_KEY as string | undefined)?.trim() || '';
const ABACUS_AI_KEY = ABACUS_AI_RAW_KEY && !ABACUS_AI_RAW_KEY.startsWith('YOUR_') ? ABACUS_AI_RAW_KEY : undefined;
const ABACUS_AI_MODEL = (import.meta.env.VITE_ABACUS_AI_MODEL as string) || 'route-llm';

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

function parseAIJson(content: string): Record<string, unknown> {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    const obj = JSON.parse(cleaned);
    return obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : {};
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return {};
      }
    }
  }
  return {};
}

function closestCategory(raw: string): string {
  const lower = raw.toLowerCase();
  const exact = VALID_CATEGORIES.find(c => c.toLowerCase() === lower);
  if (exact) return exact;
  const partial = VALID_CATEGORIES.find(c => lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower));
  if (partial) return partial;
  return 'Gastos Varios';
}

async function scanWithAI(file: File): Promise<ReceiptData> {
  if (!ABACUS_AI_KEY) throw new Error('Missing Abacus AI key');

  const imageUrl = await fileToDataUrl(file);

  const response = await fetch(`${ABACUS_AI_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ABACUS_AI_KEY}`,
    },
    body: JSON.stringify({
      model: ABACUS_AI_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a receipt analyzer. Look at the receipt image and extract the purchase information.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{"merchant": "store name", "amount": 12.5, "category": "one of the categories"}

Rules:
- merchant: the store/merchant name shown on the receipt
- amount: the total amount spent, as a number
- category: exactly one of: ${VALID_CATEGORIES.join(', ')}`,
            },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Abacus AI request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  const parsed = parseAIJson(content);

  const merchant = String(parsed.merchant ?? '').trim();
  const rawAmount = Number(parsed.amount);
  const amount = isNaN(rawAmount) || rawAmount <= 0 ? 0 : rawAmount;
  const category = closestCategory(String(parsed.category ?? '').trim());

  return {
    merchant,
    amount,
    date: new Date().toISOString().split('T')[0],
    category,
    rawText: content,
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
  if (ABACUS_AI_KEY) {
    try {
      return await scanWithAI(file);
    } catch (error) {
      console.error('AI receipt scan failed, falling back to OCR:', error);
    }
  }
  return scanWithOCR(file);
}
