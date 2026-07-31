import { createContext, Dispatch, useReducer, ReactNode, useMemo, useState, useCallback } from "react";
import { BudgetAction, budgetReducer, BudgetState, initialState } from "../reducers/budget-reducer";
import { DraftExpense, Expense } from "../types";
import { useAuth } from "../hooks/useAuth";
import { budgetApi, expensesApi, userApi } from "../api";

type BudgetContextProps = {
  state: BudgetState,
  dispatch: Dispatch<BudgetAction>,
  totalExpense: number,
  reminderBudget: number,
  apiLoading: boolean,
  syncingBudget: boolean,
  addBudget: (budget: number) => Promise<void>,
  addExpense: (expense: DraftExpense) => Promise<void>,
  editExpense: (expense: Expense) => Promise<void>,
  removeExpense: (id: Expense['id']) => Promise<void>,
  restartApp: () => Promise<void>,
  syncBudgetWithSalary: () => Promise<void>,
  getAllExpenses: (page?: number, limit?: number) => Promise<{ expenses: Expense[]; totalPages: number } | undefined>,
  loadMoreExpenses: (page: number, limit?: number) => Promise<{ expenses: Expense[]; totalPages: number } | undefined>,
  updateExpensePartialAmount: (id: Expense['id'], partialAmount: number) => Promise<true | undefined>,
  createExpenseComment: (expenseId: Expense['id'], comment: string) => Promise<any>,
  listExpenseComments: (expenseId: string) => Promise<any>,
  deleteExpenseComment: (expenseId: string, commentId: string) => Promise<void>,
}

type BudgetProviderProps = {
  children: ReactNode,
}

export const BudgetContext = createContext<BudgetContextProps>(null!)

