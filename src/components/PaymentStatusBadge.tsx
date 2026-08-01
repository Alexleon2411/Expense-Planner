import { useEffect, useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { Expense } from "../types"

type Status = 'pending' | 'paid' | 'partial'

interface Props {
  status: Status
  partialAmount?: number,
  expense?: Expense,
  onPartialAmountUpdated?: () => void
}

const STATUS_CONFIG: Record<Status, { label: string; icon: string; badge: string }> = {
  pending: {
    label: 'Pendiente',
    icon: 'schedule',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  paid: {
    label: 'Pagado',
    icon: 'check_circle',
    badge: 'bg-secondary-container/40 text-on-secondary-container',
  },
  partial: {
    label: 'Parcial',
    icon: 'pie_chart',
    badge: 'bg-primary-fixed/70 text-on-primary-fixed',
  },
}

export default function PaymentStatusBadge({ status, partialAmount, expense, onPartialAmountUpdated }: Props) {
  const [state, setState] = useState<Status>(status || 'pending')
  const [localPartialAmount, setLocalPartialAmount] = useState<number | undefined>(partialAmount)
  const [saving, setSaving] = useState(false)
  const { updateExpensePartialAmount, editExpense } = useBudget()

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
    <div className="inline-flex items-center gap-sm flex-wrap">
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.badge}`}>
        <span className="material-symbols-outlined text-[14px] leading-none">{config.icon}</span>
        {config.label}
        {state === 'partial' && partialAmount !== undefined && partialAmount > 0 && (
          <span className="font-data-mono font-semibold">${partialAmount.toLocaleString('es-MX')}</span>
        )}
      </span>

      {interactive && (
        <div className="inline-flex items-center gap-xs">
          <div className="relative">
            <select
              aria-label="Estado de pago"
              className="appearance-none pr-6 pl-2.5 py-1.5 text-xs font-bold rounded-md border border-outline-variant bg-surface-container-lowest cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none"
              value={state}
              onChange={(e) => setState(e.target.value as Status)}
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="partial">Pago Parcial</option>
            </select>
            <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-outline pointer-events-none">
              expand_more
            </span>
          </div>

          {state === 'partial' && (
            <input
              type="number"
              min={0}
              aria-label="Monto parcial"
              className="w-24 px-2.5 py-1.5 text-xs font-data-mono rounded-md border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
              value={localPartialAmount ?? ''}
              onChange={(e) => setLocalPartialAmount(Number(e.target.value))}
              placeholder="Monto"
            />
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold text-on-primary bg-primary hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[14px] leading-none">{saving ? 'sync' : 'save'}</span>
            {saving ? 'Guardando' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  )
}
