import { useBudget } from "../hooks/useBudget";
import AmountDisplay from "./AmountDisplay";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"
import { useTranslation } from 'react-i18next'

export default function BudgetTracker() {

  const { state, reminderBudget, totalExpense, restartApp, apiLoading } = useBudget()
  const { t } = useTranslation()
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
          text={t('budgetTracker.spentPercentage', { percentage })}
        />
      </div>
      <div className="flex flex-col justify-center items-center gap-8">
        <button
          type="button"
          className="bg-pink-600 hover:bg-pink-700 w-full p-2 text-white uppercase font-bold rounded-lg"
          onClick={() => restartApp()}
          disabled={apiLoading}
        >
          {apiLoading ? t('budgetTracker.resetting') : t('budgetTracker.reset')}
        </button>
        <AmountDisplay
           label={t('dashboard.budget')}
          amount={state.budget}
        />
        <AmountDisplay
           label={t('dashboard.available')}
          amount={reminderBudget}
        />
        <AmountDisplay
           label={t('dashboard.spent')}
          amount={totalExpense}
        />
      </div>
    </div>
  )
}