export const BudgetProvider = ({ children }: BudgetProviderProps) => {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(budgetReducer, initialState)
  const [apiLoading, setApiLoading] = useState(false)
  const [syncingBudget, setSyncingBudget] = useState(false)

  const totalExpense = useMemo(() => state.expenses.reduce((total, expense) => expense.amount + total, 0), [state.expenses])
  const reminderBudget = state.budget - totalExpense

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const addBudget = async (budget: number) => {
    dispatch({ type: 'add-budget', payload: { budget } })
    if (!user) return
    try {
      await budgetApi.upsertBudget(budget, month, year)
    } catch (error) {
      console.log('Error al guardar el presupuesto en el servidor, se guardará localmente', error)
    }
  }

  const getAllExpenses = useCallback(async (page = 1, limit = 6) => {
    if (!user) return
    try {
      setApiLoading(true)
      const resp = await expensesApi.listExpenses({ month, year, page, limit })
      const rawExpenses = Array.isArray(resp) ? resp : (resp as any).expenses || (resp as any).data || []
      const totalPages = (resp as any).totalPages ?? 1
      const serverExpenses: Expense[] = rawExpenses.map((e: any) => ({
        id: e.id,
        expenseName: e.name,
        amount: e.amount,
        category: e.category,
        date: e.date,
        comment: e.comment,
        status: (e.status as Expense['status']) || 'pending',
        partialAmount: e.partialAmount,
      }))

      dispatch({ type: 'get-expenses', payload: { expenses: serverExpenses } })
      return { expenses: serverExpenses, totalPages }
    }
    catch (error) {
      console.log('Error al obtener los gastos del servidor, se mantendrán los locales', error)
    } finally {
      setApiLoading(false)
    }
  }, [user, month, year])

  const loadMoreExpenses = useCallback(async (page: number, limit = 6) => {
    if (!user) return
    try {
      setApiLoading(true)
      const resp = await expensesApi.listExpenses({ month, year, page, limit })
      const rawExpenses = Array.isArray(resp) ? resp : (resp as any).expenses || (resp as any).data || []
      const totalPages = (resp as any).totalPages ?? 1
      const serverExpenses: Expense[] = rawExpenses.map((e: any) => ({
        id: e.id,
        expenseName: e.name,
        amount: e.amount,
        category: e.category,
        date: e.date,
        comment: e.comment,
        status: (e.status as Expense['status']) || 'pending',
        partialAmount: e.partialAmount,
      }))

      dispatch({ type: 'append-expenses', payload: { expenses: serverExpenses } })
      return { expenses: serverExpenses, totalPages }
    } catch (error) {
      console.log('Error al obtener más gastos del servidor', error)
    } finally {
      setApiLoading(false)
    }
  }, [user, month, year])

  const syncBudgetWithSalary = useCallback(async () => {
    if (!user) return
    setSyncingBudget(true)
    try {
      const profile = await userApi.getProfile()
      if (profile.salary && state.budget === 0) {
        dispatch({ type: 'add-budget', payload: { budget: profile.salary } })
        await budgetApi.upsertBudget(profile.salary, month, year)
      }
    } catch (error){
      console.log('Error al sincronizar el presupuesto con el salario, se mantendrá el valor local', error)
    } finally {
      setSyncingBudget(false)
    }
  }, [user, state.budget, month, year])

  const addExpense = async (expense: DraftExpense) => {
    dispatch({ type: 'add-expense', payload: { expenses: expense } })
    if (!user) return
    try {
      setApiLoading(true)
      await expensesApi.createExpense({
        name: expense.expenseName,
        amount: expense.amount,
        category: expense.category,
        date: expense.date instanceof Date
          ? expense.date.toISOString()
          : new Date().toISOString(),
        comment: expense.comment,
        status: expense.status,
        partialAmount: expense.partialAmount,
      })
    } catch (error) {
      console.log('Error al crear el gasto en el servidor, se creará localmente', error)
    } finally {
      setApiLoading(false)
    }
  }

  const editExpense = async (expense: Expense) => {
    dispatch({ type: 'edit-expense', payload: { expense } })
    if (!user) return
    try {
      setApiLoading(true)
      await expensesApi.updateExpense(expense.id, {
        name: expense.expenseName,
        amount: expense.amount,
        category: expense.category,
        date: expense.date instanceof Date
          ? expense.date.toISOString()
          : undefined,
        comment: expense.comment,
        status: expense.status,
        partialAmount: expense.partialAmount,
      })
    } catch (error) {
      console.log('Error al actualizar el gasto en el servidor, se actualizará localmente', error)
    } finally {
      setApiLoading(false)
    }
  }

  const updateExpensePartialAmount = async (expenseId: Expense['id'], partialAmount: number) => {
    dispatch({ type: 'update-expense-partial-amount', payload: { id: expenseId, partialAmount } })
    if (!user) return
    try {
      setApiLoading(true)
      await expensesApi.updateExpensePartialAmount(expenseId, partialAmount)
      return true;
    } catch (error) {
      console.log('Error al actualizar el monto parcial del gasto en el servidor, se actualizará localmente', error)
    } finally {
      setApiLoading(false)
    }
  }

  const removeExpense = async (id: Expense['id']) => {
    dispatch({ type: 'remove-expense', payload: { id } })
    if (!user) return
    try {
      await expensesApi.deleteExpense(id)
    } catch (error) {
      // fallback
      console.log('Error al eliminar el gasto en el servidor, se eliminará localmente', error)
    }
  }

  const restartApp = async () => {
    dispatch({ type: 'restart-app' })
    if (!user) return
    try {
      setApiLoading(true)
      const expenses = await expensesApi.listExpenses({ month, year })
      for (const exp of expenses.expenses) {
        await expensesApi.deleteExpense(exp.id)
      }
    } catch {
      // fallback
    } finally {
      setApiLoading(false)
    }
  }

  const createExpenseComment = async (expenseId: Expense['id'], comment: string) => {
    if (!user) return
    try {
      setApiLoading(true)
    const result = await expensesApi.createExpenseComment(expenseId, comment)
    return result;
    } catch (error) {
      console.log('Error al crear el comentario del gasto en el servidor, se actualizará localmente', error)
    } finally {
      setApiLoading(false)
    }
  }

  const listExpenseComments = async (expenseId: string) => {
    if (!user) return
    try {
      setApiLoading(true)
      const result = await expensesApi.listExpenseComments(expenseId)
      return result
    } catch (error) {
      console.log('Error al obtener comentarios del servidor', error)
    } finally {
      setApiLoading(false)
    }
  }

  const deleteExpenseComment = async (expenseId: string, commentId: string) => {
    if (!user) return
    try {
      setApiLoading(true)
      await expensesApi.deleteExpenseComment(expenseId, commentId)
    } catch (error) {
      console.log('Error al eliminar comentario del servidor', error)
    } finally {
      setApiLoading(false)
    }
  }

  return (
    <BudgetContext.Provider
      value={
        { 
          state, 
          dispatch, 
          totalExpense, 
          reminderBudget, 
          apiLoading, 
          syncingBudget, 
          addBudget, 
          addExpense, 
          editExpense, 
          removeExpense, 
          restartApp, 
          syncBudgetWithSalary, 
          getAllExpenses, 
          loadMoreExpenses, 
          updateExpensePartialAmount, 
          createExpenseComment, 
          listExpenseComments, 
          deleteExpenseComment 
        }
      }
    >
      {children}
    </BudgetContext.Provider>
  )
}
