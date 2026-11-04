import { useEffect, useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { Expense } from "../types"
import { useTranslation } from 'react-i18next'
import i18n from '../i18n/config'

type Status = 'pending' | 'paid' | 'partial'

interface Props {
  status: Status
  partialAmount?: number,
  expense?: Expense,
  onPartialAmountUpdated?: () => void
}

const STATUS_CONFIG: Record<Status, { key: string; icon: string; badge: string }> = {
  pending: {
    key: 'expense.pending',
    icon: 'schedule',
    badge: 'bg-amber-400/[0.12] text-[#FBBF24]',
  },
  paid: {
    key: 'expense.paid',
    icon: 'check_circle',
    badge: 'bg-emerald-400/[0.12] text-[#34D399]',
  },
  partial: {
    key: 'expense.partial',
    icon: 'pie_chart',
    badge: 'bg-blue-400/[0.12] text-[#60A5FA]',
  },
}

export default function PaymentStatusBadge({ status, partialAmount, expense, onPartialAmountUpdated }: Props) {
  const [state, setState] = useState<Status>(status || 'pending')
  const [localPartialAmount, setLocalPartialAmount] = useState<number | undefined>(partialAmount)
  const [saving, setSaving] = useState(false)
  const { updateExpensePartialAmount, editExpense } = useBudget()
  const { t } = useTranslation()

  useEffect(() => {
    setState(status)
    setLocalPartialAmount(partialAmount)
  }, [status, partialAmount])

  const interactive = Boolean(expense)
  const config = STATUS_CONFIG[state]

  const handleSave = async () => {
    if (!expense) return
    setSaving(true)
    try {
      if (state === 'paid') {
        await editExpense({ ...expense, status: 'paid', partialAmount: expense.amount })
      } else if (state === 'partial') {
        await updateExpensePartialAmount(expense.id, localPartialAmount ?? 0)
      } else {
        await editExpense({ ...expense, status: 'pending', partialAmount: 0 })
      }
      onPartialAmountUpdated?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium uppercase ${config.badge}`}>
        <span className="material-symbols-outlined text-[14px] leading-none">{config.icon}</span>
        {t(config.key)}
        {state === 'partial' && partialAmount !== undefined && partialAmount > 0 && (
           <span className="font-data-mono font-semibold">{partialAmount.toLocaleString(i18n.language, { style: 'currency', currency: 'EUR' })}</span>
        )}
      </span>

      {interactive && (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="relative min-w-0">
            <select
               aria-label={t('expense.status')}
              className="h-11 max-w-full appearance-none cursor-pointer rounded-md border border-white/[0.08] bg-[#1B202B] py-1.5 pl-2.5 pr-7 text-xs font-medium text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] sm:h-9"
              value={state}
              onChange={(e) => setState(e.target.value as Status)}
            >
               <option value="pending">{t('expense.pending')}</option>
               <option value="paid">{t('expense.paid')}</option>
               <option value="partial">{t('expense.partial')}</option>
            </select>
            <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-outline pointer-events-none">
              expand_more
            </span>
          </div>

          {state === 'partial' && (
            <input
              type="number"
              min={0}
               aria-label={t('expense.partialAmount')}
              className="h-11 w-28 rounded-md border border-white/[0.08] bg-[#1B202B] px-2.5 py-1.5 font-mono text-xs tabular-nums text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] sm:h-9"
              value={localPartialAmount ?? ''}
              onChange={(e) => setLocalPartialAmount(Number(e.target.value))}
               placeholder={t('expense.amountLabel')}
            />
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-11 items-center gap-1 rounded-md bg-[#3B82F6] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:h-9"
          >
            <span className="material-symbols-outlined text-[14px] leading-none">{saving ? 'sync' : 'save'}</span>
             {saving ? t('budget.saving') : t('common.save')}
          </button>
        </div>
      )}
    </div>
  )
}
