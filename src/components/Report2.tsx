import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { statsApi, expensesApi } from '../api'
import type { OverviewResponse, CategoryBreakdown, DailyData, MonthlyTrend, YearlyStats } from '../api/stats'
import { useCategories } from '../hooks/useCategories'
import { useRevealMotion } from '../hooks/useMotion'
import { formatCurrecy } from '../helpers'
import { downloadCsv, toCsv } from '../helpers/csv'
import { BUDGET_STATUS, budgetLevel } from '../helpers/budget'
import '../styles/ui-tokens.css'
import '../i18n/reportsPageResources'
import AllTransactionsModal from './AllTransactionsModal'
import CategoryIcon from './CategoryIcon'
import DetailedBreakdownReport from './DetailedBreakdownReport'
import AddNewTrasaction from './expense/AddNewTransaction'
import ActionMenu from './ui/ActionMenu'
import ActivityList, { type ActivityItem } from './ui/ActivityList'
import AnimatedValue from './ui/AnimatedValue'
import BarChart, { type BarChartItem } from './ui/BarChart'
import Button from './ui/Button'
import Card from './ui/Card'
import DataTable, { type DataTableColumn } from './ui/DataTable'
import EmptyState from './ui/EmptyState'
import KpiCard from './ui/KpiCard'
import MeterBar from './ui/MeterBar'
import MetricRow from './ui/MetricRow'
import PageHeader from './ui/PageHeader'
import PeriodPicker from './ui/PeriodPicker'
import Skeleton from './ui/Skeleton'
import Sparkline from './ui/Sparkline'
import StatusBadge, { type StatusTone } from './ui/StatusBadge'

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

const PACE_TEXT = { fast: 'text-ui-warning', steady: 'text-ui-fg', slow: 'text-ui-success' } as const
const PACE_LABEL = {
  fast: 'reportsPage.pace.fast',
  steady: 'reportsPage.pace.steady',
  slow: 'reportsPage.pace.slow',
} as const

type Pace = keyof typeof PACE_TEXT

function paceOf(dailyRate: number): Pace {
  if (dailyRate > 5) return 'fast'
  if (dailyRate > 3) return 'steady'
  return 'slow'
}

function directionOf(current: number, previous: number): { tone: StatusTone; icon: string } {
  if (current > previous) return { tone: 'warning', icon: 'trending_up' }
  if (current < previous) return { tone: 'success', icon: 'trending_down' }
  return { tone: 'neutral', icon: 'trending_flat' }
}

function monthlyValues(trend: Map<number, number>) {
  return Array.from({ length: 12 }, (_, index) => trend.get(index + 1) ?? 0)
}

function cumulative(values: number[]) {
  return values.reduce<number[]>((acc, value) => [...acc, (acc[acc.length - 1] ?? 0) + value], [])
}

