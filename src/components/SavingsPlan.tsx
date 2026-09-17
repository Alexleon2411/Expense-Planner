import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { plansApi } from '../api'
import type { SavingPlanResponse, SavingProgressResponse } from '../api/plans'
import { formatCurrecy } from '../helpers'

type Props = {
  month: number
  year: number
}

export default function SavingsPlan({ month, year }: Props) {
  const { t } = useTranslation()
  const [plans, setPlans] = useState<SavingPlanResponse[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>()
  const [progress, setProgress] = useState<SavingProgressResponse | null>(null)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async (preferredPlanId?: string) => {
    try {
      const response = await plansApi.getPlan(month, year)
      const nextPlans = response == null ? [] : Array.isArray(response) ? response : [response]
      setPlans(nextPlans)
      const nextId = preferredPlanId && nextPlans.some(plan => plan.id === preferredPlanId)
        ? preferredPlanId
        : selectedPlanId && nextPlans.some(plan => plan.id === selectedPlanId)
          ? selectedPlanId
          : nextPlans[0]?.id
      setSelectedPlanId(nextId)
      setProgress(nextId ? await plansApi.getProgress(month, year, nextId) : null)
    } catch {
      setPlans([])
      setProgress(null)
    }
  }

  useEffect(() => {
    void load()
  }, [month, year]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedPlanId) return
    plansApi.getProgress(month, year, selectedPlanId).then(setProgress).catch(() => setProgress(null))
  }, [month, year, selectedPlanId])

  const handleSave = async () => {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0 || !nameInput.trim()) return
    setSaving(true)
    try {
      const savedPlan = selectedPlanId
        ? await plansApi.updatePlan(selectedPlanId, val, month, year, nameInput.trim())
        : await plansApi.createPlan(val, month, year, nameInput.trim())
      setEditing(false)
      await load(savedPlan.id)
    } catch {
      setEditing(true)
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (progress?.plan != null && !window.confirm(t('dashboard.savingsClear'))) return
    setSaving(true)
    try {
      await plansApi.deletePlan(month, year, selectedPlanId)
      await load()
    } catch {
      setProgress(null)
    } finally {
      setSaving(false)
    }
  }

  const pct = progress?.percentage ?? 0
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId)

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
        onClick={() => { setSelectedPlanId(undefined); setProgress(null); setInput(''); setNameInput(''); setEditing(true) }}
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
              className={`shrink-0 px-sm py-xs rounded-full text-xs font-semibold border transition-colors ${selectedPlanId === plan.id ? 'bg-primary text-white border-primary' : 'bg-surface-container-high text-on-surface border-outline-variant'}`}
            >
              {plan.name || t('dashboard.savingsDefaultName')}
            </button>
          ))}
        </div>
      )}

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
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-offset-4 form-input transition-all"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t('dashboard.savingsNamePlaceholder', 'Ej. Inversiones, regalos o trabajo extra')}
              autoFocus
            />
            <input
              type="number"
            min={0}
            className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-offset-4 form-input transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('dashboard.savingsGoalPlaceholder')}
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
            onClick={() => { setEditing(true); setInput(selectedPlan ? String(selectedPlan.amount) : ''); setNameInput(selectedPlan?.name || '') }}
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
