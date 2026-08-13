import type { ExpenseResponse } from '../api/expenses'
import type { FixedExpense } from '../types'

export interface TransactionRow {
  id: string
  name: string
  amount: number
  category: string
  date: string
  status?: string
  isFixed: boolean
}

export function buildTransactions(
  expenses: ExpenseResponse[],
  fixedExpenses: FixedExpense[],
  month: number,
  year: number,
): TransactionRow[] {
  const rows: TransactionRow[] = expenses.map((e) => ({
    id: e.id,
    name: e.name,
    amount: e.amount,
    category: e.category,
    date: e.date,
    status: e.status,
    isFixed: false,
  }))

  fixedExpenses.forEach((f) => {
    if (f.status !== 'paid' && f.status !== 'partial') return
    if (!f.dueDay) return
    const paid = f.status === 'partial' ? (f.partialAmount ?? f.amount) : f.amount
    const date = `${year}-${String(month).padStart(2, '0')}-${String(f.dueDay).padStart(2, '0')}`
    rows.push({
      id: f.id,
      name: f.name,
      amount: paid,
      category: f.categoryId,
      date,
      status: f.status,
      isFixed: true,
    })
  })

  return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
