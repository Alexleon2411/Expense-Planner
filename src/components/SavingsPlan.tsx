import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { plansApi } from '../api'
import { formatCurrecy } from '../helpers'

type Props = {
  month: number
  year: number
}

export default function SavingsPlan({ month, year }: Props) {
  const { t } = useTranslation()
  const [progress, setProgress] = useState<{ plan: number | null; saved: number; remaining: number; percentage: number } | null>(null)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    plansApi.getProgress(month, year)
      .then(setProgress)
      .catch(() => {})
  }

  useEffect(() => {
    load()
  }, [month, year])

  const handleSave = async () => {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0) return
    setSaving(true)
    try {
      await plansApi.setPlan(val, month, year)
      setEditing(false)
      load()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (progress?.plan != null && !window.confirm(t('dashboard.savingsClear'))) return
    setSaving(true)
    try {
      await plansApi.deletePlan(month, year)
      load()
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const pct = progress?.percentage ?? 0

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-sm">
        <p className="text-label-caps font-label-caps text-on-surface-variant">{t('dashboard.savingsPlan')}</p>
        <span className={`material-symbols-outlined text-sm text-on-surface-variant`}>
          {progress?.plan != null ? 'savings' : 'trending_up'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-md mb-md">
        <div>
          <p className="text-[11px] text-on-surface-variant">{t('dashboard.savingsGoal')}</p>
          <p className="text-headline-sm font-data-mono font-bold">
            {progress?.plan != null ? formatCurrecy(progress.plan) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-on-surface-variant">{t('dashboard.saved')}</p>
          <p className="text-headline-sm font-data-mono font-bold text-primary">{formatCurrecy(progress?.saved ?? 0)}</p>
        </div>
        <div>
          <p className="text-[11px] text-on-surface-variant">{t('dashboard.savingsLeft')}</p>
          <p className="text-headline-sm font-data-mono font-bold text-secondary">
            {progress?.plan != null ? formatCurrecy(progress.remaining) : '—'}
          </p>
        </div>
      </div>

      <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden mb-md">
        <div
          className={`h-3 rounded-full ${pct >= 100 ? 'bg-secondary' : 'bg-primary'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {editing ? (
        <div className="flex gap-sm items-center mt-auto">
          <input
            type="number"
            min={0}
            className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-offset-4 form-input transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('dashboard.savingsGoalPlaceholder')}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-md py-sm rounded-lg bg-primary text-white text-label-caps font-label-caps hover:opacity-90 disabled:opacity-50"
          >
            {saving ? t('dashboard.loading') : t('common.save')}
          </button>
        </div>
      ) : (
        <div className="flex gap-sm mt-auto">
          <button
            onClick={() => { setEditing(true); setInput(progress?.plan != null ? String(progress.plan) : '') }}
            className="flex-1 px-md py-sm rounded-lg bg-surface-container-high text-on-surface text-label-caps font-label-caps hover:opacity-90"
          >
            {progress?.plan != null ? t('dashboard.savingsEdit') : t('dashboard.savingsDefine')}
          </button>
          {progress?.plan != null && (
            <button
              onClick={handleClear}
              disabled={saving}
              title={t('dashboard.savingsClear')}
              className="px-md py-sm rounded-lg bg-error/10 text-error text-label-caps font-label-caps hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}