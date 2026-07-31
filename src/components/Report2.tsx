import { useState, useEffect, useMemo } from 'react'
import { statsApi } from '../api'
import type { OverviewResponse, CategoryBreakdown, DailyData, MonthlyTrend, YearlyStats } from '../api/stats'
import { useBudget } from '../hooks/useBudget'
import { useCategories } from '../hooks/useCategories'
import { formatCurrecy } from '../helpers'
import CategoryIcon from './CategoryIcon' 

export default function Report2() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([])
  const [yearlyStats, setYearlyStats] = useState<YearlyStats | null>(null)
  const [loading, setLoading] = useState(true)

  const { state } = useBudget()
  const { categories } = useCategories()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const daysElapsed = now.getDate()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      statsApi.getOverview(currentMonth, currentYear),
      statsApi.getCategoryBreakdown(currentMonth, currentYear),
      statsApi.getDailyStats(currentYear, currentMonth),
      statsApi.getMonthlyTrend(currentYear),
      statsApi.getYearlyStats(currentYear),
    ])
      .then(([ov, cat, daily, trend, yearly]) => {
        setOverview(ov)
        setCategoryBreakdown(cat)
        setDailyData(daily)
        setMonthlyTrend(trend)
        setYearlyStats(yearly)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalSpent = overview?.totalSpent ?? 0
  const budgeted = overview?.budgeted ?? 0
  const budgetPct = budgeted > 0 ? Math.round((totalSpent / budgeted) * 100) : 0
  const avgDaily = daysElapsed > 0 ? totalSpent / daysElapsed : 0
  const predictedEom = avgDaily * daysInMonth
  const dailyRate = budgeted > 0 ? ((totalSpent / daysElapsed) / budgeted * 100) : 0

  const prevMonthTrend = monthlyTrend.length >= 2 ? monthlyTrend[monthlyTrend.length - 2] : null
  const monthlyChange = prevMonthTrend && prevMonthTrend.total > 0
    ? ((totalSpent - prevMonthTrend.total) / prevMonthTrend.total) * 100
    : 0

  const yearToDate = yearlyStats?.total ?? 0
  const previousYear = currentYear - 1
  const [prevYearStats, setPrevYearStats] = useState<YearlyStats | null>(null)

  useEffect(() => {
    statsApi.getYearlyStats(previousYear).then(setPrevYearStats).catch(() => {})
  }, [])

  const prevYearTotal = prevYearStats?.total ?? 0
  const yearlyChange = prevYearTotal > 0 ? ((yearToDate - prevYearTotal) / prevYearTotal) * 100 : 0

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)
  }

  const recentExpenses = useMemo(() => {
    return [...state.expenses]
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : new Date().getTime()
        const dateB = b.date instanceof Date ? b.date.getTime() : new Date().getTime()
        return dateB - dateA
      })
      .slice(0, 5)
  }, [state.expenses])

  const maxDailyTotal = useMemo(() => {
    if (dailyData.length === 0) return 1
    return Math.max(...dailyData.map(d => d.total))
  }, [dailyData])

  const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  const weekDays = useMemo(() => {
    if (dailyData.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({
        label: DAY_LABELS[i],
        current: 0,
        previous: 0,
      }))
    }
    return dailyData.slice(0, 7).map((d, i) => ({
      label: DAY_LABELS[i] || `DAY ${d.day}`,
      current: d.total,
      previous: 0,
    }))
  }, [dailyData])

  const sortedByValue = useMemo(() => {
    return [...categoryBreakdown].sort((a, b) => b.total - a.total)
  }, [categoryBreakdown])

  const sortedByCount = useMemo(() => {
    return [...categoryBreakdown].sort((a, b) => b.count - a.count)
  }, [categoryBreakdown])

  const maxValue = sortedByValue.length > 0 ? Math.max(...sortedByValue.map(c => c.total)) : 1
  const maxCount = sortedByCount.length > 0 ? Math.max(...sortedByCount.map(c => c.count)) : 1

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
          <div className="mb-xl text-center py-xl relative overflow-hidden rounded-xl bg-primary-container text-on-primary">
            <div className="relative z-10">
              <h2 className="text-headline-lg font-xl mb-xs">Report</h2>
              <p className="text-lg opacity-80 max-w-2xl mx-auto">Generate and view your financial reports.</p>
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
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex flex-col items-center justify-end h-full">
                        <div className="w-full bg-primary h-[${pct}%] rounded-t-sm relative z-10 hover:opacity-80 cursor-pointer"
                          style={{ height: `${Math.max(pct, 2)}%` }}>
                          {day.current > 0 && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-on-primary text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                              {formatCurrecy(day.current)}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-label-caps text-on-surface-variant">{day.label}</span>
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
                      <p className="text-[10px] text-on-surface-variant">Current Month</p>
                    </div>
                    <div className="h-10 w-24">
                      <svg className="w-full h-full" viewBox="0 0 100 40">
                        <path d="M0 35 L20 30 L40 32 L60 20 L80 15 L100 5" fill="none" stroke="#006c49" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm font-data-mono text-on-surface-variant">
                        {prevMonthTrend ? formatCurrecy(prevMonthTrend.total) : 'N/A'}
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
                      <p className="text-[10px] text-on-surface-variant">YTD {currentYear}</p>
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
                      <p className="text-[10px] text-on-surface-variant">YTD {previousYear}</p>
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
                          <CategoryIcon 
                           icon={cat?.icon}
                           color={cat?.color}
                           name={cat!.name}
                           size="sm"
                           />
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