export default function Report2() {
  const now = new Date()
  const today = now.getDate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language
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
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [showNewTransaction, setShowNewTransaction] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const { categories } = useCategories()

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const isCurrent = now.getFullYear() === selectedYear && now.getMonth() + 1 === selectedMonth
  const daysElapsed = isCurrent ? now.getDate() : daysInMonth
  const daysRemaining = daysInMonth - daysElapsed

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
        setError(false)
        setUpdatedAt(new Date())
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [selectedMonth, selectedYear, refreshKey])

  const hasData = overview !== null
  const showError = error && !loading
  const showSkeleton = !hasData && loading
  const showContent = hasData && !showError

  const totalSpent = overview?.totalSpent ?? 0
  const budgeted = overview?.budgeted ?? 0
  const budgetPct = budgeted > 0 ? Math.round((totalSpent / budgeted) * 100) : 0
  const avgDaily = daysElapsed > 0 ? totalSpent / daysElapsed : 0
  const predictedEom = avgDaily * daysInMonth
  const dailyRate = budgeted > 0 ? ((totalSpent / daysElapsed) / budgeted) * 100 : 0
  const budgetStatus = BUDGET_STATUS[budgetLevel(totalSpent, budgeted)]
  const pace = paceOf(dailyRate)

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
  const monthDirection = directionOf(totalSpent, prevMonthTotal)

  const yearToDate = yearlyStats?.total ?? 0
  const prevYearTotal = prevYearStats?.total ?? 0
  const yearlyChange = prevYearTotal > 0 ? ((yearToDate - prevYearTotal) / prevYearTotal) * 100 : 0
  const yearDirection = directionOf(yearToDate, prevYearTotal)

  const formats = useMemo(
    () => ({
      percentDelta: new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }),
      percent: new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 1 }),
      percentInt: new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 0 }),
      monthName: new Intl.DateTimeFormat(lang, { month: 'long' }),
      shortDay: new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric' }),
      longDay: new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }),
      shortDate: new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' }),
      time: new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hour12: false }),
      csvAmount: new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }),
      csvPercent: new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: false }),
    }),
    [lang],
  )

  const weekDays = useMemo(() => {
    const byDay = new Map<number, number>()
    dailyData.forEach((d) => byDay.set(d.day, d.total))

    const anchorDate = new Date(selectedYear, selectedMonth - 1, isCurrent ? today : daysInMonth)
    const monday = new Date(anchorDate)
    monday.setDate(anchorDate.getDate() - ((anchorDate.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      const inMonth = date.getMonth() === selectedMonth - 1
      return { date, inMonth, total: inMonth ? (byDay.get(date.getDate()) ?? 0) : 0 }
    })
  }, [dailyData, isCurrent, today, daysInMonth, selectedYear, selectedMonth])

  const weekTotal = weekDays.reduce((sum, day) => sum + day.total, 0)
  const weekMax = Math.max(0, ...weekDays.map((day) => day.total))
  const weekRangeLabel = t('reportsPage.weekly.range', {
    from: formats.shortDate.format(weekDays[0].date),
    to: formats.shortDate.format(weekDays[6].date),
  })

  const chartItems: BarChartItem[] = weekDays.map((day) => {
    const dayLong = formats.longDay.format(day.date)
    let displayValue: string | undefined
    if (day.inMonth) displayValue = day.total > 0 ? formatCurrecy(day.total) : '—'
    return {
      id: String(day.date.getTime()),
      label: formats.shortDay.format(day.date),
      srLabel: day.inMonth
        ? `${dayLong}: ${formatCurrecy(day.total)}`
        : `${dayLong}: ${t('reportsPage.weekly.outsideMonth')}`,
      value: day.total,
      displayValue,
      disabled: !day.inMonth,
      highlighted: isCurrent && day.inMonth && day.date.getDate() === today,
    }
  })

  const mergedCategoryBreakdown = useMemo(() => categoryBreakdown.filter((c) => c.total > 0), [categoryBreakdown])

  const sortedByValue = useMemo(
    () => [...mergedCategoryBreakdown].sort((a, b) => b.total - a.total),
    [mergedCategoryBreakdown],
  )

  const categoriesTotal = sortedByValue.reduce((sum, c) => sum + c.total, 0)
  const categoriesCount = sortedByValue.reduce((sum, c) => sum + c.count, 0)

  const getCategoryInfo = (categoryId: string) => categories.find((c) => c.id === categoryId)

  const monthlySeries = monthlyValues(currentTrendByMonth)
  const monthsElapsedInYear = selectedYear === now.getFullYear() ? now.getMonth() + 1 : 12
  const ytdCurrent = cumulative(monthlySeries.slice(0, monthsElapsedInYear))
  const ytdPrevious = cumulative(monthlyValues(prevTrendByMonth))

  const activityItems: ActivityItem[] = recentExpenses.map((expense) => {
    const category = getCategoryInfo(expense.category)
    return {
      id: expense.id,
      icon: category
        ? <CategoryIcon icon={category.icon} color={category.color} name={category.name} size="sm" />
        : undefined,
      title: expense.expenseName,
      meta: `${category?.name || expense.category} · ${formats.shortDate.format(expense.date)}`,
      value: `${expense.amount >= 0 ? '-' : '+'}${formatCurrecy(Math.abs(expense.amount))}`,
    }
  })

  const revealKey = loading || !updatedAt ? '' : `${selectedYear}-${selectedMonth}-${updatedAt.getTime()}`
  useRevealMotion(contentRef, revealKey)

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
            <div className="w-20 sm:w-24">
              <MeterBar value={share * 100} />
            </div>
            <span className="w-14 text-right">{formats.percent.format(share)}</span>
          </div>
        )
      },
      footer: formats.percent.format(categoriesTotal > 0 ? 1 : 0),
    },
    {
      key: 'count',
      header: t('reportsPage.table.count'),
      align: 'right',
      cell: (row) => row.count,
      footer: categoriesCount,
    },
  ]

  const handleExportCsv = () => {
    if (sortedByValue.length === 0) return
    const separator = formats.csvPercent.formatToParts(1.5).find((part) => part.type === 'decimal')?.value === ','
      ? ';'
      : ','
    const rows = [
      [
        t('reportsPage.table.category'),
        t('reportsPage.table.amount'),
        t('reportsPage.table.share'),
        t('reportsPage.table.count'),
      ],
      ...sortedByValue.map((cat) => [
        getCategoryInfo(cat.category)?.name || cat.category,
        formats.csvAmount.format(cat.total),
        formats.csvPercent.format((cat.total / categoriesTotal) * 100),
        String(cat.count),
      ]),
      [
        t('reportsPage.table.total'),
        formats.csvAmount.format(categoriesTotal),
        formats.csvPercent.format(100),
        String(categoriesCount),
      ],
    ]
    downloadCsv(
      `gastos-por-categoria-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`,
      toCsv(rows, separator),
    )
  }

  const actions = (
    <>
      <div className="hidden items-center gap-2 md:flex">
        <Button variant="secondary" icon="summarize" onClick={() => setShowBreakdown(true)}>
          {t('reportsPage.actions.detailed')}
        </Button>
        <Button variant="secondary" icon="download" onClick={handleExportCsv} disabled={sortedByValue.length === 0}>
          {t('reportsPage.actions.exportCsv')}
        </Button>
      </div>
      <div className="md:hidden">
        <ActionMenu
          label={t('reportsPage.actions.more')}
          items={[
            {
              key: 'detailed',
              label: t('reportsPage.actions.detailed'),
              icon: 'summarize',
              onSelect: () => setShowBreakdown(true),
            },
            {
              key: 'export',
              label: t('reportsPage.actions.exportCsv'),
              icon: 'download',
              onSelect: handleExportCsv,
            },
          ]}
        />
      </div>
      <Button variant="primary" icon="add" onClick={() => setShowNewTransaction(true)}>
        {t('reportsPage.actions.newTransaction')}
      </Button>
    </>
  )

  const addTransactionAction = (
    <Button variant="primary" icon="add" onClick={() => setShowNewTransaction(true)}>
      {t('reportsPage.actions.newTransaction')}
    </Button>
  )

  return (
    <div className="min-h-screen bg-ui-canvas text-ui-fg">
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <PageHeader
          title={t('reportsPage.title')}
          meta={updatedAt ? t('reportsPage.updatedAt', { time: formats.time.format(updatedAt) }) : undefined}
          controls={
            <PeriodPicker
              month={selectedMonth}
              year={selectedYear}
              years={YEARS}
              formatMonth={(month) => formats.monthName.format(new Date(selectedYear, month - 1, 1))}
              labels={{
                month: t('reportsPage.period.month'),
                year: t('reportsPage.period.year'),
                previous: t('reportsPage.period.previous'),
                next: t('reportsPage.period.next'),
              }}
              onChange={(period) => {
                setSelectedMonth(period.month)
                setSelectedYear(period.year)
              }}
            />
          }
          actions={actions}
        />

        <p role="status" className="sr-only">
          {loading ? t('reportsPage.loading') : ''}
        </p>

        {showError && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ui-border bg-ui-surface p-5"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-ui-danger">
                error
              </span>
              <p className="text-ui-body font-medium text-ui-fg">{t('reportsPage.error.title')}</p>
            </div>
            <Button variant="secondary" icon="refresh" onClick={() => setRefreshKey((key) => key + 1)}>
              {t('reportsPage.error.retry')}
            </Button>
          </div>
        )}

        {showSkeleton && (
          <div aria-busy="true" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-[136px]" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="flex flex-col gap-4 xl:col-span-8">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[320px]" />
              </div>
              <div className="flex flex-col gap-4 xl:col-span-4">
                <Skeleton className="h-[260px]" />
                <Skeleton className="h-[360px]" />
              </div>
            </div>
          </div>
        )}

        {showContent && (
          <div
            ref={contentRef}
            aria-busy={loading}
            className={`flex flex-col gap-4 transition-opacity duration-200 ${loading ? 'opacity-60' : ''}`}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" style={{ perspective: '1200px' }}>
              <KpiCard
                label={t('reportsPage.kpi.totalSpent')}
                value={<AnimatedValue value={totalSpent} format={formatCurrecy} reveal={revealKey} />}
                badge={
                  prevMonthTotal > 0 ? (
                    <StatusBadge tone={monthDirection.tone} icon={monthDirection.icon}>
                      {formats.percentDelta.format(monthlyChange / 100)}
                    </StatusBadge>
                  ) : undefined
                }
                footer={prevMonthTotal > 0 ? t('reportsPage.kpi.vsPrevMonth') : t('reportsPage.kpi.noPrevMonth')}
              />
              <KpiCard
                label={t('reportsPage.kpi.avgDaily')}
                value={<AnimatedValue value={avgDaily} format={formatCurrecy} reveal={revealKey} />}
                footer={
                  budgeted > 0
                    ? t('reportsPage.kpi.dailyShare', { value: formats.percent.format(dailyRate / 100) })
                    : t('reportsPage.kpi.noBudget')
                }
              />
              <KpiCard
                label={t('reportsPage.kpi.budgetUsage')}
                value={formats.percentInt.format(budgetPct / 100)}
                badge={
                  <StatusBadge tone={budgetStatus.tone} icon={budgetStatus.icon}>
                    {t(budgetStatus.label)}
                  </StatusBadge>
                }
                meter={
                  <MeterBar
                    value={Math.min(budgetPct, 100)}
                    tone={budgetStatus.tone}
                    label={t('reportsPage.kpi.budgetUsage')}
                  />
                }
                footer={
                  budgeted > 0
                    ? t('reportsPage.kpi.budgetOf', { spent: formatCurrecy(totalSpent), budget: formatCurrecy(budgeted) })
                    : t('reportsPage.kpi.noBudget')
                }
              />
              <KpiCard
                label={t('reportsPage.kpi.velocity')}
                value={budgeted > 0 ? <span className={PACE_TEXT[pace]}>{t(PACE_LABEL[pace])}</span> : '—'}
                footer={
                  budgeted > 0
                    ? t('reportsPage.kpi.paceNote', { value: formats.percent.format(dailyRate / 100) })
                    : t('reportsPage.kpi.noBudget')
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="flex min-w-0 flex-col gap-4 xl:col-span-8">
                <Card
                  eyebrow={t('reportsPage.weekly.title')}
                  title={weekRangeLabel}
                  titleId="report-weekly-title"
                  actions={
                    <div className="text-right">
                      <p className="text-ui-caption text-ui-fg-muted">{t('reportsPage.weekly.total')}</p>
                      <p className="text-ui-body font-semibold tabular-nums text-ui-fg">{formatCurrecy(weekTotal)}</p>
                    </div>
                  }
                >
                  {weekTotal === 0 && (
                    <p className="mb-3 text-ui-caption text-ui-fg-muted">{t('reportsPage.weekly.empty')}</p>
                  )}
                  <BarChart
                    items={chartItems}
                    max={weekMax}
                    ariaLabel={t('reportsPage.weekly.chartLabel')}
                    formatAxis={formatCurrecy}
                  />
                </Card>

                <Card title={t('reportsPage.table.title')} titleId="report-table-title">
                  <DataTable
                    caption={t('reportsPage.table.caption')}
                    columns={categoryColumns}
                    rows={sortedByValue}
                    getRowKey={(row) => row.category}
                    empty={
                      <EmptyState
                        icon="donut_small"
                        title={t('reportsPage.table.empty')}
                        action={addTransactionAction}
                      />
                    }
                  />
                </Card>
              </div>

              <div className="flex min-w-0 flex-col gap-4 xl:col-span-4">
                <Card title={t('reportsPage.compare.title')} titleId="report-compare-title">
                  <MetricRow
                    label={t('reportsPage.compare.month')}
                    value={formatCurrecy(totalSpent)}
                    badge={
                      prevMonthTotal > 0 ? (
                        <StatusBadge tone={monthDirection.tone} icon={monthDirection.icon}>
                          {formats.percentDelta.format(monthlyChange / 100)}
                        </StatusBadge>
                      ) : undefined
                    }
                    note={
                      prevMonthTotal > 0
                        ? t('reportsPage.compare.prevMonth', { amount: formatCurrecy(prevMonthTotal) })
                        : t('reportsPage.kpi.noPrevMonth')
                    }
                    visual={
                      <Sparkline series={[{ values: monthlySeries, tone: 'accent' }]} highlightIndex={selectedMonth - 1} />
                    }
                  />
                  <MetricRow
                    label={t('reportsPage.compare.year')}
                    value={formatCurrecy(yearToDate)}
                    badge={
                      prevYearTotal > 0 ? (
                        <StatusBadge tone={yearDirection.tone} icon={yearDirection.icon}>
                          {formats.percentDelta.format(yearlyChange / 100)}
                        </StatusBadge>
                      ) : undefined
                    }
                    note={
                      prevYearTotal > 0
                        ? t('reportsPage.compare.prevYear', { amount: formatCurrecy(prevYearTotal) })
                        : t('reportsPage.compare.noPrevYear')
                    }
                    visual={
                      <Sparkline
                        series={[
                          { values: ytdCurrent, tone: 'accent' },
                          { values: ytdPrevious, tone: 'muted' },
                        ]}
                      />
                    }
                  />
                  <MetricRow
                    label={t('reportsPage.compare.forecast')}
                    value={formatCurrecy(predictedEom)}
                    note={
                      daysRemaining > 0
                        ? t('reportsPage.compare.forecastNote', { count: daysRemaining })
                        : t('reportsPage.compare.monthClosed')
                    }
                  />
                </Card>

                <Card title={t('reportsPage.activity.title')} titleId="report-activity-title">
                  {activityItems.length > 0 ? (
                    <>
                      <ActivityList items={activityItems} />
                      <div className="mt-3 border-t border-ui-border pt-3">
                        <Button
                          variant="ghost"
                          icon="list_alt"
                          className="w-full"
                          onClick={() => setShowAllTransactions(true)}
                        >
                          {t('reportsPage.activity.viewAll')}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      icon="receipt_long"
                      title={t('reportsPage.activity.empty')}
                      action={addTransactionAction}
                    />
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <DetailedBreakdownReport
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        month={selectedMonth}
        year={selectedYear}
      />
      <AllTransactionsModal
        isOpen={showAllTransactions}
        onClose={() => setShowAllTransactions(false)}
        month={selectedMonth}
        year={selectedYear}
      />
      <AddNewTrasaction
        isOpen={showNewTransaction}
        onClose={() => setShowNewTransaction(false)}
        onExpenseCreated={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}
