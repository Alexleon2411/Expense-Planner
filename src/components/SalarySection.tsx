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
    <div >
       <h3 className="text-xl font-bold mb-4">{t('salary.title')}</h3>
      {editing ? (
        <div className="flex gap-3 items-end">
          <div className="flex-1">
             <label className="text-sm text-gray-600">{t('salary.label')}</label>
            <NumericFormat
              className="w-full bg-slate-100 p-2 border rounded mt-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
               placeholder={t('salary.placeholder')}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
             {saving ? t('salary.saving') : t('salary.save')}
          </button>
          <button
            onClick={() => { setEditing(false); setInput(salary ? String(salary) : '') }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold"
          >
             {t('salary.cancel')}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-3xl font-black text-blue-600">
             {salary ? formatCurrecy(salary) : t('salary.undefined')}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg font-semibold"
          >
             {salary ? t('salary.edit') : t('salary.define')}
          </button>
        </div>
      )}
      {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      {salary && (
        <p className="text-xs text-gray-500 mt-2">
           {t('salary.automatic')}
        </p>
      )}

      <div className="mt-6 pt-4 border-t border-slate-200">
         <p className="text-sm font-bold text-gray-700 mb-3">{t('salary.advice')}</p>

        {salary && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
             <p className="text-xs font-bold text-blue-800 mb-2">{t('salary.rule')}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                 <span className="text-gray-600">{t('salary.needs')}</span>
                <span className="font-bold text-gray-800">{formatCurrecy(salary * 0.5)}</span>
              </div>
              <div className="flex justify-between text-xs">
                 <span className="text-gray-600">{t('salary.investments')}</span>
                <span className="font-bold text-gray-800">{formatCurrecy(salary * 0.3)}</span>
              </div>
              <div className="flex justify-between text-xs">
                 <span className="text-gray-600">{t('salary.savings')}</span>
                <span className="font-bold text-gray-800">{formatCurrecy(salary * 0.2)}</span>
              </div>
            </div>
          </div>
        )}

        <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
           {(t('salary.tips', { returnObjects: true }) as string[]).map((tip) => <li key={tip}>{tip}</li>)}
        </ul>
      </div>
    </div>
  )
}
