import { useContext } from "react";
import { BudgetContext } from "../context/BudgetContext"; // se obtiene el conext creado en el context api para poder ser usado en el context sin tener que estar llamando siempre al useContext de react

export const useBudget = () => {
  const context = useContext(BudgetContext) /// y de esta manera usamos este useContext una sola vez para obtener el contenido del context APi
  if(!context){
    throw new Error("useBudget must be used within a budgetProvider");

  }

  return context
}
