export type Expense = {
  id: string
  expenseName: string
  amount: number
  category: string
  date: Value
  comment?: string
  status?: 'pending' | 'paid' | 'partial'
  partialAmount?: number
}

export type DraftExpense = Omit<Expense, 'id'>

type ValuePiece = Date | null;
export type Value = ValuePiece | [ValuePiece, ValuePiece];

export type Category = {
  id: string
  name: string
  icon: string
  color?: string
}

export type PaymentRecord = {
  month: string
  paid: boolean
  paidDate?: string
  templateItemId?: string
}

export type FixedExpense = {
  id: string
  templateId: string
  name: string
  amount: number
  category: string
  categoryId: string
  dueDay: number | null
  icon: string
  status: 'pending' | 'paid' | 'partial'
  lastPaidDate?: string
  history: PaymentRecord[]
  comment?: string
  partialAmount?: number
}
