import { useState, useMemo } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { FixedExpense } from '../types'
import CategoryIcon from './CategoryIcon'

interface Props {
  fixedExpenses: FixedExpense[]
  onMarkAsPaid: (templateId: string, itemId: string) => void
  selectedMonth: number
  selectedYear: number
  trends?: { month: number; total: number }[]
  overview?: { totalSpent: number; budgeted: number; remaining: number; percentage: number } | null
}

interface DayInfo {
  day: number
  expenses: FixedExpense[]
  totalAmount: number
  paidCount: number
  pendingCount: number
}

export default function FixedExpensesCalendar({ fixedExpenses, onMarkAsPaid, selectedMonth, selectedYear, trends = [], overview = null }: Props) {
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null)

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
    const daily = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dayExpenses = fixedExpenses.filter((e) => e.dueDay === day)
      const paidCount = dayExpenses.filter((e) => e.status === 'paid').length
      const pendingCount = dayExpenses.filter((e) => e.status !== 'paid').length
      return {
        day,
        expenses: dayExpenses,
        totalAmount: dayExpenses.reduce((s, e) => s + e.amount, 0),
        paidCount,
        pendingCount,
      }
    })
    return daily
  }, [fixedExpenses, selectedYear, selectedMonth])

  const tileContent = ({ date }: { date: Date }) => {
    const day = date.getDate()
    const data = dailyData.find((d) => d.day === day)
    if (!data || data.expenses.length === 0) return null

    const allPaid = data.pendingCount === 0
    const allPending = data.paidCount === 0

    return (
      <div className="text-xs mt-1 space-y-0.5 w-[100%]">
        <div
          className="rounded w-[100%] py-0.5 font-bold "
          style={{
            backgroundColor: allPaid
              ? 'rgba(0, 0, 0, 0.3)'
              : allPending
                ? 'rgba(0, 0, 0, 0.3)'
                : 'rgba(0, 0, 0, 0.3)',
            fontSize: '10px',
          }}
        >
          ${data.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
        {/* {data.totalAmount > 0 && (
          <div className="text-primary font-data-mono" style={{ fontSize: '10px' }}>
            ${data.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        )} */}
      </div>
    )
  }

  const handleDayClick = (value: Date) => {
    const day = value.getDate()
    const data = dailyData.find((d) => d.day === day) || null
    setSelectedDay(data)
  }

  return (
    <div className="bg-surface-container-lowest shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-headline-md font-headline-md text-on-surface">Fixed Expenses Calendar</h3>
        <div className="flex items-center space-x-md text-body-xs">
          <div className="flex items-center space-x-xs">
            <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500"></div>
            <span className="text-on-surface-variant">Paid</span>
          </div>
          <div className="flex items-center space-x-xs">
            <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500"></div>
            <span className="text-on-surface-variant">Pending</span>
          </div>
          <div className="flex items-center space-x-xs">
            <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500"></div>
            <span className="text-on-surface-variant">Mixed</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-sm items-start">
        <div className="order-2 md:order-1 w-full md:w-1/2 min-w-0 border rounded-md p-4">
          <Calendar
            tileContent={tileContent}
            onClickDay={handleDayClick}
            activeStartDate={new Date(selectedYear, selectedMonth - 1)}
            view="month"
            locale="es-ES"
            className="fixed-expenses-calendar"
          />
        </div>

        <div className="order-1 md:order-2 w-full md:w-1/2 min-w-0 mb-4 border p-4 rounded-md">
          <h4 className="text-headline-sm font-headline-sm text-on-surface mb-md">Monthly Trend</h4>
          {overview && (
            <div className="mb-md p-md bg-surface-container rounded-lg">
              <div className="flex items-center justify-between mb-xs">
                <span className="text-body-xs text-on-surface-variant">Budget used</span>
                <span className="text-body-sm font-data-mono text-on-surface">{overview.percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(overview.percentage, 100)}%`,
                    backgroundColor: overview.percentage > 90 ? '#ef4444' : overview.percentage > 70 ? '#eab308' : '#22c55e',
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-xs text-body-xs">
                <span className="text-on-surface-variant">Spent: <span className="font-data-mono text-on-surface">${overview.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span></span>
                <span className="text-on-surface-variant">Budget: <span className="font-data-mono text-on-surface">${overview.budgeted.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span></span>
              </div>
            </div>
          )}
          {trends.length > 0 ? (
            <div className="space-y-sm">
              {trends.map((t) => (
                <div key={t.month} className="flex items-center gap-sm">
                  <span className="w-16 text-body-xs text-on-surface-variant capitalize">
                    {new Date(0, t.month - 1).toLocaleString('en-US', { month: 'short' })}
                  </span>
                  <div className="flex-1 bg-surface-container h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((t.total / (overview?.budgeted || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-body-xs font-data-mono text-on-surface">${t.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant text-center py-md">No data for this year</p>
          )}
        </div>
      </div>

      {selectedDay && selectedDay.expenses.length > 0 && (
        <div className="order-3 mt-4 bg-surface-container rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-headline-sm text-on-surface">Day {selectedDay.day}</p>
            <div className="flex items-center space-x-sm text-body-sm">
              <span className="text-on-surface-variant">${selectedDay.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant">{selectedDay.paidCount} paid</span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface-variant">{selectedDay.pendingCount} pending</span>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedDay.expenses.map((expense) => (
              <div
                key={expense.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  expense.status === 'paid'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : expense.status === 'partial'
                      ? 'bg-yellow-500/10 border border-yellow-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                <div className="flex items-center space-x-sm">
                  <CategoryIcon
                    icon={expense.categoryIcon}
                    color={expense.categoryColor}
                    name={expense.category}
                    size="sm"
                  />
                  <div>
                    <p className="font-body-md text-on-surface">{expense.name}</p>
                    <p className="text-body-xs text-on-surface-variant">{expense.category}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-sm">
                  <span className="font-data-mono text-on-surface">${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  {expense.status !== 'paid' && (
                    <button
                      onClick={() => onMarkAsPaid(expense.templateId, expense.id)}
                      className="px-3 py-1 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity text-body-sm"
                    >
                      Pay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
