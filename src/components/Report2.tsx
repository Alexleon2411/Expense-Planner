import { useState, useEffect, useMemo } from 'react'
import { statsApi, expensesApi } from '../api'
import type { OverviewResponse, CategoryBreakdown, DailyData, MonthlyTrend, YearlyStats } from '../api/stats'
import { useCategories } from '../hooks/useCategories'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { isCurrentMonth, summarizePaidFixed } from '../helpers/fixedExpensesStats'
import { formatCurrecy } from '../helpers'
import CategoryIcon from './CategoryIcon'

const MONTHS_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

export default function Report2() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([])
  const [prevYearTrend, setPrevYearTrend] = useState<MonthlyTrend[]>([])
  const [yearlyStats, setYearlyStats] = useState<YearlyStats | null>(null)
  const [prevYearStats, setPrevYearStats] = useState<YearlyStats | null>(null)
  const [recentExpenses, setRecentExpenses] = useState<{ id: string; expenseName: string; amount: number; category: string; date: Date }[]>([])
  const [loading, setLoading] = useState(true)

  const { categories } = useCategories()
  const { fixedExpenses } = useFixedExpenses()

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const isCurrent = now.getFullYear() === selectedYear && now.getMonth() + 1 === selectedMonth
  const daysElapsed = isCurrent ? now.getDate() : daysInMonth

  useEffect(() => {
    setLoading(true)
    Promise.all([
      statsApi.getOverview(selectedMonth, selectedYear),
      statsApi.getCategoryBreakdown(selectedMonth, selectedYear),
      statsApi.getDailyStats(selectedYear, selectedMonth),
      statsApi.getMonthlyTrend(selectedYear),
      statsApi.getMonthlyTrend(selectedYear - 1),
      statsApi.getYearlyStats(selectedYear),
      statsApi.getYearlyStats(selectedYear - 1),
      expensesApi.listExpenses({ month: selectedMonth, year: selectedYear, page: 1, limit: 5 }),
    ])
      .then(([ov, cat, daily, trend, prevTrend, yearly, prevYear, recent]) => {
        setOverview(ov)
        setCategoryBreakdown(cat)
        setDailyData(daily)
        setMonthlyTrend(trend)
        setPrevYearTrend(prevTrend)
        setYearlyStats(yearly)
        setPrevYearStats(prevYear)
        setRecentExpenses(
          recent.expenses.map((e) => ({
            id: e.id,
            expenseName: e.name,
            amount: e.amount,
            category: e.category,
            date: new Date(e.date),
          })),
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedMonth, selectedYear])

  const paidFixed = useMemo(() => {
    if (!isCurrentMonth(selectedMonth, selectedYear)) {
      return { total: 0, count: 0, byCategory: new Map<string, { total: number; count: number }>(), byDay: new Map<number, { total: number; count: number }>() }
    }
    return summarizePaidFixed(fixedExpenses)
  }, [fixedExpenses, selectedMonth, selectedYear])

  const totalSpent = (overview?.totalSpent ?? 0) + paidFixed.total
  const budgeted = overview?.budgeted ?? 0
  const budgetPct = budgeted > 0 ? Math.round((totalSpent / budgeted) * 100) : 0
  const avgDaily = daysElapsed > 0 ? totalSpent / daysElapsed : 0
  const predictedEom = avgDaily * daysInMonth
  const dailyRate = budgeted > 0 ? ((totalSpent / daysElapsed) / budgeted) * 100 : 0

  const currentTrendByMonth = useMemo(() => {
    const map = new Map<number, number>()
    monthlyTrend.forEach((t) => map.set(t.month, t.total))
    return map
  }, [monthlyTrend])

  const prevTrendByMonth = useMemo(() => {
    const map = new Map<number, number>()
    prevYearTrend.forEach((t) => map.set(t.month, t.total))
    return map
  }, [prevYearTrend])

  const prevMonthTotal = selectedMonth === 1
    ? (prevTrendByMonth.get(12) ?? 0)
    : (currentTrendByMonth.get(selectedMonth - 1) ?? 0)
  const monthlyChange = prevMonthTotal > 0 ? ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100 : 0

  const yearToDate = yearlyStats?.total ?? 0
  const prevYearTotal = prevYearStats?.total ?? 0
  const yearlyChange = prevYearTotal > 0 ? ((yearToDate - prevYearTotal) / prevYearTotal) * 100 : 0

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)
  }

  const today = now.getDate()

  const weekDays = useMemo(() => {
    const byDay = new Map<number, number>()
    dailyData.forEach((d) => byDay.set(d.day, d.total))
    paidFixed.byDay.forEach((v, day) => {
      byDay.set(day, (byDay.get(day) ?? 0) + v.total)
    })

    const anchorDate = new Date(selectedYear, selectedMonth - 1, isCurrent ? today : daysInMonth)
    const monday = new Date(anchorDate)
    monday.setDate(anchorDate.getDate() - ((anchorDate.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const inMonth = d.getMonth() === selectedMonth - 1
      const dayNum = d.getDate()
      return {
        label: d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
        inMonth,
        current: inMonth ? (byDay.get(dayNum) ?? 0) : 0,
        previous: 0,
      }
    })
  }, [dailyData, paidFixed, isCurrent, today, daysInMonth, selectedYear, selectedMonth])

  const maxDailyTotal = useMemo(() => {
    if (weekDays.length === 0) return 1
    return Math.max(...weekDays.map((d) => d.current))
  }, [weekDays])

  const mergedCategoryBreakdown = useMemo(() => {
    const map = new Map<string, CategoryBreakdown>()
    categoryBreakdown.forEach((c) => map.set(c.category, { ...c }))
    paidFixed.byCategory.forEach((v, categoryId) => {
      const cur = map.get(categoryId) ?? { category: categoryId, total: 0, count: 0 }
      cur.total += v.total
      cur.count += v.count
      map.set(categoryId, cur)
    })
    return [...map.values()].filter((c) => c.total > 0)
  }, [categoryBreakdown, paidFixed])

  const sortedByValue = useMemo(() => {
    return [...mergedCategoryBreakdown].sort((a, b) => b.total - a.total)
  }, [mergedCategoryBreakdown])

  const sortedByCount = useMemo(() => {
    return [...mergedCategoryBreakdown].sort((a, b) => b.count - a.count)
  }, [mergedCategoryBreakdown])

  const maxValue = sortedByValue.length > 0 ? Math.max(...sortedByValue.map((c) => c.total)) : 1
  const maxCount = sortedByCount.length > 0 ? Math.max(...sortedByCount.map((c) => c.count)) : 1

  if (loading) {
    return (
      <div className="min-h-screen pb-xl flex items-center justify-center">
        <p className="text-body-lg text-on-surface-variant">Loading report data...</p>
      </div>
    )
  }

  return (
    <div>
      <main className="min-h-screen pb-xl">
        <div className="p-container-margin max-w-7xl mx-auto space-y-gutter">
          <div className="mb-xl">
            <div className="text-center py-xl relative overflow-hidden rounded-xl bg-primary-container text-on-primary">
              <div className="relative z-10">
                <h2 className="text-headline-lg font-xl mb-xs">Report</h2>
                <p className="text-lg opacity-80 max-w-2xl mx-auto">Generate and view your financial reports.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
              <div className="relative">
                <select
                  className="mr-1 appearance-none pl-md pr-xl py-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm font-medium focus:ring-2 focus:ring-primary"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {MONTHS_LONG.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-xs top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
              </div>
              <div className="relative">
                <select
                  className="mr-1 appearance-none pl-md pr-xl py-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm font-medium focus:ring-2 focus:ring-primary w-24"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-xs top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="bento-card">
              <div className="flex justify-between items-start mb-xs">
                <p className="text-label-caps font-label-caps text-on-surface-variant">TOTAL BALANCE</p>
                <span className="text-secondary material-symbols-outlined text-sm">account_balance</span>
              </div>
              <h2 className="text-headline-lg font-bold text-primary font-data-mono mb-2">{formatCurrecy(totalSpent)}</h2>
              <div className="flex items-center gap-1 text-secondary text-body-sm">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> +{monthlyChange.toFixed(1)}% <span className="text-on-surface-variant ml-1 font-normal">vs last month</span>
              </div>
            </div>
            <div className="bento-card">
              <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">AVG DAILY SPEND</p>
              <h2 className="text-headline-lg font-bold text-on-surface font-data-mono mb-2">{formatCurrecy(avgDaily)}</h2>
              <div className="flex items-center gap-1 text-error text-body-sm">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> +{dailyRate.toFixed(1)}% <span className="text-on-surface-variant ml-1 font-normal">of daily budget</span>
              </div>
            </div>
            <div className="bento-card">
              <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">BUDGET UTILIZATION</p>
              <div className="flex items-baseline gap-2 mb-2">
                <h2 className="text-headline-lg font-bold text-on-surface font-data-mono">{budgetPct}%</h2>
                <span className="text-body-sm text-on-surface-variant">({formatCurrecy(totalSpent)} / {formatCurrecy(budgeted)})</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${Math.min(budgetPct, 100)}%` }}></div>
              </div>
            </div>
            <div className="bento-card">
              <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">EXPENSE VELOCITY</p>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-headline-lg font-bold text-secondary font-data-mono">
                  {dailyRate > 5 ? 'Fast' : dailyRate > 3 ? 'Steady' : 'Slow'}
                </h2>
                <span className="material-symbols-outlined text-secondary">bolt</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">Consuming {dailyRate.toFixed(1)}% budget / day</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-gutter">
            <div className="col-span-12 lg:col-span-8 bento-card">
              <div className="flex justify-between items-center mb-lg">
                <div>
                  <p className="text-label-caps font-label-caps text-on-surface-variant">WEEKLY EXPENDITURE</p>
                  <h3 className="text-headline-md">Trend Over Past 7 Days</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-body-sm text-on-surface-variant mr-4">
                    <span className="w-3 h-3 bg-primary rounded-full"></span> This Week
                  </div>
                </div>
              </div>
              <div className="h-64 w-full flex items-end justify-between gap-4 px-4 border-b border-outline-variant/30">
                {weekDays.map((day, i) => {
                  const pct = maxDailyTotal > 0 ? (day.current / maxDailyTotal) * 100 : 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                      <div className="relative w-full flex-1 flex flex-col items-center justify-end">
                        <div
                          className={`w-full rounded-t-sm relative z-10 cursor-pointer ${
                            day.inMonth ? 'bg-primary hover:opacity-80' : 'bg-outline-variant/30'
                          }`}
                          style={{ height: `${Math.max(pct, day.inMonth ? 2 : 1)}%` }}
                        >
                          {day.current > 0 && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-on-primary text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                              {formatCurrecy(day.current)}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-label-caps ${day.inMonth ? 'text-on-surface-variant' : 'text-outline'}`}>{day.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bento-card flex flex-col">
              <p className="text-label-caps font-label-caps text-on-surface-variant mb-lg">PERIODIC COMPARISON</p>
              <div className="space-y-lg flex-1">
                <div className="p-md bg-surface-container-low rounded-xl">
                  <div className="flex justify-between items-center mb-sm">
                    <p className="text-body-sm font-medium">Monthly Contrast</p>
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                      monthlyChange >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'
                    }`}>
                      {monthlyChange >= 0 ? 'UP' : 'DOWN'} {Math.abs(monthlyChange).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-headline-md font-data-mono">{formatCurrecy(totalSpent)}</p>
                      <p className="text-[10px] text-on-surface-variant">{MONTHS_LONG[selectedMonth - 1]} {selectedYear}</p>
                    </div>
                    <div className="h-10 w-24">
                      <svg className="w-full h-full" viewBox="0 0 100 40">
                        <path d="M0 35 L20 30 L40 32 L60 20 L80 15 L100 5" fill="none" stroke="#006c49" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm font-data-mono text-on-surface-variant">
                        {prevMonthTotal > 0 ? formatCurrecy(prevMonthTotal) : 'N/A'}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">Previous</p>
                    </div>
                  </div>
                </div>
                <div className="p-md bg-surface-container-low rounded-xl">
                  <div className="flex justify-between items-center mb-sm">
                    <p className="text-body-sm font-medium">Yearly Performance</p>
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                      yearlyChange >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'
                    }`}>
                      {yearlyChange >= 0 ? 'UP' : 'DOWN'} {Math.abs(yearlyChange).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-headline-md font-data-mono">{formatCurrecy(yearToDate)}</p>
                      <p className="text-[10px] text-on-surface-variant">YTD {selectedYear}</p>
                    </div>
                    <div className="h-10 w-24">
                      <svg className="w-full h-full" viewBox="0 0 100 40">
                        <path d="M0 5 L20 15 L40 10 L60 25 L80 20 L100 35" fill="none" stroke="#ba1a1a" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm font-data-mono text-on-surface-variant">
                        {prevYearTotal > 0 ? formatCurrecy(prevYearTotal) : 'N/A'}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">YTD {selectedYear - 1}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-lg pt-md border-t border-outline-variant">
                <p className="text-[10px] text-on-surface-variant italic">Data updated as of {now.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-gutter">
            <div className="col-span-12 lg:col-span-8 bento-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                <div>
                  <div className="flex justify-between items-center mb-lg">
                    <p className="text-label-caps font-label-caps text-on-surface-variant">BY VALUE ($)</p>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">info</span>
                  </div>
                  <div className="space-y-md">
                    {sortedByValue.slice(0, 5).map((cat) => {
                      const pct = maxValue > 0 ? (cat.total / maxValue) * 100 : 0
                      return (
                        <div key={cat.category}>
                          <div className="flex justify-between text-body-sm mb-xs">
                            <span className="font-medium">{getCategoryInfo(cat.category)?.name || cat.category}</span>
                            <span className="font-data-mono">{formatCurrecy(cat.total)}</span>
                          </div>
                          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                    {sortedByValue.length === 0 && (
                      <p className="text-body-sm text-on-surface-variant">No expense data for this month.</p>
                    )}
                  </div>
                  <div className="mt-xl p-md bg-primary-container rounded-lg">
                    <p className="text-label-caps text-on-primary-container mb-1">PREDICTED EOM SPEND</p>
                    <p className="text-headline-md font-bold text-on-primary font-data-mono">{formatCurrecy(predictedEom)}</p>
                    <p className="text-body-sm text-on-primary-container">Based on {daysInMonth - daysElapsed} days remaining</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-lg">
                    <p className="text-label-caps font-label-caps text-on-surface-variant">BY VOLUME (COUNT)</p>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">receipt</span>
                  </div>
                  <div className="space-y-6">
                    {sortedByCount.slice(0, 5).map((cat) => {
                      const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0
                      return (
                        <div key={cat.category} className="flex items-center gap-md">
                          <span className="text-body-sm w-20 text-on-surface-variant truncate">
                            {getCategoryInfo(cat.category)?.name || cat.category}
                          </span>
                          <div className="flex-1 bg-surface-container-high h-6 rounded flex items-center px-2">
                            <div className="bg-secondary h-4 rounded-sm" style={{ width: `${pct}%` }}></div>
                            <span className="ml-2 text-[10px] font-bold">{cat.count}</span>
                          </div>
                        </div>
                      )
                    })}
                    {sortedByCount.length === 0 && (
                      <p className="text-body-sm text-on-surface-variant">No volume data for this month.</p>
                    )}
                  </div>
                  <button className="mt-8 w-full border border-outline-variant py-2 rounded text-body-sm font-bold hover:bg-surface-container-low transition-colors">
                    Detailed Breakdown Report
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bento-card">
              <div className="flex justify-between items-center mb-lg">
                <p className="text-label-caps font-label-caps text-on-surface-variant">RECENT ACTIVITIES</p>
                <button className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
              <div className="space-y-sm max-h-[360px] overflow-y-auto custom-scrollbar pr-xs">
                {recentExpenses.length > 0 ? recentExpenses.map((expense) => {
                  const cat = getCategoryInfo(expense.category)
                  const dateStr = expense.date instanceof Date
                    ? expense.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : ''
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors border-b border-outline-variant/30 last:border-0">
                      <div className="flex items-center gap-md">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                          {/* <span 
                            className="material-symbols-outlined text-primary text-[18px]">
                              {cat?.icon || 'receipt'}
                            </span> */}
                            {cat && (
                              <CategoryIcon 
                               icon={cat?.icon}
                               color={cat?.color}
                               name={cat!.name}
                                size="sm"
                              />
                            )}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-body-sm">{expense.expenseName}</p>
                          <p className="text-on-surface-variant text-[11px]">{cat?.name || expense.category} &middot; {dateStr}</p>
                        </div>
                      </div>
                      <span className={`font-data-mono font-bold text-sm ${expense.amount >= 0 ? 'text-error' : 'text-secondary'}`}>
                        {expense.amount >= 0 ? '-' : '+'}{formatCurrecy(Math.abs(expense.amount))}
                      </span>
                    </div>
                  )
                }) : (
                  <p className="text-body-sm text-on-surface-variant text-center py-4">No recent expenses.</p>
                )}
              </div>
              <div className="mt-lg pt-lg border-t border-outline-variant text-center">
                <a className="text-primary font-bold text-body-sm hover:underline" href="#">View All Transactions</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
