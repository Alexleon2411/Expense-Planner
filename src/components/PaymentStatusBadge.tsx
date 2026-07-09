import { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { Expense } from "../types"

type Status = 'pending' | 'paid' | 'partial'

interface Props {
  status: Status
  partialAmount?: number,
  expense?: Expense,
  onPartialAmountUpdated?: () => void
}

const styles: Record<Status, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  paid: 'bg-green-100 text-green-800 border-green-300',
  partial: 'bg-blue-100 text-blue-800 border-blue-300',
}

const labels: Record<Status, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  partial: 'Parcial',
}

export default function PaymentStatusBadge({ status, partialAmount, expense, onPartialAmountUpdated }: Props) {

    const [state, setState] = useState(status || 'pending')
    const [localPartialAmount, setLocalPartialAmount] = useState(partialAmount);
    const { updateExpensePartialAmount, editExpense } = useBudget()

    const HandlePartialAmount =  async() => {

      if (localPartialAmount != partialAmount && localPartialAmount !== undefined) {
        if (!expense) return;

        if (state === 'partial' && localPartialAmount >= 0 && localPartialAmount < expense.amount!) {
          const newPartialAmount = localPartialAmount + (expense.partialAmount || 0)
          setLocalPartialAmount(newPartialAmount)
          console.log("partial amount", partialAmount)
          console.log("estado parcial nuevo #1", localPartialAmount + (partialAmount || 0))
          await updateExpensePartialAmount(expense.id, newPartialAmount)
          onPartialAmountUpdated!()
        }
       
      }else if (state === 'paid'){
        if (!expense) return;
          console.log("entering to paid")
          const newPartialAmount = expense.amount
          setLocalPartialAmount(newPartialAmount)
          await editExpense({...expense, status: state as 'pending' | 'partial' | 'paid', partialAmount: newPartialAmount})
          onPartialAmountUpdated!()
          console.log("estado parcial nuevo #2", localPartialAmount)
        
      }
    }

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded border ${styles[state]}`}>
      {labels[state]}
      {state === 'partial' && partialAmount ? ` $${partialAmount}` : ''}
      <div className="flex gap-2 items-center flex-wrap">
          <select
            className="bg-slate-100 p-1 text-sm border rounded"
            value={status}
            onChange={(e) => setState(e.target.value as 'pending' | 'paid' | 'partial')}
          >
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="partial">Pago Parcial</option>
          </select>
          {state === 'partial' && (
            <input
              type="number"
              className="bg-slate-100 p-1 text-sm border rounded w-24"
              onChange={(e) => setLocalPartialAmount(Number(e.target.value))}
              placeholder="Monto parcial"
            />
          )}
          {/* <button onClick={handleSaveStatus} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Guardar</button>
          <button onClick={() => setEditingStatus(false)} className="text-xs bg-gray-300 px-2 py-1 rounded">Cancelar</button> */}
          <button onClick={HandlePartialAmount}>Complete it</button>
        </div>
    </span>
    
  )
}
