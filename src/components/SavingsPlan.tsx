import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { plansApi } from '../api'
import type { SavingPlanResponse, SavingProgressResponse } from '../api/plans'
import { formatCurrecy } from '../helpers'

type Props = {
  month: number
  year: number
}

function getMonthDateRange(month: number, year: number) {
  const monthPart = String(month).padStart(2, '0')
  const startDate = `${year}-${monthPart}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${monthPart}-${String(lastDay).padStart(2, '0')}`
  return { startDate, endDate }
}

function formatPlanDate(value: string, locale: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day))
}

const PERIOD_LABELS = {
  en: { start: 'Start date', end: 'End date', invalid: 'End date must be on or after the start date' },
  es: { start: 'Fecha de inicio', end: 'Fecha de fin', invalid: 'La fecha final debe ser igual o posterior a la inicial' },
  fr: { start: 'Date de début', end: 'Date de fin', invalid: 'La date de fin doit être égale ou postérieure à la date de début' },
  it: { start: 'Data di inizio', end: 'Data di fine', invalid: 'La data finale deve essere uguale o successiva a quella iniziale' },
  nl: { start: 'Startdatum', end: 'Einddatum', invalid: 'De einddatum moet op of na de startdatum liggen' },
} as const

export default function SavingsPlan({ month, year }: Props) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.split(/[-_]/)[0] as keyof typeof PERIOD_LABELS
  const periodLabels = PERIOD_LABELS[language] ?? PERIOD_LABELS.en
  const [plans, setPlans] = useState<SavingPlanResponse[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>()
  const [progress, setProgress] = useState<SavingProgressResponse | null>(null)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const initialDateRange = getMonthDateRange(month, year)
  const [startDateInput, setStartDateInput] = useState(initialDateRange.startDate)
  const [endDateInput, setEndDateInput] = useState(initialDateRange.endDate)
  const [saving, setSaving] = useState(false)
  const periodKey = `${month}-${year}`
  const [loadedPeriod, setLoadedPeriod] = useState<string | null>(null)

  const load = useCallback(async (preferredPlanId?: string) => {
    try {
      const { startDate, endDate } = getMonthDateRange(month, year)
      const nextPlans = await plansApi.getPlansForPeriod(startDate, endDate)
      setPlans(nextPlans)
      setSelectedPlanId((current) => {
        if (preferredPlanId && nextPlans.some((plan) => plan.id === preferredPlanId)) return preferredPlanId
        if (current && nextPlans.some((plan) => plan.id === current)) return current
        return nextPlans[0]?.id
      })
      setLoadedPeriod(periodKey)
      return nextPlans
    } catch (error) {
      console.error('Error loading saving plans', error)
      setPlans([])
      setSelectedPlanId(undefined)
      setLoadedPeriod(periodKey)
      return []
    }
  }, [month, year, periodKey])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (loadedPeriod !== periodKey) return
    if (!selectedPlanId) {
      setProgress(null)
      return
    }
    let cancelled = false
    plansApi.getProgressForPlan(selectedPlanId)
      .then((next) => { if (!cancelled) setProgress(next) })
      .catch(() => { if (!cancelled) setProgress(null) })
    return () => { cancelled = true }
  }, [month, year, periodKey, loadedPeriod, selectedPlanId])

  const refreshProgress = useCallback(async (planId: string) => {
    try {
      setProgress(await plansApi.getProgressForPlan(planId))
    } catch {
      setProgress(null)
    }
  }, [])

  const handleSave = async () => {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0 || !nameInput.trim() || !startDateInput || !endDateInput || endDateInput < startDateInput) return
    setSaving(true)
    try {
      const savedPlan = selectedPlanId
        ? await plansApi.updatePlanForPeriod(selectedPlanId, val, startDateInput, endDateInput, nameInput.trim())
        : await plansApi.createPlanForPeriod(val, startDateInput, endDateInput, nameInput.trim())
      setEditing(false)
      const nextPlans = await load(savedPlan.id)
      // Editing an active plan does not change the selected ID, so refresh its progress directly.
      if (selectedPlanId === savedPlan.id && nextPlans.some((plan) => plan.id === savedPlan.id)) {
        await refreshProgress(savedPlan.id)
      }
    } catch {
      setEditing(true)
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!selectedPlanId) return
    if (progress?.plan != null && !window.confirm(t('dashboard.savingsClear'))) return
    setSaving(true)
    try {
      await plansApi.deletePlanById(selectedPlanId)
      await load()
    } catch {
      setProgress(null)
    } finally {
      setSaving(false)
    }
  }

  const pct = progress?.percentage ?? 0
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId)
  const isPeriodValid = Boolean(startDateInput && endDateInput && endDateInput >= startDateInput)

  const startNewPlan = () => {
    const defaultRange = getMonthDateRange(month, year)
    setSelectedPlanId(undefined)
    setProgress(null)
    setInput('')
    setNameInput('')
    setStartDateInput(defaultRange.startDate)
    setEndDateInput(defaultRange.endDate)
    setEditing(true)
  }

  const startEditingPlan = () => {
    setInput(selectedPlan ? String(selectedPlan.amount) : '')
    setNameInput(selectedPlan?.name || '')
    setStartDateInput(selectedPlan?.startDate.slice(0, 10) || getMonthDateRange(month, year).startDate)
    setEndDateInput(selectedPlan?.endDate.slice(0, 10) || getMonthDateRange(month, year).endDate)
    setEditing(true)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-sm">
        <div>
          <p className="text-label-caps font-label-caps text-on-surface-variant">{t('dashboard.savingsPlans', 'Planes de ahorro')}</p>
          <p className="text-xs text-on-surface-variant mt-1">{plans.length > 0 ? t('dashboard.savingsPlanCount', { count: plans.length, defaultValue: '{{count}} planes activos' }) : t('dashboard.savingsPlansEmpty', 'Crea planes para separar tus objetivos')}</p>
        </div>
        <span className={`material-symbols-outlined text-sm text-on-surface-variant`}>
          {progress?.plan != null ? 'savings' : 'trending_up'}
        </span>
      </div>

      <button
        type="button"
        onClick={startNewPlan}
        className="self-start mb-md text-xs font-semibold text-primary hover:underline"
      >
        + {t('dashboard.savingsAdd', 'Añadir otro plan')}
      </button>

      {plans.length > 0 && (
        <div className="flex gap-xs overflow-x-auto pb-sm mb-md">
          {plans.map(plan => (
            <button
              key={plan.id}
              type="button"
              onClick={() => { setSelectedPlanId(plan.id); setEditing(false) }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selectedPlanId === plan.id ? 'border-[#3B82F6] bg-[#3B82F6] text-white' : 'border-white/[0.08] bg-[#1B202B] text-[#9CA3AF]'}`}
            >
              {plan.name || t('dashboard.savingsDefaultName')}
            </button>
          ))}
        </div>
      )}

      {selectedPlan && (
        <p className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant">
          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">date_range</span>
          <span>{formatPlanDate(selectedPlan.startDate, i18n.language)} – {formatPlanDate(selectedPlan.endDate, i18n.language)}</span>
        </p>
      )}

      <div className="grid grid-cols-3 gap-md mb-md">
        <div>
          <p className="text-[11px] text-on-surface-variant">{t('dashboard.savingsGoal')}</p>
          <p className="font-mono text-sm font-semibold tabular-nums text-[#F9FAFB]">
            {progress?.plan != null ? formatCurrecy(progress.plan) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-on-surface-variant">{t('dashboard.saved')}</p>
          <p className="font-mono text-sm font-semibold tabular-nums text-[#60A5FA]">{formatCurrecy(progress?.saved ?? 0)}</p>
        </div>
        <div>
          <p className="text-[11px] text-on-surface-variant">{t('dashboard.savingsLeft')}</p>
          <p className="font-mono text-sm font-semibold tabular-nums text-[#34D399]">
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
        <div className="mt-auto space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              type="text"
              className="h-11 w-full rounded-md border border-white/[0.08] bg-[#1B202B] px-3 text-sm text-[#F9FAFB] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t('dashboard.savingsNamePlaceholder', 'Ej. Inversiones, regalos o trabajo extra')}
              autoFocus
            />
            <input
              type="number"
              min={0}
              className="h-11 w-full rounded-md border border-white/[0.08] bg-[#1B202B] px-3 font-mono text-sm tabular-nums text-[#F9FAFB] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('dashboard.savingsGoalPlaceholder')}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="min-w-0">
              <span className="mb-1 block text-xs text-on-surface-variant">{periodLabels.start}</span>
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-white/[0.08] bg-[#1B202B] px-2 text-sm text-[#F9FAFB] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30"
              />
            </label>
            <label className="min-w-0">
              <span className="mb-1 block text-xs text-on-surface-variant">{periodLabels.end}</span>
              <input
                type="date"
                min={startDateInput}
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-white/[0.08] bg-[#1B202B] px-2 text-sm text-[#F9FAFB] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30"
              />
            </label>
          </div>
          {!isPeriodValid && startDateInput && endDateInput && (
            <p className="text-xs text-[#F87171]">{periodLabels.invalid}</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !isPeriodValid || !input || !nameInput.trim()}
            className="h-11 w-full rounded-md bg-[#3B82F6] px-4 text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50 sm:w-auto"
          >
            {saving ? t('dashboard.loading') : t('common.save')}
          </button>
        </div>
      ) : (
        <div className="flex gap-sm mt-auto">
          <button
            onClick={startEditingPlan}
            className="flex-1 px-md py-sm rounded-lg bg-surface-container-high text-on-surface text-label-caps font-label-caps hover:opacity-90"
          >
            {selectedPlan ? t('dashboard.savingsEdit', 'Editar plan') : t('dashboard.savingsCreate', 'Crear plan')}
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
