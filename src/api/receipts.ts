import api from './axios';

export interface ScannedReceipt {
  merchant: string;
  amount: number;
  category: string;
}

export async function scanReceiptImage(imageDataUrl: string) {
  const { data } = await api.post<ScannedReceipt>('/receipts/scan', { image: imageDataUrl });
  return data;
}
