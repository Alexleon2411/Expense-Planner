export type BudgetLevel = 'none' | 'ok' | 'near' | 'over'

export function budgetLevel(spent: number, budget: number): BudgetLevel {
  if (budget <= 0) return 'none'
  const pct = (spent / budget) * 100
  if (pct >= 100) return 'over'
  if (pct >= 90) return 'near'
  return 'ok'
}

export const BUDGET_STATUS = {
  none: { tone: 'neutral', icon: 'remove', label: 'reportsPage.status.noBudget' },
  ok: { tone: 'success', icon: 'check_circle', label: 'reportsPage.status.inBudget' },
  near: { tone: 'warning', icon: 'warning', label: 'reportsPage.status.nearLimit' },
  over: { tone: 'danger', icon: 'error', label: 'reportsPage.status.exceeded' },
} as const
