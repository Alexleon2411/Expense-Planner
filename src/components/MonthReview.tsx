import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getMonthReview, type MonthReviewResponse } from '../api/review'
import { formatCurrecy } from '../helpers'
import { useCategories } from '../hooks/useCategories'
import CategoryIcon from './CategoryIcon'

type Props = {
  month: number
  year: number
}

export default function MonthReview({ month, year }: Props) {
  const { t } = useTranslation()
  const { categories } = useCategories()
  const [review, setReview] = useState<MonthReviewResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getMonthReview(month, year)
      .then(setReview)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [month, year])

  const getCategoryInfo = (categoryIdOrName: string) => {
    if (!categoryIdOrName) return undefined
    return (
      categories.find(c => c.id === categoryIdOrName) ||
      categories.find(c => c.name.toLowerCase() === categoryIdOrName.toLowerCase())
    )
  }

  if (loading) {
    return (
      <div className="bento-card">
        <p className="text-body-sm text-on-surface-variant">{t('dashboard.loading')}</p>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="bento-card">
        <p className="text-body-sm text-on-surface-variant">{t('dashboard.noData')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-gutter">
      <div className="bento-card">
        <div className="flex justify-between items-start mb-md">
          <p className="text-label-caps font-label-caps text-on-surface-variant">{t('dashboard.monthReview')}</p>
          <span className={`material-symbols-outlined ${review.alerts.length > 0 ? 'text-error' : 'text-secondary'}`}>
            {review.alerts.length > 0 ? 'warning' : 'verified'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
          <div className="rounded-lg bg-surface-container-low p-md">
            <p className="text-label-caps font-label-caps text-on-surface-variant">{t('dashboard.spent')}</p>
            <p className="text-headline-sm font-data-mono font-bold text-primary">{formatCurrecy(review.totalSpent)}</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-md">
            <p className="text-label-caps font-label-caps text-on-surface-variant">{t('dashboard.budgetLabel')}</p>
            <p className="text-headline-sm font-data-mono font-bold">{formatCurrecy(review.budgeted)}</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-md">
            <p className="text-label-caps font-label-caps text-on-surface-variant">{t('dashboard.fixedTotal')}</p>
            <p className="text-headline-sm font-data-mono font-bold">{formatCurrecy(review.totalFixed)}</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-md">
            <p className="text-label-caps font-label-caps text-on-surface-variant">{t('dashboard.variableTotal')}</p>
            <p className="text-headline-sm font-data-mono font-bold">{formatCurrecy(review.totalVariable)}</p>
          </div>
        </div>

        {review.summary.length > 0 && (
          <div className="space-y-xs mb-lg">
            {review.summary.map((line, i) => (
              <p key={i} className="text-body-sm text-on-surface-variant">{line}</p>
            ))}
          </div>
        )}

        {review.alerts.length > 0 ? (
          <div className="space-y-sm">
            <p className="text-label-caps font-label-caps text-on-surface-variant">
              {t('dashboard.reviewAlert', { count: review.alerts.length })}
            </p>
            {review.alerts.map((alert, i) => (
              <div key={i} className="p-sm rounded-lg bg-error/10 flex items-start gap-sm">
                <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
                <p className="text-body-sm text-on-surface">{alert}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-sm rounded-lg bg-secondary-container/20 flex items-start gap-sm">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">check_circle</span>
            <p className="text-body-sm text-on-surface">{t('dashboard.reviewAllClear')}</p>
          </div>
        )}
      </div>

      {review.categories.length > 0 && (
        <div className="bento-card">
          <p className="text-label-caps font-label-caps text-on-surface-variant mb-md">{t('dashboard.categoryDistribution')}</p>
          <div className="space-y-sm">
            {review.categories.map((c) => {
              const info = getCategoryInfo(c.category)
              const over = c.overspent > 0
              return (
                <div key={c.category} className="flex items-center justify-between gap-md py-sm border-b border-outline-variant/30 last:border-0">
                  <div className="flex items-center gap-sm min-w-0">
                    <CategoryIcon icon={info?.icon} color={info?.color} name={info?.name || c.category} size="sm" />
                    <div className="min-w-0">
                      <p className="text-body-sm font-bold truncate">{info?.name || c.category}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {c.limit !== null
                          ? `${t('dashboard.categoryLimit')}: ${formatCurrecy(c.limit)}`
                          : t('dashboard.noCategoryLimit')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-data-mono font-bold ${over ? 'text-error' : 'text-primary'}`}>{formatCurrecy(c.spent)}</p>
                    <p className={`text-[11px] ${over ? 'text-error' : 'text-secondary'}`}>
                      {over ? `${t('dashboard.overspent')} ${formatCurrecy(c.overspent)}` : `${t('dashboard.within')}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {review.fixedCandidates.length > 0 && (
        <div className="bento-card">
          <p className="text-label-caps font-label-caps text-on-surface-variant mb-md">{t('dashboard.couldBeFixed')}</p>
          <div className="space-y-sm">
            {review.fixedCandidates.map((cand, i) => {
              const info = getCategoryInfo(cand.category)
              return (
                <div key={i} className="flex items-center justify-between gap-md py-sm border-b border-outline-variant/30 last:border-0">
                  <div className="flex items-center gap-sm min-w-0">
                    <span className="material-symbols-outlined text-on-surface-variant">repeat</span>
                    <div className="min-w-0">
                      <p className="text-body-sm font-bold truncate">{cand.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{info?.name || cand.category} · {t('dashboard.recurringBy', { count: cand.count })}</p>
                    </div>
                  </div>
                  <p className="font-data-mono font-bold text-primary shrink-0">{formatCurrecy(cand.avgAmount)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}