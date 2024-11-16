
import { useMemo, useState } from "react"
import { useBudget } from "../hooks/useBudget"
import {NumericFormat} from 'react-number-format'



export default function BudgetForm() {


  const [budgetInput, setBudgetInput] = useState('')
  const { dispatch } = useBudget()
  const isValid = useMemo(() => {
    const numericBudget = parseFloat(budgetInput);
    return isNaN(numericBudget) || numericBudget <= 0;
  }, [budgetInput]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const numericBudget = parseFloat(budgetInput); // Convertir a número antes de enviar
    dispatch({ type: "add-budget", payload: { budget: numericBudget } });
    setBudgetInput(""); // Reiniciar el campo de input

  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudgetInput(e.target.value)
  }
  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-5">
        <label htmlFor="budget" className="text-4xl text-blue-600 font-bold text-center">Define tu presupuesto</label>
        <NumericFormat
          className="w-full bg-white border border-gray-200 p-2 "
          placeholder="Define Tu presupuesto"
          name="budget"
          id="budget"
          min="0"
          value={budgetInput}
          onChange={handleChange}
        />
      </div>
      <input
        type="submit"
        value='Definir presupuesto'
        className={"bg-blue-600 hover:bg-blue-700 cursor-pointer w-full p-2 text-white font-black uppercase disabled:opacity-10"}
        disabled={isValid}

      />
    </form>
  )
}
