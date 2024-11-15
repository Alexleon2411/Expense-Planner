import { Category, DraftExpense, Expense } from "../types"
import { v4 as uuidv4 } from "uuid"

export type  BudgetAction =
  {type: 'add-budget', payload: {budget: number}} |
  {type: 'show-modal'} |
  {type: 'close-modal'} |
  {type: 'add-expense', payload: {expenses: DraftExpense}} |
  {type: 'remove-expense', payload: {id: Expense['id']}} |
  {type: 'get-expense-by-id', payload: {id: Expense['id']}} |
  {type: 'edit-expense', payload: {expense: Expense}} |
  {type: 'restart-app'} |
  {type: 'add-filter-category', payload: {id: Category['id']}}

export type BudgetState = {
  budget: number
  modal: boolean,
  expenses: Expense[],
  editingId: string,
  currentCategory: Category['id']
}

const localStorageExpenses = () : Expense[] => {
  const localstorage  = localStorage.getItem('expenses')
  return localstorage ? JSON.parse(localstorage) : []
}
const localStorafeBudget = () : number => {
  const localstorage = localStorage.getItem('budget')
  return localstorage ? +localstorage : 0
}

export const initialState : BudgetState = {
  budget: localStorafeBudget(),
  modal: false,
  expenses: localStorageExpenses(),
  editingId: '',
  currentCategory: ''
}


const createExpense = (draftExpense: DraftExpense) : Expense => {
  return {
    ...draftExpense,
    id: uuidv4()
  }
}

export const budgetReducer = (state: BudgetState = initialState, action: BudgetAction) => {

  if(action.type === 'add-budget'){
    console.log(action.payload.budget)
    return {
      ...state,
      budget: action.payload.budget
    }
  }
  if(action.type === 'show-modal') {
    return {
      ...state,
      modal: true
    }
  }
  if (action.type === 'close-modal') {
    return {
      ...state,
      modal: false,
      editingId: ''
    }
  }
  if(action.type === 'add-expense') {
    const expense = createExpense(action.payload.expenses)
    return  {
      ...state,
      expenses: [...state.expenses, expense],
      modal: false,
    }
  }

  if (action.type === 'remove-expense') {

    return {
      ...state,
      expenses: state.expenses.filter(expense => expense.id !== action.payload.id)
    }
  }

  if (action.type === 'get-expense-by-id') {
      return {
        ...state,
        editingId: action.payload.id,
        modal: true

      }
  }

  if(action.type === 'edit-expense'){
    return {
      ...state,
      expenses: state.expenses.map(item => item.id === action.payload.expense.id ? action.payload.expense : item),
      modal: false,
      editingId: ''
    }
  }
  if(action.type === 'restart-app'){
    return {
      ...state,
      expenses: [],
      budget: 0,
      editingId: ''
    }
  }

  if(action.type === 'add-filter-category'){
    return {
      ...state,
      currentCategory: action.payload.id
    }
  }

  return state
}
