import type { FixedExpense } from '../types'

export interface PaidFixedSummary {
  total: number
  count: number
  byCategory: Map<string, { total: number; count: number }>
  byDay: Map<number, { total: number; count: number }>
}

export function isCurrentMonth(month: number, year: number): boolean {
  const now = new Date()
  return now.getMonth() + 1 === month && now.getFullYear() === year
}

function alreadyRecorded(fixed: FixedExpense, recorded: { templateId?: string; name: string }[]) {
  return recorded.some((expense) => expense.templateId === fixed.templateId && expense.name === fixed.name)
}

export function summarizePaidFixed(
  fixedExpenses: FixedExpense[],
  recordedExpenses: { templateId?: string; name: string }[] = [],
): PaidFixedSummary {
  const summary: PaidFixedSummary = { total: 0, count: 0, byCategory: new Map(), byDay: new Map() }

  for (const f of fixedExpenses) {
    if (f.status !== 'paid' && f.status !== 'partial') continue
    if (alreadyRecorded(f, recordedExpenses)) continue
    const paid = f.status === 'partial' ? (f.partialAmount ?? f.amount) : f.amount

    summary.total += paid
    summary.count += 1

    const cat = summary.byCategory.get(f.categoryId) ?? { total: 0, count: 0 }
    cat.total += paid
    cat.count += 1
    summary.byCategory.set(f.categoryId, cat)

    if (f.dueDay) {
      const day = summary.byDay.get(f.dueDay) ?? { total: 0, count: 0 }
      day.total += paid
      day.count += 1
      summary.byDay.set(f.dueDay, day)
    }
  }

  return summary
}
