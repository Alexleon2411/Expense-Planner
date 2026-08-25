import { useState, useEffect, useMemo } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { statsApi } from '../api'
import { useBudget } from '../hooks/useBudget'

interface DailyData {
  day: number
  total: number
  count: number
  categories: Record<string, number>
  expenses?: { name: string; amount: number; category: string }[]
}

interface Props {
  year: number
  month: number
}

export default function CalendarView({ year, month }: Props) {
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [selectedDay, setSelectedDay] = useState<DailyData | null>(null)
  const { state } = useBudget()

  const localDailyData = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const daily = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dayExpenses = state.expenses.filter((e) => {
        if (!e.date) return false
        const d = e.date instanceof Date ? e.date : new Date(String(e.date))
        return d.getDate() === day && d.getMonth() === month - 1 && d.getFullYear() === year
      })
      const categories: Record<string, number> = {}
      for (const exp of dayExpenses) {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount
      }
      return {
        day,
        total: dayExpenses.reduce((s, e) => s + e.amount, 0),
        count: dayExpenses.length,
        categories,
        expenses: dayExpenses.map((e) => ({ name: e.expenseName, amount: e.amount, category: e.category })),
      }
    })
    return daily
  }, [state.expenses, year, month])

  const effectiveData = dailyData.length > 0
    ? dailyData.map((apiDay, i) => ({
        ...apiDay,
        total: apiDay.total + localDailyData[i]?.total || 0,
        count: apiDay.count + localDailyData[i]?.count || 0,
        categories: { ...localDailyData[i]?.categories, ...apiDay.categories },
      }))
    : localDailyData

  useEffect(() => {
    statsApi.getDailyStats(year, month).then(setDailyData).catch(() => setDailyData([]))
  }, [year, month])

  const tileContent = ({ date }: { date: Date }) => {
    const day = date.getDate()
    const data = effectiveData.find((d) => d.day === day)
    if (!data || data.total === 0) return null

    const intensity = Math.min(data.total / 5000, 1)
    const bg = `rgba(52, 80, 109, ${intensity * 0.5 + 0.2})`

    return (
      <div className="text-xs font-bold mt-1" style={{ backgroundColor: bg, borderRadius: 4, padding: '0 2px' }}>
        ${data.total.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
      </div>
    )
  }

  const handleDayClick = (value: Date) => {
    const day = value.getDate()
    const data = effectiveData.find((d) => d.day === day) || null
    setSelectedDay(data)
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Calendario de Gastos</h3>
      <Calendar
        tileContent={tileContent}
        onClickDay={handleDayClick}
        activeStartDate={new Date(year, month - 1)}
        view="month"
        locale="es-MX"
      />
      {selectedDay && (
        <div className="mt-4 bg-slate-50 p-4 rounded-lg">
          <p className="font-bold text-lg">Día {selectedDay.day}</p>
          <p>Total: <span className="font-black text-blue-600">${selectedDay.total.toLocaleString('es-MX')}</span></p>
          <p>Gastos: {selectedDay.count}</p>
          {selectedDay.expenses && selectedDay.expenses.length > 0 && (
            <div className="mt-2 space-y-1">
              {selectedDay.expenses.map((exp, i) => (
                <div key={i} className="flex justify-between text-sm bg-white p-1 rounded">
                  <span>{exp.name}</span>
                  <span className="font-semibold">${exp.amount.toLocaleString('es-MX')}</span>
                </div>
              ))}
            </div>
          )}
          {Object.entries(selectedDay.categories).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(selectedDay.categories).map(([cat, val]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span>{cat}</span>
                  <span className="font-semibold">${val.toLocaleString('es-MX')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
