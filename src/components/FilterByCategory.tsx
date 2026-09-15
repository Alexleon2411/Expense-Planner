import { useBudget } from "../hooks/useBudget";
import { useCategories } from "../hooks/useCategories";
import { useTranslation } from 'react-i18next';


export default function FilterByCategory() {

  const {dispatch} = useBudget()
  const { categories } = useCategories()
  const { t } = useTranslation()
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({type: 'add-filter-category', payload: {id: e.target.value}})
  }
  return (
    <div className="bg-white shadow-lg rounded-lg p-10">
      <form>
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <label htmlFor="category">{t('filters.filterExpenses')}</label>
          <select  id="category" className="bg-slate-100 p-3 flex-1 rounded" onChange={handleChange}>
            <option value="">--- {t('filters.allCategories')} ---</option>
            {categories.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
      </form>
    </div>
  )
}
