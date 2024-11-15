import {  createContext, Dispatch, useReducer, ReactNode, useMemo } from "react";
import { BudgetAction, budgetReducer, BudgetState, initialState } from "../reducers/budget-reducer";

type BudgetContextProps = {
  state: BudgetState,
  dispatch: Dispatch<BudgetAction>,
  totalExpense: number,
  reminderBudget: number
}

type BudgetProviderProps = {
  children: ReactNode,

}

export const BudgetContext = createContext<BudgetContextProps>(null!)

export const  BudgetProvider = ({children} : BudgetProviderProps) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState)
  const totalExpense = useMemo(() => state.expenses.reduce((total, expense) => expense.amount + total, 0), [state.expenses])
  const reminderBudget = state.budget - totalExpense

  return (
    <BudgetContext.Provider
      value={{state, dispatch, totalExpense, reminderBudget}}
    >
      {children}
    </BudgetContext.Provider>
  )
}
