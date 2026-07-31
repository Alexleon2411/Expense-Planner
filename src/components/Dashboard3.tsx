import { useState, useEffect, useMemo } from 'react'
import { statsApi } from '../api'
import type { OverviewResponse, CategoryBreakdown, MonthlyTrend } from '../api/stats'
import { useBudget } from '../hooks/useBudget'
import { useCategories } from '../hooks/useCategories'
import { formatCurrecy } from '../helpers'
import SalarySection from './SalarySection'
import ExpenseTemplates from './ExpenseTemplates'
import CategoryManager from './CategoryManager'
import CalendarView from './CalendarView'
import Statistics from './Statistics'
import PaymentStatusBadge from './PaymentStatusBadge'
import CategoryIcon from './CategoryIcon'

type MainTab = 'dashboard' | 'insights'
type InnerTab = 'resumen' | 'plantillas' | 'categorias' | 'calendario' | 'estadisticas'

const PIE_COLORS = ['#6750a4', '#625b71', '#7d5260', '#006c49', '#ba1a1a', '#00639b']
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const MONTHS_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function Dashboard3() {
  const [mainTab, setMainTab] = useState<MainTab>('dashboard')
  const [innerTab, setInnerTab] = useState<InnerTab>('resumen')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const { state, totalExpense, reminderBudget } = useBudget()
  const { categories } = useCategories()

  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([])
  const [prevYearTrend, setPrevYearTrend] = useState<MonthlyTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      statsApi.getOverview(selectedMonth, selectedYear),
      statsApi.getCategoryBreakdown(selectedMonth, selectedYear),
      statsApi.getMonthlyTrend(selectedYear),
      statsApi.getMonthlyTrend(selectedYear - 1),
    ])
      .then(([ov, cat, cur, prev]) => {
        setOverview(ov)
        setCategoryBreakdown(cat)
        setMonthlyTrend(cur)
        setPrevYearTrend(prev)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedMonth, selectedYear])

  const totalSpent = overview?.totalSpent ?? 0
  const budgeted = overview?.budgeted ?? 0
  const percentage = overview?.percentage ?? (budgeted > 0 ? (totalSpent / budgeted) * 100 : 0)
  const savings = budgeted - totalSpent

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)
  }

  const recentExpenses = useMemo(() => {
    return [...state.expenses]
      .sort((a, b) => {
        const da = a.date instanceof Date ? a.date : new Date(String(a.date))
        const db = b.date instanceof Date ? b.date : new Date(String(b.date))
        return db.getTime() - da.getTime()
      })
      .slice(0, 5)
  }, [state.expenses])

  const currentTrendByMonth = useMemo(() => {
    const map = new Map<number, number>()
    monthlyTrend.forEach(t => map.set(t.month, t.total))
    return map
  }, [monthlyTrend])

  const prevTrendByMonth = useMemo(() => {
    const map = new Map<number, number>()
    prevYearTrend.forEach(t => map.set(t.month, t.total))
    return map
  }, [prevYearTrend])

  const momChange = useMemo(() => {
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1
    const prevTotal = currentTrendByMonth.get(prevMonth) ?? 0
    if (prevTotal <= 0) return 0
    return ((totalSpent - prevTotal) / prevTotal) * 100
  }, [currentTrendByMonth, selectedMonth, totalSpent])

  const sortedCategories = useMemo(() => {
    return [...categoryBreakdown].sort((a, b) => b.total - a.total)
  }, [categoryBreakdown])

  const highestCategory = sortedCategories.length > 0 ? sortedCategories[0] : null
  const highestPct = highestCategory && totalSpent > 0 ? (highestCategory.total / totalSpent) * 100 : 0

  const distribution = useMemo(() => {
    const top = sortedCategories.slice(0, 5)
    const max = Math.max(top.length, 3)
    const withColors = top.map((c, i) => ({
      ...c,
      color: getCategoryInfo(c.category)?.color || PIE_COLORS[i % PIE_COLORS.length],
    }))
    while (withColors.length < max) {
      withColors.push({ category: 'other', total: 0, count: 0, color: PIE_COLORS[withColors.length % PIE_COLORS.length] })
    }
    return withColors
  }, [sortedCategories])

  const pieGradient = useMemo(() => {
    if (totalSpent <= 0) return 'conic-gradient(#e0e0e0 0deg 360deg)'
    let acc = 0
    const segments = distribution
      .filter(c => c.total > 0)
      .map(c => {
        const start = (acc / totalSpent) * 360
        acc += c.total
        const end = (acc / totalSpent) * 360
        return `${c.color} ${start}deg ${end}deg`
      })
    return `conic-gradient(${segments.join(', ')})`
  }, [distribution, totalSpent])

  const chartMonths = useMemo(() => {
    const res: number[] = []
    for (let i = 5; i >= 0; i--) {
      const m = selectedMonth - i
      res.push(m <= 0 ? m + 12 : m)
    }
    return res
  }, [selectedMonth])

  const maxChartValue = useMemo(() => {
    const values = chartMonths.flatMap(m => [
      currentTrendByMonth.get(m) ?? 0,
      prevTrendByMonth.get(m) ?? 0,
    ])
    const max = Math.max(...values)
    return max > 0 ? max : 1
  }, [chartMonths, currentTrendByMonth, prevTrendByMonth])

  const merchants = useMemo(() => {
    const map = new Map<string, { name: string; category: string; count: number; total: number }>()
    for (const exp of state.expenses) {
      const existing = map.get(exp.expenseName)
      if (existing) {
        existing.count += 1
        existing.total += exp.amount
      } else {
        map.set(exp.expenseName, { name: exp.expenseName, category: exp.category, count: 1, total: exp.amount })
      }
    }
    return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 5)
  }, [state.expenses])

  const innerTabs: { id: InnerTab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'plantillas', label: 'Plantillas' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'estadisticas', label: 'Estadísticas' },
  ]

  return (
    <div>
      <main className="min-h-screen pb-xl">
        <div className="mt-6 mx-6 p-lg space-y-lg text-center py-xl overflow-hidden rounded-xl bg-primary-container text-on-primary">
          <div className="relative z-10">
            <h2 className="text-display-md font-display-md mb-xs tracking-tight">Dashboard</h2>
            <p className="text-headline-sm font-headline-sm opacity-80 max-w-2xl mx-auto">Overview of your financial performance.</p>
          </div>
        </div>

        <section className="px-container-margin py-md flex flex-wrap gap-md items-center justify-between">
          <div className="flex bg-surface-container rounded-lg p-xs">
            <button
              onClick={() => setMainTab('dashboard')}
              className={`px-md py-xs rounded-md font-label-caps text-label-caps ${
                mainTab === 'dashboard' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setMainTab('insights')}
              className={`px-md py-xs rounded-md font-label-caps text-label-caps ${
                mainTab === 'insights' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant'
              }`}
            >
              Insights
            </button>
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-md pr-xl py-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm font-medium focus:ring-2 focus:ring-primary"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS_LONG.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m} {selectedYear}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-xs top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
          </div>
          <input
            type="number"
            className="appearance-none pl-md pr-xl py-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm font-medium focus:ring-2 focus:ring-primary w-24"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            min={2020}
            max={2100}
          />
        </section>

        {mainTab === 'dashboard' ? (
          <div className="px-container-margin space-y-gutter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="bento-card">
                <SalarySection />
              </div>
              <div className="bento-card">
                <div className="flex justify-between items-start mb-sm">
                  <p className="text-label-caps font-label-caps text-on-surface-variant">QUICK SUMMARY</p>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">monitoring</span>
                </div>
                <div className="space-y-md">
                  <div className="flex justify-between items-baseline">
                    <span className="text-body-sm text-on-surface-variant">Presupuesto</span>
                    <span className="text-headline-sm font-data-mono font-bold">{formatCurrecy(state.budget)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-body-sm text-on-surface-variant">Gastado</span>
                    <span className="text-headline-sm font-data-mono font-bold text-primary">{formatCurrecy(totalExpense)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-body-sm text-on-surface-variant">Disponible</span>
                    <span className={`text-headline-sm font-data-mono font-bold ${reminderBudget < 0 ? 'text-error' : 'text-secondary'}`}>
                      {formatCurrecy(reminderBudget)}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-3 rounded-full mt-md overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${percentage >= 100 ? 'bg-error' : 'bg-primary'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-body-sm text-on-surface-variant text-center">{percentage.toFixed(2)}% utilizado</p>
                </div>
              </div>
            </div>

            <div className="bento-card !p-0 overflow-hidden">
              <div className="flex border-b border-outline-variant overflow-x-auto">
                {innerTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setInnerTab(t.id)}
                    className={`flex-1 min-w-[120px] py-sm text-center font-label-caps font-label-caps transition-colors ${
                      innerTab === t.id ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-lg">
                {innerTab === 'resumen' && (
                  recentExpenses.length > 0 ? (
                    <div className="space-y-sm">
                      <h4 className="text-headline-sm font-bold mb-md">Últimos Gastos</h4>
                      {recentExpenses.map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between bg-surface-container-low p-sm rounded-lg">
                          <div>
                            <p className="font-bold text-body-md">{exp.expenseName}</p>
                            <div className="flex items-center gap-sm">
                              <span className="text-body-sm text-on-surface-variant">
                                {exp.date instanceof Date
                                  ? exp.date.toLocaleDateString('es-MX')
                                  : new Date(String(exp.date)).toLocaleDateString('es-MX')}
                              </span>
                              <PaymentStatusBadge status={exp.status || 'pending'} partialAmount={exp.partialAmount} />
                            </div>
                          </div>
                          <p className="text-headline-sm font-black text-primary font-data-mono">{formatCurrecy(exp.amount)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-on-surface-variant py-lg">
                      <p className="text-headline-sm">Bienvenido al Dashboard</p>
                      <p className="text-body-sm">Usa las pestañas para explorar plantillas, categorías, calendario y estadísticas.</p>
                    </div>
                  )
                )}
                {innerTab === 'plantillas' && <ExpenseTemplates />}
                {innerTab === 'categorias' && <CategoryManager />}
                {innerTab === 'calendario' && <CalendarView year={selectedYear} month={selectedMonth} />}
                {innerTab === 'estadisticas' && <Statistics />}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-container-margin grid grid-cols-12 gap-gutter">
            {loading ? (
              <div className="col-span-12 flex items-center justify-center py-24">
                <p className="text-body-lg text-on-surface-variant">Cargando insights...</p>
              </div>
            ) : (
              <>
                <div className="col-span-12 md:col-span-4 bento-card flex flex-col justify-between">
                  <div>
                    <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">TOTAL EXPENSES</p>
                    <h3 className="text-display-lg font-display-lg text-on-surface font-data-mono">{formatCurrecy(totalSpent)}</h3>
                  </div>
                  <div className="mt-md flex items-center gap-sm">
                    <div className={`flex items-center gap-xs px-sm py-1 rounded-full ${
                      momChange >= 0 ? 'bg-secondary-container/20 text-on-secondary-container' : 'bg-error/10 text-error'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {momChange >= 0 ? 'trending_up' : 'trending_down'}
                      </span>
                      <span className="font-data-mono text-data-mono">{Math.abs(momChange).toFixed(1)}%</span>
                    </div>
                    <span className="text-body-sm text-on-surface-variant">vs last month</span>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4 bento-card">
                  <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">HIGHEST CATEGORY</p>
                  <div className="flex items-center gap-md mt-sm">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                      {/* <span className="material-symbols-outlined text-on-primary-fixed">
                        {getCategoryInfo(highestCategory?.category || '')?.icon || 'category'}
                      </span> */}
                      <CategoryIcon
                        icon={getCategoryInfo(highestCategory?.category || '')?.icon}
                        color={getCategoryInfo(highestCategory?.category || '')?.color}
                        name={getCategoryInfo(highestCategory?.category || '')!.name}
                        size="md"
                      />
                    </div>
                    <div>
                      <h4 className="text-headline-md font-headline-md">
                        {highestCategory ? getCategoryInfo(highestCategory.category)?.name || highestCategory.category : 'N/A'}
                      </h4>
                      <p className="text-body-sm text-on-surface-variant">
                        {highestCategory ? `${formatCurrecy(highestCategory.total)} (${highestPct.toFixed(1)}%)` : 'No data'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4 bento-card">
                  <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">MONTHLY SAVINGS</p>
                  <div className="flex items-center gap-md mt-sm">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-secondary-container">savings</span>
                    </div>
                    <div>
                      <h4 className="text-headline-md font-headline-md">{formatCurrecy(savings)}</h4>
                      <p className="text-body-sm text-on-surface-variant">
                        {savings >= 0 ? `${formatCurrecy(reminderBudget)} under budget` : 'Over budget'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-5 bento-card flex flex-col">
                  <h3 className="text-label-caps font-label-caps text-on-surface-variant mb-lg">CATEGORY DISTRIBUTION</h3>
                  <div className="flex-grow flex items-center justify-center py-lg relative">
                    <div
                      className="w-48 h-48 rounded-full flex items-center justify-center"
                      style={{ background: pieGradient }}
                    >
                      <div className="w-36 h-36 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-headline-md font-headline-md block ">{formatCurrecy(totalSpent)}</span>
                          <span className="text-label-caps font-label-caps text-outline">Total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-sm mt-md">
                    {distribution.filter(c => c.total > 0).map((c) => (
                      <div key={c.category} className="flex justify-between items-center">
                        <div className="flex items-center gap-sm">
                          <div className="w-3 h-3 rounded-full" style={{ background: c.color }}></div>
                          <span className="text-body-sm">{getCategoryInfo(c.category)?.name || c.category}</span>
                        </div>
                        <span className="font-data-mono text-data-mono">
                          {totalSpent > 0 ? ((c.total / totalSpent) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    ))}
                    {distribution.filter(c => c.total > 0).length === 0 && (
                      <p className="text-body-sm text-on-surface-variant text-center py-sm">Sin datos para el periodo seleccionado.</p>
                    )}
                  </div>
                </div>

                <div className="col-span-12 md:col-span-7 bento-card">
                  <div className="flex justify-between items-center mb-lg">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant">MONTH-OVER-MONTH ANALYSIS</h3>
                    <div className="flex gap-md">
                      <div className="flex items-center gap-xs">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-body-sm">{selectedYear}</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                        <span className="text-body-sm">{selectedYear - 1}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-auto flex items-end justify-between gap-md">
                    {chartMonths.map((m) => {
                      const current = currentTrendByMonth.get(m) ?? 0
                      const previous = prevTrendByMonth.get(m) ?? 0
                      const curH = (current / maxChartValue) * 100
                      const prevH = (previous / maxChartValue) * 100
                      return (
                        <div key={m} className="flex-grow flex flex-col gap-xs items-center group">
                          <div className="w-full bg-outline-variant/30 rounded-t-sm" style={{ height: `${Math.max(prevH, 2)}%`, minHeight: 4 }}></div>
                          <div className="w-full bg-primary rounded-t-sm transition-all group-hover:opacity-80" style={{ height: `${Math.max(curH, 2)}%`, minHeight: 4 }}></div>
                          <span className="text-label-caps font-label-caps mt-xs">{MONTHS_SHORT[m - 1]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="col-span-12 bento-card">
                  <div className="flex justify-between items-center mb-lg">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant">TOP EXPENSES BY SPENDING</h3>
                    <button className="text-primary text-body-sm font-bold hover:underline">View All Transactions</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left border-b border-outline-variant">
                          <th className="pb-md text-label-caps font-label-caps text-outline">EXPENSE</th>
                          <th className="pb-md text-label-caps font-label-caps text-outline">CATEGORY</th>
                          <th className="pb-md text-label-caps font-label-caps text-outline">TRANSACTIONS</th>
                          <th className="pb-md text-right text-label-caps font-label-caps text-outline">TOTAL AMOUNT</th>
                          <th className="pb-md text-right text-label-caps font-label-caps text-outline">SHARE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {merchants.length > 0 ? merchants.map((m) => (
                          <tr key={m.name} className="group hover:bg-surface-container-low transition-colors">
                            <td className="py-md flex items-center gap-md">
                              <div className="w-10 h-10 rounded-full  flex items-center justify-center">
                                {/* <span className="material-symbols-outlined text-[20px]">
                                  {getCategoryInfo(m.category)?.icon || 'receipt_long'}
                                </span> */}
                                <CategoryIcon
                                  icon={getCategoryInfo(m.category)?.icon}
                                  color={getCategoryInfo(m.category)?.color}
                                  name={getCategoryInfo(m.category)?.name || m.category}
                                  size="md"
                                />
                              </div>
                              <span className="font-bold text-body-md">{m.name}</span>
                            </td>
                            <td className="py-md">
                              <span className="px-sm py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-body-sm">
                                {getCategoryInfo(m.category)?.name || m.category}
                              </span>
                            </td>
                            <td className="py-md">{m.count} {m.count === 1 ? 'entry' : 'entries'}</td>
                            <td className="py-md text-right font-data-mono text-data-mono">{formatCurrecy(m.total)}</td>
                            <td className="py-md text-right">
                              <span className="text-on-secondary-container flex items-center justify-end gap-xs text-body-sm">
                                {totalSpent > 0 ? ((m.total / totalSpent) * 100).toFixed(1) : 0}%
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="py-lg text-center text-on-surface-variant text-body-sm">
                              No hay gastos para el periodo seleccionado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
