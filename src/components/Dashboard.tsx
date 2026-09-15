import { useState } from 'react'
import SalarySection from './SalarySection'
import ExpenseTemplates from './ExpenseTemplates'
import CategoryManager from './CategoryManager'
import CalendarView from './CalendarView'
import Statistics from './Statistics'
import { useBudget } from '../hooks/useBudget'
import PaymentStatusBadge from './PaymentStatusBadge'
import { useTranslation } from 'react-i18next'
import { formatCurrecy, formatDate } from '../helpers'

type Tab = 'resumen' | 'plantillas' | 'categorias' | 'calendario' | 'estadisticas'

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('resumen')
  const { state, totalExpense, reminderBudget } = useBudget()
  const { t } = useTranslation()
  const now = new Date()
  const percentage = state.budget > 0 ? +((totalExpense / state.budget) * 100).toFixed(2) : 0

  const tabs: { id: Tab; label: string }[] = [
    { id: 'resumen', label: t('dashboard.tabs.summary') },
    { id: 'plantillas', label: t('dashboard.tabs.templates') },
    { id: 'categorias', label: t('dashboard.tabs.categories') },
    { id: 'calendario', label: t('dashboard.tabs.calendar') },
    { id: 'estadisticas', label: t('dashboard.tabs.statistics') },
  ]

  const recentExpenses = [...state.expenses]
    .sort((a, b) => {
      const da = a.date instanceof Date ? a.date : new Date(String(a.date))
      const db = b.date instanceof Date ? b.date : new Date(String(b.date))
      return db.getTime() - da.getTime()
    })
    .slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SalarySection />

        <div className="bg-white shadow-lg rounded-lg p-6">
           <h3 className="text-xl font-bold mb-4">{t('dashboard.quickSummary')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
               <span>{t('dashboard.budget')}:</span>
               <span className="font-bold">{formatCurrecy(state.budget)}</span>
            </div>
            <div className="flex justify-between">
               <span>{t('dashboard.spent')}:</span>
               <span className="font-bold text-blue-600">{formatCurrecy(totalExpense)}</span>
            </div>
            <div className="flex justify-between">
               <span>{t('dashboard.available')}:</span>
              <span className={`font-bold ${reminderBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrecy(reminderBudget)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full mt-2">
              <div
                className={`h-3 rounded-full ${percentage >= 100 ? 'bg-red-600' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">{percentage}% {t('dashboard.used')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex border-b">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-center font-bold text-sm uppercase transition-colors ${
                tab === t.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* RESUMEN */}
        <div className="p-6">
          {tab === 'resumen' && (
            <div>
              {recentExpenses.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-bold text-lg mb-3">{t('dashboard.latest')}</h4>
                  {recentExpenses.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                      <div>
                        <p className="font-semibold">{exp.expenseName}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {exp.date instanceof Date
                               ? formatDate(exp.date.toISOString())
                               : formatDate(String(exp.date))}
                          </span>
                          <PaymentStatusBadge status={exp.status || 'pending'} partialAmount={exp.partialAmount} />
                        </div>
                      </div>
                      <p className="text-lg font-black text-blue-600">{formatCurrecy(exp.amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                   <p className="text-lg">{t('dashboard.welcome')}</p>
                   <p className="text-sm">{t('dashboard.explore')}</p>
                </div>
              )}
            </div>
          )}
          {tab === 'plantillas' && <ExpenseTemplates />}
          {tab === 'categorias' && <CategoryManager />}
          {tab === 'calendario' && <CalendarView year={now.getFullYear()} month={now.getMonth() + 1} />}
          {tab === 'estadisticas' && <Statistics />}
        </div>
      </div>
    </div>
  )
}
