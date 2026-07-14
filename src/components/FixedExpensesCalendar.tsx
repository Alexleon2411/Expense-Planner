import { useState, useMemo } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { FixedExpense } from '../types'

interface Props {
  fixedExpenses: FixedExpense[]
  onMarkAsPaid: (templateId: string, itemId: string) => void
  selectedMonth: number
  selectedYear: number
}

interface DayInfo {
  day: number
  expenses: FixedExpense[]
  totalAmount: number
  paidCount: number
  pendingCount: number
}

export default function FixedExpensesCalendar({ fixedExpenses, onMarkAsPaid, selectedMonth, selectedYear }: Props) {
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
      <div className="text-xs mt-1 space-y-0.5">
        <div
          className="rounded px-1 py-0.5 font-bold"
          style={{
            backgroundColor: allPaid
              ? 'rgba(34, 197, 94, 0.3)'
              : allPending
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(234, 179, 8, 0.3)',
            fontSize: '10px',
          }}
        >
          {data.expenses.length} expense{data.expenses.length > 1 ? 's' : ''}
        </div>
        {data.totalAmount > 0 && (
          <div className="text-primary font-data-mono" style={{ fontSize: '10px' }}>
            ${data.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        )}
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

      <Calendar
        tileContent={tileContent}
        onClickDay={handleDayClick}
        activeStartDate={new Date(selectedYear, selectedMonth - 1)}
        view="month"
        locale="en-US"
        className="fixed-expenses-calendar"
      />

      {selectedDay && selectedDay.expenses.length > 0 && (
        <div className="mt-4 bg-surface-container rounded-lg p-4">
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

          <div className="space-y-2">
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
                  <span className={`material-symbols-outlined ${
                    expense.status === 'paid' ? 'text-green-500' : expense.status === 'partial' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {expense.status === 'paid' ? 'check_circle' : expense.status === 'partial' ? 'pending' : 'schedule'}
                  </span>
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
