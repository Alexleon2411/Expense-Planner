import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { statsApi, expensesApi } from '../api'
import type { OverviewResponse, CategoryBreakdown, DailyData, MonthlyTrend } from '../api/stats'
import type { ExpenseResponse } from '../api/expenses'
import CategoryPieChart from './CategoryPieChart'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { isCurrentMonth, summarizePaidFixed } from '../helpers/fixedExpensesStats'
import { formatCurrecy } from '../helpers'
import type { FixedExpense } from '../types'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

const WEEKDAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

interface Props {
  fixedExpenses?: FixedExpense[]
}

export default function Statistics({ fixedExpenses: fixedExpensesProp }: Props = {}) {
  const [period, setPeriod] = useState<Period>('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [day, setDay] = useState(new Date().getDate())

  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([])
  const [trends, setTrends] = useState<MonthlyTrend[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [monthlyExpenses, setMonthlyExpenses] = useState<ExpenseResponse[]>([])
  const [loading, setLoading] = useState(true)

  const fixedHook = useFixedExpenses()
  const fixedExpenses = fixedExpensesProp ?? fixedHook.fixedExpenses

  const paidFixed = useMemo(() => {
    if (!isCurrentMonth(month, year)) return null
    return summarizePaidFixed(fixedExpenses)
  }, [fixedExpenses, month, year])

  const daysInMonth = new Date(year, month, 0).getDate()
  const selectedDay = Math.min(day, daysInMonth)

  useEffect(() => {
    setLoading(true)
    let cancelled = false

    const load = async () => {
      try {
        const [ov, cat] = await Promise.all([
          statsApi.getOverview(month, year),
          statsApi.getCategoryBreakdown(month, year),
        ])
        if (cancelled) return
        setOverview(ov)
        setCategoryData(cat)

        if (period === 'yearly') {
          const tr = await statsApi.getMonthlyTrend(year)
          if (cancelled) return
          setTrends(tr)
          setDailyData([])
          setMonthlyExpenses([])
        } else {
          const daily = await statsApi.getDailyStats(year, month)
          if (cancelled) return
          setDailyData(daily)
          if (period === 'daily') {
            const resp = await expensesApi.listExpenses({ month, year, page: 1, limit: 1000 })
            if (cancelled) return
            setMonthlyExpenses(resp.expenses)
          } else {
            setMonthlyExpenses([])
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [period, year, month])

  const dailyByDay = useMemo(() => {
    const map = new Map<number, DailyData>()
    dailyData.forEach(d => map.set(d.day, d))
    if (paidFixed) {
      paidFixed.byDay.forEach((v, day) => {
        const cur = map.get(day) ?? { day, total: 0, count: 0, categories: {}, expenses: [] }
        cur.total += v.total
        cur.count += v.count
        map.set(day, cur)
      })
    }
    return map
  }, [dailyData, paidFixed])

  const mergedCategoryData = useMemo(() => {
    const map = new Map<string, { category: string; total: number; count: number }>()
    categoryData.forEach(c => map.set(c.category, { ...c }))
    if (paidFixed) {
      paidFixed.byCategory.forEach((v, categoryId) => {
        const cur = map.get(categoryId) ?? { category: categoryId, total: 0, count: 0 }
        cur.total += v.total
        cur.count += v.count
        map.set(categoryId, cur)
      })
    }
    return [...map.values()].filter(c => c.total > 0)
  }, [categoryData, paidFixed])

  const mergedTrends = useMemo(() => {
    if (!paidFixed || paidFixed.total === 0) return trends
    return trends.map(t => (t.month === month ? { ...t, total: t.total + paidFixed.total, count: t.count + paidFixed.count } : t))
  }, [trends, paidFixed, month])

  const monthCells = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const stat = dailyByDay.get(i + 1)
      return { day: i + 1, total: stat?.total ?? 0, count: stat?.count ?? 0 }
    })
  }, [daysInMonth, dailyByDay])

  const firstWeekday = new Date(year, month - 1, 1).getDay()

  const weekDays = useMemo(() => {
    const date = new Date(year, month - 1, selectedDay)
    const monday = new Date(date)
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const stat = d.getMonth() === month - 1 ? dailyByDay.get(d.getDate()) : undefined
      return {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        weekday: d.getDay(),
        total: stat?.total ?? 0,
        count: stat?.count ?? 0,
        inMonth: d.getMonth() === month - 1,
      }
    })
  }, [year, month, selectedDay, dailyByDay])

  const hourly = useMemo(() => {
    const map = new Map<number, { count: number; total: number }>()
    for (const e of monthlyExpenses) {
      const d = e.date ? new Date(e.date) : null
      if (!d || isNaN(d.getTime())) continue
      if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== selectedDay) continue
      const h = d.getHours()
      const cur = map.get(h) ?? { count: 0, total: 0 }
      map.set(h, { count: cur.count + 1, total: cur.total + Number(e.amount || 0) })
    }
    return map
  }, [monthlyExpenses, year, month, selectedDay])

  const maxHourly = useMemo(() => {
    return Math.max(1, ...[...hourly.values()].map(v => v.total))
  }, [hourly])

  const dayHourTotals = [...hourly.values()]
  const paidDayTotal = paidFixed?.byDay.get(selectedDay)?.total ?? 0
  const totalDay = dayHourTotals.reduce((s, v) => s + v.total, 0) + paidDayTotal
  const totalDayCount = dayHourTotals.reduce((s, v) => s + v.count, 0) + (paidFixed?.byDay.get(selectedDay)?.count ?? 0)

  const trendLineData = useMemo(() => {
    if (period === 'daily') {
      return Array.from({ length: 24 }, (_, h) => {
        const v = hourly.get(h)
        return { label: `${h}h`, total: v?.total ?? 0, count: v?.count ?? 0 }
      })
    }
    if (period === 'weekly') {
      return weekDays.map((w) => ({
        label: WEEKDAY_NAMES[w.weekday],
        total: w.total,
        count: w.count,
      }))
    }
    if (period === 'monthly') {
      return monthCells.map((c) => ({ label: String(c.day), total: c.total, count: c.count }))
    }
    return mergedTrends.map((t) => ({
      label: MONTH_NAMES[t.month - 1].slice(0, 3),
      total: t.total,
      count: t.count,
    }))
  }, [period, hourly, weekDays, monthCells, mergedTrends])

  const hasTrendData =
    trendLineData.some((d) => d.total > 0) ||
    (period === 'daily' && paidDayTotal > 0)

  const overviewSpent = (overview?.totalSpent ?? 0) + (paidFixed?.total ?? 0)
  const overviewRemaining = (overview?.remaining ?? 0) - (paidFixed?.total ?? 0)

  const trendTitle = period === 'daily'
    ? `Gastos por Hora — ${selectedDay} de ${MONTH_NAMES[month - 1]}`
    : period === 'weekly'
      ? `Gastos por Día de la Semana`
      : period === 'monthly'
        ? `Calendario de Gastos — ${MONTH_NAMES[month - 1]} ${year}`
        : `Tendencia Mensual — ${year}`

  const renderTrend = () => {
    if (period === 'yearly') {
      return mergedTrends.length > 0 ? (
        <div className="space-y-2">
          {mergedTrends.map((t) => (
            <div key={t.month} className="flex items-center gap-3">
              <span className="w-16 sm:w-24 shrink-0 text-xs sm:text-sm font-semibold capitalize">
                {MONTH_NAMES[t.month - 1]}
              </span>
              <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.min((t.total / (overview?.budgeted || 1)) * 100, 100)}%` }}
                />
              </div>
              <span className="w-20 sm:w-24 shrink-0 text-right text-xs sm:text-sm font-bold">{formatCurrecy(t.total)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Sin datos para este año</p>
      )
    }

    if (period === 'monthly') {
      return (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAY_NAMES.map((n) => (
            <div key={n} className="text-center text-xs font-bold text-gray-500 mb-1">{n}</div>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {monthCells.map((cell) => (
            <div
              key={cell.day}
              className={`rounded-lg p-1 sm:p-2 border text-center ${
                cell.total > 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-transparent'
              }`}
            >
              <div className={`text-xs font-bold ${cell.total > 0 ? 'text-blue-900' : 'text-gray-500'}`}>
                {cell.day}
              </div>
              {cell.total > 0 ? (
                <div className="text-[8px] sm:text-[10px] font-bold text-blue-700 mt-1 truncate">{formatCurrecy(cell.total)}</div>
              ) : (
                <div className="text-[8px] sm:text-[10px] text-gray-300 mt-1">—</div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (period === 'weekly') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {weekDays.map((w, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 border text-center ${
                w.total > 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-transparent'
              }`}
            >
              <div className="text-xs font-bold text-gray-500">{WEEKDAY_NAMES[w.weekday]}</div>
              <div
                className={`mx-auto mt-2 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  w.total > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-gray-400'
                }`}
              >
                {w.day}
              </div>
              <div className={`mt-2 text-[10px] font-semibold ${w.total > 0 ? 'text-blue-700' : 'text-gray-300'}`}>
                {w.total > 0 ? formatCurrecy(w.total) : '—'}
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[500px] sm:min-w-0">
        <div className="flex items-end gap-[2px] h-44">
          {Array.from({ length: 24 }, (_, h) => {
            const v = hourly.get(h)
            const pct = v ? Math.max((v.total / maxHourly) * 100, 4) : 0
            return (
              <div key={h} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span className={`text-[9px] font-bold ${v ? 'text-blue-700' : 'text-transparent'}`}>
                  {v?.count ?? ''}
                </span>
                <div className="relative w-full bg-slate-100 rounded-t-sm" style={{ height: '100%' }}>
                  {v && (
                    <div
                      className="absolute bottom-0 w-full bg-blue-600 rounded-t-sm"
                      style={{ height: `${pct}%` }}
                      title={`${h}:00 — ${formatCurrecy(v.total)} (${v.count} gastos)`}
                    />
                  )}
                </div>
                <span className="text-[9px] text-gray-400">{h % 3 === 0 ? `${h}h` : ''}</span>
              </div>
            )
          })}
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          {totalDayCount > 0
            ? `${totalDayCount} gastos el día ${selectedDay} por un total de ${formatCurrecy(totalDay)}.${
                paidDayTotal > 0 ? ` Incluye ${formatCurrecy(paidDayTotal)} en gastos fijos pagados.` : ''
              }`
            : paidDayTotal > 0
              ? `Hay ${formatCurrecy(paidDayTotal)} en gastos fijos pagados el día ${selectedDay}, sin gastos puntuales.`
              : 'Sin gastos registrados este día.'}
        </p>
        </div>
      </div>
    )
  }

  if (loading) return <p className="text-center py-8 text-gray-500">Cargando estadísticas...</p>

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm uppercase ${
                  period === p ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {p === 'daily' ? 'Diario' : p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensual' : 'Anual'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            {period === 'daily' && (
              <select
                className="w-full bg-slate-100 p-2 border rounded"
                value={selectedDay}
                onChange={(e) => setDay(Number(e.target.value))}
              >
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            )}
            <select
              className="w-full bg-slate-100 p-2 border rounded"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              className="w-full bg-slate-100 p-2 border rounded sm:w-20"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2020}
              max={2100}
            />
          </div>
        </div>

        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Presupuesto</p>
              <p className="text-2xl font-black text-blue-600">{formatCurrecy(overview.budgeted)}</p>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Gastado</p>
              <p className="text-2xl font-black text-green-600">{formatCurrecy(overviewSpent)}</p>
              {paidFixed && paidFixed.total > 0 && (
                <p className="text-xs text-gray-500 mt-1">Incluye {formatCurrecy(paidFixed.total)} en fijos pagados</p>
              )}
            </div>
            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Disponible</p>
              <p className="text-2xl font-black text-orange-600">{formatCurrecy(overviewRemaining)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Distribución por Categoría</h3>
            <CategoryPieChart data={mergedCategoryData} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Tendencia de Gastos</h3>
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendLineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={12} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
                  />
                  <Tooltip formatter={(value) => [formatCurrecy(Number(value)), 'Gastos']} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Gastos"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Sin datos para mostrar</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">{trendTitle}</h3>
        {renderTrend()}
      </div>
    </div>
  )
}
