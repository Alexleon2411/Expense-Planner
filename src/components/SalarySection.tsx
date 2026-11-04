import { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format'
import { userApi } from '../api'
import { useBudget } from '../hooks/useBudget'
import {formatCurrecy} from '../helpers'
import { useTranslation } from 'react-i18next'

export default function SalarySection() {
  const [salary, setSalary] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { addBudget, state } = useBudget()
  const { t } = useTranslation()

  useEffect(() => {
    userApi.getProfile().then((p) => {
      setSalary(p.salary ?? null)
      setInput(p.salary ? String(p.salary) : '')
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0) return
    setSaving(true)
    try {
      await userApi.updateProfile({ salary: val })
      setSalary(val)
      setEditing(false)
       setMessage(t('salary.updated'))
      // Auto-create budget from salary
      if (state.budget === 0 || state.budget === val) {
        await addBudget(val)
      }
      setTimeout(() => setMessage(''), 3000)
    } catch {
       setMessage(t('salary.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
       <h3 className="mb-4 text-base font-semibold text-[#F9FAFB]">{t('salary.title')}</h3>
      {editing ? (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
          <div className="col-span-2 flex-1 sm:col-span-1">
             <label className="text-xs font-medium text-[#9CA3AF]">{t('salary.label')}</label>
             <NumericFormat
              className="mt-2 h-11 w-full rounded-md border border-white/[0.08] bg-[#1B202B] px-3 font-mono text-sm tabular-nums text-[#F9FAFB] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30"
              value={input}
              onChange={(e) => setInput(e.target.value)}
               placeholder={t('salary.placeholder')}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-11 rounded-md bg-[#3B82F6] px-4 text-sm font-medium text-white hover:bg-[#2563EB] disabled:opacity-50"
          >
             {saving ? t('salary.saving') : t('salary.save')}
          </button>
          <button
            onClick={() => { setEditing(false); setInput(salary ? String(salary) : '') }}
            className="min-h-11 rounded-md border border-white/[0.08] px-4 text-sm font-medium text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]"
          >
             {t('salary.cancel')}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate font-mono text-2xl font-semibold tabular-nums text-[#F9FAFB]">
             {salary ? formatCurrecy(salary) : t('salary.undefined')}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="min-h-11 shrink-0 rounded-md border border-white/[0.08] px-4 text-sm font-medium text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]"
          >
             {salary ? t('salary.edit') : t('salary.define')}
          </button>
        </div>
      )}
      {message && <p className="mt-2 text-sm text-[#34D399]">{message}</p>}
      {salary && (
        <p className="text-xs text-on-surface-variant mt-2">
           {t('salary.automatic')}
        </p>
      )}

      <div className="mt-5 border-t border-white/[0.08] pt-4">
         <p className="mb-3 text-sm font-medium text-[#F9FAFB]">{t('salary.advice')}</p>

        {salary && (
          <div className="mb-4 rounded-lg bg-[#1B202B] p-3">
             <p className="mb-2 text-xs font-medium text-[#60A5FA]">{t('salary.rule')}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                 <span className="text-on-surface-variant">{t('salary.needs')}</span>
                <span className="font-mono font-medium tabular-nums text-[#F9FAFB]">{formatCurrecy(salary * 0.5)}</span>
              </div>
              <div className="flex justify-between text-xs">
                 <span className="text-on-surface-variant">{t('salary.investments')}</span>
                <span className="font-mono font-medium tabular-nums text-[#F9FAFB]">{formatCurrecy(salary * 0.3)}</span>
              </div>
              <div className="flex justify-between text-xs">
                 <span className="text-on-surface-variant">{t('salary.savings')}</span>
                <span className="font-mono font-medium tabular-nums text-[#F9FAFB]">{formatCurrecy(salary * 0.2)}</span>
              </div>
            </div>
          </div>
        )}

        <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc pl-4">
           {(t('salary.tips', { returnObjects: true }) as string[]).map((tip) => <li key={tip}>{tip}</li>)}
        </ul>
      </div>
    </div>
  )
}
