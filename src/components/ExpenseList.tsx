import { useEffect, useMemo } from "react"
import { useBudget } from "../hooks/useBudget"
import ExpenseDetail from "./ExpenseDetail"
import { useTranslation } from 'react-i18next'

export default function ExpenseList() {
  const { state, getAllExpenses } = useBudget()
  const { t } = useTranslation()

  useEffect(() => {
    getAllExpenses()
  }, [getAllExpenses])

  const filteredExpenses = state.currentCategory ? state.expenses.filter(expense => expense.category === state.currentCategory) : state.expenses
  const isEmpty = useMemo(() => filteredExpenses.length === 0, [filteredExpenses])
  return (
    <div className="mt-10 ">
       {isEmpty ? <p className="text-gray-600 text-2xl font-bold">{t('expense.noRecords')}</p> :
      <>
         <p className="text-gray-600 text-2xl font-bold my-5">{t('expense.list')}</p>
        {filteredExpenses.map(expense => (
          <ExpenseDetail
            key={expense.id}
            expense={expense}
          />
        ))}
      </>
      }
    </div>
  )
}
