import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { statsApi, expensesApi } from '../api'
import type { OverviewResponse, CategoryBreakdown, DailyData } from '../api/stats'
import type { ExpenseResponse } from '../api/expenses'
import { useCategories } from '../hooks/useCategories'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { formatCurrecy } from '../helpers'
import { BUDGET_STATUS, budgetLevel } from '../helpers/budget'
import { buildTransactions } from '../helpers/transactions'
import '../i18n/reportsPageResources'
import AllTransactions from './AllTransactions'
import CategoryIcon from './CategoryIcon'
import Button from './ui/Button'
import Card from './ui/Card'
import DataTable, { type DataTableColumn } from './ui/DataTable'
import DialogShell from './ui/DialogShell'
import EmptyState from './ui/EmptyState'
import KpiCard from './ui/KpiCard'
import MeterBar from './ui/MeterBar'
import Skeleton from './ui/Skeleton'
import StatusBadge from './ui/StatusBadge'

interface DetailedBreakdownReportProps {
  isOpen: boolean
  onClose: () => void
  month: number
  year: number
}

export default function DetailedBreakdownReport({ isOpen, onClose, month, year }: DetailedBreakdownReportProps) {
  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  const { categories } = useCategories()
  const { fixedExpenses } = useFixedExpenses()
  const { t, i18n } = useTranslation()
  const monthLabel = new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(new Date(year, month - 1, 1))
  const dayFormat = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' }),
    [i18n.language],
  )
  const shareFormat = useMemo(
    () => new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 1 }),
    [i18n.language],
  )
  const percentFormat = useMemo(
    () => new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 0 }),
    [i18n.language],
  )

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

  const getCategoryInfo = (categoryId: string) => categories.find((c) => c.id === categoryId)

  const totalSpent = overview?.totalSpent ?? 0
  const totalCount = overview?.totalExpenses ?? 0
  const budgeted = overview?.budgeted ?? 0
  const budgetPct = budgeted > 0 ? Math.round((totalSpent / budgeted) * 100) : 0
  const status = BUDGET_STATUS[budgetLevel(totalSpent, budgeted)]

  const mergedCategories = useMemo(() => {
    return [...categoryBreakdown]
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [categoryBreakdown])

  const categoriesTotal = mergedCategories.reduce((sum, c) => sum + c.total, 0)
  const categoriesCount = mergedCategories.reduce((sum, c) => sum + c.count, 0)

  const dayRows = useMemo(() => {
    return dailyData
      .map((d) => ({ day: d.day, total: d.total, count: d.count }))
      .sort((a, b) => a.day - b.day)
  }, [dailyData])

  const expensesForDay = (day: number) => {
    const regular = dailyData.find((d) => d.day === day)?.expenses ?? []
    return regular.map((e) => ({
      key: `${e.name}-${e.amount}`,
      name: e.name,
      amount: e.amount,
      category: e.category,
      isFixed: false,
    }))
  }

  const transactions = useMemo(
    () => buildTransactions(expenses, fixedExpenses, month, year),
    [expenses, fixedExpenses, month, year],
  )

  const categoryColumns: DataTableColumn<CategoryBreakdown>[] = [
    {
      key: 'category',
      header: t('reportsPage.table.category'),
      cell: (row) => {
        const info = getCategoryInfo(row.category)
        return (
          <div className="flex min-w-0 items-center gap-2">
            <CategoryIcon icon={info?.icon} color={info?.color} name={info?.name || row.category} size="sm" />
            <span className="truncate font-medium">{info?.name || row.category}</span>
          </div>
        )
      },
      footer: t('reportsPage.table.total'),
    },
    {
      key: 'amount',
      header: t('reportsPage.table.amount'),
      align: 'right',
      cell: (row) => formatCurrecy(row.total),
      footer: formatCurrecy(categoriesTotal),
    },
    {
      key: 'share',
      header: t('reportsPage.table.share'),
      align: 'right',
      cell: (row) => {
        const share = categoriesTotal > 0 ? row.total / categoriesTotal : 0
        return (
          <div className="flex items-center justify-end gap-3">
            <div className="w-20">
              <MeterBar value={share * 100} />
            </div>
            <span className="w-12 text-right">{shareFormat.format(share)}</span>
          </div>
        )
      },
      footer: shareFormat.format(categoriesTotal > 0 ? 1 : 0),
    },
    {
      key: 'count',
      header: t('reportsPage.table.count'),
      align: 'right',
      cell: (row) => row.count,
      footer: categoriesCount,
    },
  ]

  return (
    <DialogShell
      open={isOpen}
      onClose={onClose}
      size="xl"
      title={t('reportsPage.modal.detailedTitle')}
      subtitle={`${monthLabel} ${year}`}
      closeLabel={t('reportsPage.close')}
      footer={
        <>
          <p className="text-ui-caption tabular-nums text-ui-fg-muted">
            {t('reportsPage.modal.transactionsCount', { count: transactions.length })}
          </p>
          <Button variant="secondary" onClick={onClose}>
            {t('reportsPage.close')}
          </Button>
        </>
      }
    >
      {loading ? (
        <div aria-busy="true" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((card) => (
              <Skeleton key={card} className="h-[136px]" />
            ))}
          </div>
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label={t('reportsPage.kpi.totalSpent')} value={formatCurrecy(totalSpent)} />
            <KpiCard
              label={t('reportsPage.modal.transactions')}
              value={totalCount}
              footer={t('reportsPage.modal.categoriesCount', { count: mergedCategories.length })}
            />
            <KpiCard
              label={t('reportsPage.kpi.budgetUsage')}
              value={percentFormat.format(budgetPct / 100)}
              badge={
                <StatusBadge tone={status.tone} icon={status.icon}>
                  {t(status.label)}
                </StatusBadge>
              }
              meter={
                <MeterBar value={Math.min(budgetPct, 100)} tone={status.tone} label={t('reportsPage.kpi.budgetUsage')} />
              }
              footer={
                budgeted > 0
                  ? t('reportsPage.kpi.budgetOf', { spent: formatCurrecy(totalSpent), budget: formatCurrecy(budgeted) })
                  : t('reportsPage.kpi.noBudget')
              }
            />
            <KpiCard
              label={t('reportsPage.modal.average')}
              value={formatCurrecy(totalCount > 0 ? totalSpent / totalCount : 0)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card title={t('reportsPage.table.title')} titleId="detailed-categories-title" className="lg:col-span-7">
              <DataTable
                caption={t('reportsPage.table.caption')}
                columns={categoryColumns}
                rows={mergedCategories}
                getRowKey={(row) => row.category}
                empty={<EmptyState icon="donut_small" title={t('reportsPage.table.empty')} />}
              />
            </Card>

            <Card title={t('reportsPage.modal.byDay')} titleId="detailed-days-title" className="lg:col-span-5">
              {dayRows.length === 0 ? (
                <EmptyState icon="calendar_month" title={t('reportsPage.table.empty')} />
              ) : (
                <div className="flex max-h-[360px] flex-col overflow-y-auto">
                  {dayRows.map((row) => {
                    const dayExpenses = expensesForDay(row.day)
                    const isExpanded = expandedDay === row.day
                    const panelId = `detailed-day-${row.day}`
                    return (
                      <div key={row.day} className="border-b border-ui-border last:border-b-0">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={isExpanded ? panelId : undefined}
                          onClick={() => setExpandedDay(isExpanded ? null : row.day)}
                          className="flex min-h-[56px] w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-ui-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ui-elevated text-ui-body font-semibold tabular-nums text-ui-fg">
                            {row.day}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-ui-body font-medium text-ui-fg">
                              {dayFormat.format(new Date(year, month - 1, row.day))}
                            </span>
                            <span className="block text-ui-caption tabular-nums text-ui-fg-muted">
                              {t('reportsPage.modal.transactionsCount', { count: row.count })}
                            </span>
                          </span>
                          <span className="shrink-0 text-ui-body font-semibold tabular-nums text-ui-fg">
                            {formatCurrecy(row.total)}
                          </span>
                          <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[18px] text-ui-fg-muted">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                        {isExpanded && (
                          <ul id={panelId} className="flex flex-col gap-1 pb-3 pl-14 pr-2">
                            {dayExpenses.length === 0 && (
                              <li className="text-ui-caption text-ui-fg-muted">{t('reportsPage.modal.noDayExpenses')}</li>
                            )}
                            {dayExpenses.map((expense) => {
                              const info = getCategoryInfo(expense.category)
                              return (
                                <li key={expense.key} className="flex items-center gap-2 py-1">
                                  <CategoryIcon
                                    icon={info?.icon}
                                    color={info?.color}
                                    name={info?.name || expense.category}
                                    size="sm"
                                  />
                                  <span className="min-w-0 flex-1 truncate text-ui-body">{expense.name}</span>
                                  {expense.isFixed && (
                                    <StatusBadge icon="event_repeat">{t('reportsPage.type.fixed')}</StatusBadge>
                                  )}
                                  <span className="shrink-0 text-ui-body tabular-nums text-ui-fg">
                                    {formatCurrecy(expense.amount)}
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          <Card title={t('reportsPage.modal.allTitle')} titleId="detailed-transactions-title">
            <AllTransactions transactions={transactions} />
          </Card>
        </div>
      )}
    </DialogShell>
  )
}
