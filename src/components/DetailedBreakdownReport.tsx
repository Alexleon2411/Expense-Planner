import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { statsApi, expensesApi } from '../api'
import type { OverviewResponse, CategoryBreakdown, DailyData } from '../api/stats'
import type { ExpenseResponse } from '../api/expenses'
import { useCategories } from '../hooks/useCategories'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { isCurrentMonth, summarizePaidFixed } from '../helpers/fixedExpensesStats'
import type { PaidFixedSummary } from '../helpers/fixedExpensesStats'
import { formatCurrecy } from '../helpers'
import CategoryIcon from './CategoryIcon'
import AllTransactions from './AllTransactions'
import { buildTransactions } from '../helpers/transactions'

const MONTHS_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

interface DetailedBreakdownReportProps {
  isOpen: boolean
  onClose: () => void
  month: number
  year: number
}

const emptyPaidFixed = (): PaidFixedSummary => ({
  total: 0,
  count: 0,
  byCategory: new Map(),
  byDay: new Map(),
})

export default function DetailedBreakdownReport({ isOpen, onClose, month, year }: DetailedBreakdownReportProps) {
  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  const { categories } = useCategories()
  const { fixedExpenses } = useFixedExpenses()

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setExpandedDay(null)
    Promise.all([
      statsApi.getOverview(month, year),
      statsApi.getCategoryBreakdown(month, year),
      statsApi.getDailyStats(year, month),
      expensesApi.listExpenses({ month, year, page: 1, limit: 500 }),
    ])
      .then(([ov, cat, daily, exp]) => {
        setOverview(ov)
        setCategoryBreakdown(cat)
        setDailyData(daily)
        setExpenses(exp.expenses)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, month, year])

  const paidFixed = useMemo(() => {
    return isCurrentMonth(month, year) ? summarizePaidFixed(fixedExpenses) : emptyPaidFixed()
  }, [fixedExpenses, month, year])

  const getCategoryInfo = (categoryId: string) => categories.find((c) => c.id === categoryId)

  const totalSpent = (overview?.totalSpent ?? 0) + paidFixed.total
  const totalCount = (overview?.totalExpenses ?? 0) + paidFixed.count
  const budgeted = overview?.budgeted ?? 0
  const budgetPct = budgeted > 0 ? Math.round((totalSpent / budgeted) * 100) : 0

  const mergedCategories = useMemo(() => {
    const map = new Map<string, CategoryBreakdown>()
    categoryBreakdown.forEach((c) => map.set(c.category, { ...c }))
    paidFixed.byCategory.forEach((v, categoryId) => {
      const cur = map.get(categoryId) ?? { category: categoryId, total: 0, count: 0 }
      cur.total += v.total
      cur.count += v.count
      map.set(categoryId, cur)
    })
    return [...map.values()]
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [categoryBreakdown, paidFixed])

  const maxCategoryTotal = mergedCategories.length > 0 ? mergedCategories[0].total : 1

  const dayRows = useMemo(() => {
    const map = new Map<number, { total: number; count: number }>()
    dailyData.forEach((d) => map.set(d.day, { total: d.total, count: d.count }))
    paidFixed.byDay.forEach((v, day) => {
      const cur = map.get(day) ?? { total: 0, count: 0 }
      cur.total += v.total
      cur.count += v.count
      map.set(day, cur)
    })
    return [...map.entries()]
      .map(([day, value]) => ({ day, ...value }))
      .sort((a, b) => a.day - b.day)
  }, [dailyData, paidFixed])

  const expensesForDay = (day: number) => {
    const regular = dailyData.find((d) => d.day === day)?.expenses ?? []
    const fixed = fixedExpenses.filter((f) => f.dueDay === day && (f.status === 'paid' || f.status === 'partial'))
    return [
      ...regular.map((e) => ({
        key: `${e.name}-${e.amount}`,
        name: e.name,
        amount: e.amount,
        category: e.category,
        isFixed: false,
      })),
      ...fixed.map((f) => ({
        key: f.id,
        name: f.name,
        amount: f.status === 'partial' ? (f.partialAmount ?? f.amount) : f.amount,
        category: f.categoryId,
        isFixed: true,
      })),
    ]
  }

  const transactions = useMemo(
    () => buildTransactions(expenses, fixedExpenses, month, year),
    [expenses, fixedExpenses, month, year],
  )

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[300]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-surface shadow-xl transition-all flex flex-col max-h-[90vh] text-left">
                <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant bg-surface-container-low">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary">bar_chart</span>
                    <div>
                      <h2 className="text-headline-md font-bold text-on-surface">Detailed Breakdown Report</h2>
                      <p className="text-body-sm text-on-surface-variant">{MONTHS_LONG[month - 1]} {year}</p>
                    </div>
                  </div>
                  <button
                    className="p-xs hover:bg-surface-container rounded-full transition-colors"
                    onClick={onClose}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-lg space-y-gutter">
                  {loading ? (
                    <div className="flex items-center justify-center py-24">
                      <p className="text-body-lg text-on-surface-variant">Loading breakdown report...</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
                        <div className="bg-surface-container-low rounded-xl p-md">
                          <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">TOTAL SPENT</p>
                          <p className="text-headline-md font-bold text-primary font-data-mono">{formatCurrecy(totalSpent)}</p>
                        </div>
                        <div className="bg-surface-container-low rounded-xl p-md">
                          <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">TRANSACTIONS</p>
                          <p className="text-headline-md font-bold text-on-surface font-data-mono">{totalCount}</p>
                          <p className="text-body-sm text-on-surface-variant">in {mergedCategories.length} categor{mergedCategories.length === 1 ? 'y' : 'ies'}</p>
                        </div>
                        <div className="bg-surface-container-low rounded-xl p-md">
                          <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">BUDGET UTILIZATION</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-headline-md font-bold text-on-surface font-data-mono">{budgetPct}%</p>
                            <span className="text-body-sm text-on-surface-variant">of {formatCurrecy(budgeted)}</span>
                          </div>
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="bg-primary h-full" style={{ width: `${Math.min(budgetPct, 100)}%` }}></div>
                          </div>
                        </div>
                        <div className="bg-surface-container-low rounded-xl p-md">
                          <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">AVG PER TRANSACTION</p>
                          <p className="text-headline-md font-bold text-secondary font-data-mono">
                            {totalCount > 0 ? formatCurrecy(totalSpent / totalCount) : formatCurrecy(0)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-gutter">
                        <div className="col-span-12 lg:col-span-5 bento-card">
                          <div className="flex justify-between items-center mb-lg">
                            <p className="text-label-caps font-label-caps text-on-surface-variant">BREAKDOWN BY CATEGORY</p>
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">donut_small</span>
                          </div>
                          <div className="space-y-sm max-h-[320px] overflow-y-auto custom-scrollbar pr-xs">
                            {mergedCategories.map((cat) => {
                              const info = getCategoryInfo(cat.category)
                              const share = totalSpent > 0 ? ((cat.total / totalSpent) * 100).toFixed(1) : '0.0'
                              return (
                                <div key={cat.category} className="py-sm border-b border-outline-variant/40 last:border-0">
                                  <div className="flex items-center gap-md">
                                    <CategoryIcon icon={info?.icon} color={info?.color} name={info?.name || cat.category} size="sm" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-baseline gap-sm">
                                        <p className="text-body-sm font-medium truncate">{info?.name || cat.category}</p>
                                        <span className="text-body-sm font-data-mono">{formatCurrecy(cat.total)}</span>
                                      </div>
                                      <div className="flex items-center gap-md mt-xs">
                                        <div className="flex-1 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-primary h-full" style={{ width: `${(cat.total / maxCategoryTotal) * 100}%` }}></div>
                                        </div>
                                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                                          {cat.count} item{cat.count === 1 ? '' : 's'} &middot; {share}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                            {mergedCategories.length === 0 && (
                              <p className="text-body-sm text-on-surface-variant text-center py-6">No expense data for this period.</p>
                            )}
                          </div>
                        </div>

                        <div className="col-span-12 lg:col-span-7 bento-card">
                          <div className="flex justify-between items-center mb-lg">
                            <p className="text-label-caps font-label-caps text-on-surface-variant">BREAKDOWN BY DAY</p>
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">calendar_month</span>
                          </div>
                          <div className="max-h-[320px] overflow-y-auto custom-scrollbar pr-xs">
                            {dayRows.map((row) => {
                              const dayExpenses = expensesForDay(row.day)
                              const isExpanded = expandedDay === row.day
                              return (
                                <div key={row.day} className="border-b border-outline-variant/40 last:border-0">
                                  <button
                                    className="w-full flex items-center gap-md py-sm rounded-lg hover:bg-surface-container-low px-xs transition-colors"
                                    onClick={() => setExpandedDay(isExpanded ? null : row.day)}
                                  >
                                    <span className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                                      <span className="text-body-sm font-bold text-on-surface">{row.day}</span>
                                    </span>
                                    <div className="flex-1 text-left min-w-0">
                                      <p className="text-body-sm font-medium">Day {row.day}</p>
                                      <p className="text-[11px] text-on-surface-variant">{row.count} transaction{row.count === 1 ? '' : 's'}</p>
                                    </div>
                                    <span className="text-body-sm font-data-mono font-semibold">{formatCurrecy(row.total)}</span>
                                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                                      {isExpanded ? 'expand_less' : 'expand_more'}
                                    </span>
                                  </button>
                                  {isExpanded && (
                                    <div className="pb-sm pl-12 space-y-xs">
                                      {dayExpenses.map((e) => {
                                        const info = getCategoryInfo(e.category)
                                        return (
                                          <div key={e.key} className="flex items-center gap-md py-xs">
                                            <CategoryIcon icon={info?.icon} color={info?.color} name={info?.name || e.category} size="sm" />
                                            <p className="flex-1 text-body-sm truncate">{e.name}</p>
                                            {e.isFixed && (
                                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-secondary/10 text-secondary">Fixed</span>
                                            )}
                                            <span className="text-body-sm font-data-mono">{formatCurrecy(e.amount)}</span>
                                          </div>
                                        )
                                      })}
                                      {dayExpenses.length === 0 && (
                                        <p className="text-body-sm text-on-surface-variant">No transactions this day.</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                            {dayRows.length === 0 && (
                              <p className="text-body-sm text-on-surface-variant text-center py-6">No expense data for this period.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bento-card">
                        <div className="flex justify-between items-center mb-lg">
                          <p className="text-label-caps font-label-caps text-on-surface-variant">ALL TRANSACTIONS</p>
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">receipt_long</span>
                        </div>
                        <AllTransactions transactions={transactions} />
                      </div>
                    </>
                  )}
                </div>

                <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between">
                  <p className="text-body-sm text-on-surface-variant">
                    {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
                  </p>
                  <button
                    className="px-md py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
