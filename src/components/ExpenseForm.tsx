import { Select } from "@headlessui/react"
import { useCategories } from "../hooks/useCategories"
import { useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';
import 'react-calendar/dist/Calendar.css'
import 'react-date-picker/dist/DatePicker.css'
import { DraftExpense, Value } from "../types";
import ErrorMessage from "./ErrorMessage";
import { useBudget } from "../hooks/useBudget";
import { NumericFormat } from 'react-number-format';
import NewCategoryForm from "./category/NewCatgoryForm";
import { useTranslation } from 'react-i18next';

export default function ExpenseForm() {

  const [error, setError] = useState('')
  const [previousBudget, setPreviousBudget] = useState(0)
  const [expense, setExpense] = useState<DraftExpense>({
    amount: 0,
    expenseName: '',
    category: '',
    date: new Date(),
    comment: '',
    status: 'pending',
    partialAmount: 0,
  })
const [showCategoryForm, setShowCategoryForm] = useState(false)

  const { state, reminderBudget, addExpense, editExpense, apiLoading, dispatch } = useBudget()
  const { categories, refreshCategories } = useCategories()
  const { t } = useTranslation()

  const updateCategoryList = async (categoryId?: string) => {
    await refreshCategories()
    if (categoryId) {
      setExpense(prev => ({ ...prev, category: categoryId }))
    }
    setShowCategoryForm(false)
  }

  useEffect(() => {
    if (state.editingId) {
      const editingExpense = state.expenses.filter(item => item.id === state.editingId)[0]
      setExpense({
        ...editingExpense,
        comment: editingExpense.comment || '',
        status: editingExpense.status || 'pending',
        partialAmount: editingExpense.partialAmount || 0,
      })
      setPreviousBudget(editingExpense.amount)
    }
  }, [state.editingId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const numericFields = ['amount', 'partialAmount']
    setExpense({
      ...expense,
      [name]: numericFields.includes(name) ? +value : value
    })
  }

  const handleDate = (value: Value) => {
    setExpense({ ...expense, date: value })
  }

  const showCreateCategoryForm = () => {

    setShowCategoryForm((prev) => !prev)

  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (Object.values(expense).includes('') && !expense.comment && expense.status) {
      const { comment, status, partialAmount, ...rest } = expense
      if (Object.values(rest).includes('')) {
        setError(t('expense.required'))
        return
      }
    }
    if (expense.amount === 0) {
      setError(t('expense.amountPositive'))
      return
    }

    if ((expense.amount - previousBudget) > reminderBudget) {
      setError(t('expense.overBudget'))
      return
    }

    if (state.editingId) {
      await editExpense({ id: state.editingId, ...expense })
    } else {
      await addExpense(expense)
    }

    setError('')
    setExpense({
      amount: 0,
      expenseName: '',
      category: '',
      date: new Date(),
      comment: '',
      status: 'pending',
      partialAmount: 0,
    })
    setPreviousBudget(0)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
              <button
                type="button"
                onClick={() => dispatch({ type: 'close-modal' })}
                className=" hover:bg-black text-md font-boldn absolute top-4 right-5 px-3 py-2 rounded-lg text-white bg-zinc-900"
                aria-label={t('expense.close')}
              >
                X
              </button>
      <legend className="uppercase text-center text-2xl font-black border-b-4 border-zinc-700 py-2">
        {state.editingId ? t('expense.update') : t('expense.new')}
      </legend>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <div className="flex justify-end">
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="expenseName" className="text-xl">{t('expense.name')}: </label>
        <input
          type="text"
          id="expenseName"
          placeholder={t('expense.namePlaceholder')}
          className="bg-slate-100 p-2"
          name="expenseName"
          value={expense.expenseName}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="amount" className="text-xl">{t('expense.amount')}: </label>
        <NumericFormat
          id="amount"
          placeholder={t('expense.amountPlaceholder')}
          className="bg-slate-100 p-2"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-xl">{t('expense.category')}: </label>
        <Select
          id="category"
          className="bg-slate-100 p-2"
          name="category"
          value={expense.category}
          onChange={handleChange}
        >
          <option value="">{t('expense.select')}</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>
        {/* {!showCategoryForm && <button type="button" onClick={showCreateCategoryForm} className="text-sm text-blue-600 hover:underline mt-1 border border-blue-600">Agregar nueva categoria</button>}
        {showCategoryForm && <button type="button" onClick={showCreateCategoryForm} className="text-sm text-red-600 hover:underline mt-1 border border-red-600">Cerrar formulario</button>} */}
        <div className="flex items-center gap-2 mt-1">

          <input type="checkbox" checked={showCategoryForm} onChange={showCreateCategoryForm} />
          <label>{t('expense.addCategory')}</label>
        </div>
        {showCategoryForm && <NewCategoryForm updateCategoryList={updateCategoryList} />}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="expenseDate" className="text-xl">{t('expense.date')}: </label>
        <DatePicker
          id="expenseDate"
          className="bg-slate-100 p-2"
          value={expense.date}
          onChange={handleDate}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="status" className="text-xl">{t('expense.status')}: </label>
        <Select
          id="status"
          className="bg-slate-100 p-2"
          name="status"
          value={expense.status}
          onChange={handleChange}
        >
          <option value="pending">{t('expense.pending')}</option>
          <option value="paid">{t('expense.paid')}</option>
          <option value="partial">{t('expense.partial')}</option>
        </Select>
      </div>

      {expense.status === 'partial' && (
        <div className="flex flex-col gap-2">
          <label htmlFor="partialAmount" className="text-xl">{t('expense.partialAmount')}: </label>
          <NumericFormat
            id="partialAmount"
            placeholder={t('expense.amountPlaceholder')}
            className="bg-slate-100 p-2"
            name="partialAmount"
            value={expense.partialAmount}
            onChange={handleChange}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="comment" className="text-xl">{t('expense.commentOptional')}: </label>
        <textarea
          id="comment"
          className="bg-slate-100 p-2 border rounded"
          name="comment"
          rows={3}
          placeholder={t('comments.placeholder')}
          value={expense.comment}
          onChange={handleChange}
        />
      </div>

      <input
        type="submit"
        disabled={apiLoading}
        className="bg-zinc-900 cursor-pointer w-full p-2 text-white uppercase font-bold rounded-lg disabled:opacity-50"
        value={apiLoading ? t('budget.saving') : state.editingId ? t('expense.saveChanges') : t('expense.register')}
      />
    </form>
  )
}
