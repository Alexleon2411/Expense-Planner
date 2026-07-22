import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMemo, useState } from "react"
import 'react-swipeable-list/dist/styles.css'
import { formatDate } from "../helpers"
import { useBudget } from "../hooks/useBudget"
import { useCategories } from "../hooks/useCategories"
import { Expense } from "../types"
import AmountDisplay from "./AmountDisplay"
import CategoryIcon from "./CategoryIcon"
import ExpenseComments from "./expense/ExpenseTemplate"
import PartialPaymentModal from "./PartialPaymentModal"

type ExpenseDetailProps = {
  expense: Expense
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  paid: { label: 'Pagado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  partial: { label: 'Parcial', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400' },
} as const

export default function ExpenseDetail({ expense }: ExpenseDetailProps) {

  const { categories } = useCategories()
  const categoryInfo = useMemo(() => categories.filter(cat => cat.id === expense.category)[0], [expense, categories])

  const amountToDisplay = useMemo(
    () => expense.amount - (expense.partialAmount || 0),
    [expense.amount, expense.partialAmount]
  )
  const { removeExpense, editExpense } = useBudget()
  const [expanded, setExpanded] = useState(false)
  // const [_comment, setComment] = useState(expense.comment || '')
  const [editingStatus, setEditingStatus] = useState(false)
  const [status, setStatus] = useState(expense.status || 'pending')
  const [partialAmount, setPartialAmount] = useState(expense.partialAmount || 0)
  const [showPartialModal, setShowPartialModal] = useState(false)

  const currentStatus = STATUS_CONFIG[expense.status || 'pending']

  const handleSaveStatus = async () => {
    await editExpense({
      ...expense,
      status: status as 'pending' | 'paid' | 'partial',
      partialAmount: status === 'partial' ? partialAmount : undefined,
    })
    setEditingStatus(false)
  }

  const handlePartialPaymentSave = async (amount: number, comment: string) => {
    await editExpense({
      ...expense,
      status: 'partial',
      partialAmount: amount,
      comment,
    })
    setEditingStatus(false)
    setShowPartialModal(false)
  }

  const handleDeleteExpense = async (expenseId: string) => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este gasto? El Gasto no se podra recuperar.")
    if (confirmed) {
      await removeExpense(expenseId)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">

      {/* HEADER — always visible, click to expand */}
      <div
        className="px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        
        {/* Row 1: Status badge + Amount */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${currentStatus.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
              {currentStatus.label}
            </span>
            {expense.status === 'partial' && expense.partialAmount ? (
              <span className="text-xs text-slate-400 font-medium">
                ({expense.partialAmount}€ pagados)
              </span>
            ) : null}
          </div>
          
          <AmountDisplay amount={amountToDisplay} totalAmount={expense.amount} />
        </div>

        {/* Row 2: Category icon + details + actions */}
        <div className="flex items-center gap-3">
          {categoryInfo && (
            <div className="shrink-0">
              <CategoryIcon
                icon={categoryInfo.icon}
                color={categoryInfo.color}
                name={categoryInfo.name}
                size="md"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {categoryInfo?.name || expense.category}
            </p>
            <p className="text-base font-bold text-slate-800 truncate leading-tight mt-0.5">
              {expense.expenseName}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {formatDate(expense.date!.toString())}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-center gap-2">
            {/* <FontAwesomeIcon
              icon={faChevronDown}
              className={`text-slate-300 text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            /> */}
            
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteExpense(expense.id) }}
              className="text-slate-300 hover:text-red-500 transition-colors text-xs"
              title="Eliminar gasto"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDED SECTION — dropdown content */}
      {expanded && (
        <div className="border-t border-slate-100/80 px-5 py-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white animate-fadeIn">

          {/* Status editing */}
          <div onClick={(e) => e.stopPropagation()} className="space-y-2">
            {editingStatus ? (
              <div className="flex gap-2 items-center flex-wrap">
                <select
                  className="bg-white border border-slate-200 p-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                  value={status}
                  onChange={(e) => {
                    const newStatus = e.target.value as 'pending' | 'paid' | 'partial'
                    setStatus(newStatus)
                    if (newStatus === 'partial') {
                      setShowPartialModal(true)
                    }
                  }}
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="partial">Pago Parcial</option>
                </select>
                <button onClick={handleSaveStatus} className="text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                  Guardar
                </button>
                <button onClick={() => setEditingStatus(false)} className="text-xs font-semibold bg-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-300 transition-colors">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                          
              <button
                onClick={() => { setStatus(expense.status || 'pending'); setPartialAmount(expense.partialAmount || 0); setEditingStatus(true) }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {/* {expense.status === 'paid' ? 'Marcar como pendiente' : expense.status === 'partial' ? 'Actualizar pago parcial' : 'Marcar como pagado'} */}
                <img 
                  src="https://cdn.iconscout.com/icon/premium/png-256-thumb/pago-de-instalacion-icon-svg-download-png-12566313.png?f=webp&w=256"
                  className="w-5  font-medium hover:scale-110 transition-transform "
                />
              </button>
              </div>
            )}
          </div>

          {/* Personal note */}
          {/* <div onClick={(e) => e.stopPropagation()} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Nota personal
            </p>
            {editingComment ? (
              <div className="flex gap-2 items-start">
                <textarea
                  className="flex-1 bg-white border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none"
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Agregar una nota..."
                />
                <div className="flex gap-1 shrink-0">
                  <button onClick={handleSaveComment} className="text-xs font-semibold bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                    Guardar
                  </button>
                  <button onClick={() => setEditingComment(false)} className="text-xs font-semibold bg-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-300 transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setComment(expense.comment || ''); setEditingComment(true) }}
                className="w-full text-left"
              >
                {expense.comment ? (
                  <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-3 leading-relaxed">
                    {expense.comment}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic bg-white border border-slate-200 rounded-xl p-3">
                    Sin nota personal. Haz clic para agregar...
                  </p>
                )}
              </button>
            )}
          </div> */}

          {/* Comment thread */}
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Historial de comentarios
            </p>
            <ExpenseComments
              expenseId={expense.id}
              expenseName={expense.expenseName}
              amount={expense.amount}
              category={categoryInfo?.name || expense.category}
            />
          </div>

        </div>
      )}

      <PartialPaymentModal
        isOpen={showPartialModal}
        onClose={() => setShowPartialModal(false)}
        onSave={handlePartialPaymentSave}
        currentAmount={expense.partialAmount || 0}
        currentComment={expense.comment || ''}
      />
    </div>
  )
}
