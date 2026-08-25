import { useBudget } from "../hooks/useBudget";
import AmountDisplay from "./AmountDisplay";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"

export default function BudgetTracker() {

  const { state, reminderBudget, totalExpense, restartApp, apiLoading } = useBudget()
  const percentage = +((totalExpense / state.budget) * 100).toFixed(2)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="flex justify-center">
        <CircularProgressbar
          value={percentage}
          styles={buildStyles({
            pathColor: percentage === 100 ? '#1B3B5A' : '#34506D',
            trailColor: '#E1E8F0',
            textSize: 8,
            textColor: percentage === 100 ? '#1B3B5A' : '#34506D',
          })}
          text={`${percentage}% Gastado`}
        />
      </div>
      <div className="flex flex-col justify-center items-center gap-8">
        <button
          type="button"
          className="bg-pink-600 hover:bg-pink-700 w-full p-2 text-white uppercase font-bold rounded-lg"
          onClick={() => restartApp()}
          disabled={apiLoading}
        >
          {apiLoading ? 'Reiniciando...' : 'Reset App'}
        </button>
        <AmountDisplay
          label={'Presupuesto'}
          amount={state.budget}
        />
        <AmountDisplay
          label={'Disponible'}
          amount={reminderBudget}
        />
        <AmountDisplay
          label={'Gastado'}
          amount={totalExpense}
        />
      </div>
    </div>
  )
}
