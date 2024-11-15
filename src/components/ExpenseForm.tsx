import { Select } from "@headlessui/react"
import { categories } from "../data/categories"
import { useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';
import 'react-calendar/dist/Calendar.css'
import 'react-date-picker/dist/DatePicker.css'
import { DraftExpense, Value } from "../types";
import ErrorMessage from "./ErrorMessage";
import { useBudget } from "../hooks/useBudget";

export default function ExpenseForm() {

  const [error, setError] = useState('')
  const [previousBudget, setPreviousBudget] = useState(0)
  const [expense, setExpense] = useState<DraftExpense>({
    amount: 0,
    expenseName: '',
    category: '',
    date: new Date()
  })

  const { state, dispatch, reminderBudget } = useBudget()

  useEffect(() => {
    if(state.editingId){
      const editingExpense = state.expenses.filter(item => item.id === state.editingId)[0]
      setExpense(editingExpense)
      setPreviousBudget(editingExpense.amount)
    }
  }, [state.editingId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    const isAmoundField = ['amount'].includes(name)
    console.log(isAmoundField)
    setExpense({...expense,
        [name]: isAmoundField ? +value : value // si el fild es numero entonces lo convertimos a numero sino se deja en string y se coloca name dentro de un array para que tome su valor no la variable entera
    })
  }
  const handleDate = (value : Value) => {
    setExpense({
      ...expense,
      date: value
    })
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    //validar que sea un expense valido
    if(Object.values(expense).includes('')){
      setError('Todos los campos son obligatorios')
      return
    }
    if(Object.values(expense).includes('')){
      setError('Todos los campos son obligatorios')
      return
    }
    /// validar que no exceda el limite

    if((expense.amount - previousBudget ) > reminderBudget){
      setError('Este gasto excede el presupuesto')
      return
    }
    //agregar o actualizar
    if(state.editingId){
      dispatch({type: 'edit-expense', payload: {expense: {id: state.editingId, ...expense}}})
    }else{

      dispatch({type: 'add-expense', payload: {expenses: expense}})
    }
    ///reiniciar el state
    setError('')
    setExpense({
      amount: 0,
      expenseName: '',
      category: '',
      date: new Date()
    })
    setPreviousBudget(0)
  }

  return (
    <form className="space-y-5" onSubmit={ handleSubmit}>
      <legend className="uppercase text-center text-2xl font-black border-b-4 border-blue-500 py-2">{state.editingId ? 'Actualizar gasto': 'Nuevo Gasto'}</legend>
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="ExpenseName" className="text-xl">Nombre Del gasto: </label>
        <input
          type="text"
          id="expenseName"
          placeholder="Añadir Gasto"
          className="bg-slate-100 p-2"
          name="expenseName"
          value={expense.expenseName}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="amount" className="text-xl">Cantidad Del gasto: </label>
        <input
          type="number"
          id="amount"
          placeholder="Añadir Cantidad ej. 300"
          className="bg-slate-100 p-2"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-xl">Categoria: </label>
        <Select
          id="category"
          className="bg-slate-100 p-2"
          name="category"
          value={expense.category}
          onChange={handleChange}
        >
          <option value="">-- Seleccione --</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="amount" className="text-xl">Fecha Del gasto: </label>
        <DatePicker
          className="bg-slate-100 p-2 border-"
          value={expense.date}
          onChange={handleDate}
        />
      </div>
      <input
        type="submit"
        className="bg-blue-600 cursor-pointer w-full p-2 text-white uppercase font-bold rounded-lg"
        value={state.editingId? "Guardar Cambio":"Registrar gasto"}
      />
    </form>
  )
}
