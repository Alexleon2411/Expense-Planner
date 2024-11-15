
import { useEffect, useMemo, useState } from "react"
import BudgetForm from "./components/BudgetForm"
import { useBudget } from "./hooks/useBudget"
import BudgetTracker from "./components/BudgetTracker"
import ExpenseModal from "./components/ExpendsModal"
import ExpenseList from "./components/ExpenseList"
import FilterByCategory from "./components/FilterByCategory"
import SplashScreen from "./components/SplashScreen"


function App() {
  const [isLoading, setIsLoading] = useState(false)
  const { state } = useBudget()

  const isValidBudget = useMemo(() => state.budget > 0, [state])
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(state.expenses) )
    localStorage.setItem('budget', JSON.stringify(state.budget))
  })

  const handleFinishLoading = () => {
    setIsLoading(false)
  }

  return (
    <>
    {isLoading ? (
      <SplashScreen
        onFinish={handleFinishLoading}
      />
    ): (
      <>
        <header className="bg-blue-600 py-8 max-h-72">
          <h1 className="uppercase text-center font-black text-4xl text-white ">Planificador de Gastos</h1>
        </header>
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-ld mt-10 p-10">
          {isValidBudget ? <BudgetTracker/> : <BudgetForm/> }
        </div>
          {isValidBudget && (
          <main className="max-w-3xl mx-auto py-10">
            <FilterByCategory/>
            <ExpenseList/>
            <ExpenseModal/>
          </main>
          )}
      </>
    )}
    </>
  )
}

export default App
