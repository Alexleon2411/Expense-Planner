import { useState, useEffect } from 'react'
import { statsApi } from '../api'
import CategoryPieChart from './CategoryPieChart'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

export default function Statistics() {
  const [period, setPeriod] = useState<Period>('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [overview, setOverview] = useState<{ totalSpent: number; budgeted: number; remaining: number; percentage: number } | null>(null)
  const [categoryData, setCategoryData] = useState<{ category: string; total: number; count: number }[]>([])
  const [trends, setTrends] = useState<{ month: number; total: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      statsApi.getOverview(month, year),
      statsApi.getCategoryBreakdown(month, year),
      statsApi.getMonthlyTrend(year),
    ])
      .then(([ov, cat, tr]) => {
        setOverview(ov)
        setCategoryData(cat)
        setTrends(tr)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period, year, month])

  if (loading) return <p className="text-center py-8 text-gray-500">Cargando estadísticas...</p>

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-bold text-sm uppercase ${
                  period === p ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {p === 'daily' ? 'Diario' : p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensual' : 'Anual'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              className="bg-slate-100 p-2 border rounded"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es-MX', { month: 'long' })}</option>
              ))}
            </select>
            <input
              type="number"
              className="bg-slate-100 p-2 border rounded w-20"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2020}
              max={2100}
            />
          </div>
        </div>

        {overview && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Presupuesto</p>
              <p className="text-2xl font-black text-blue-600">${overview.budgeted.toLocaleString('es-MX')}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Gastado</p>
              <p className="text-2xl font-black text-green-600">${overview.totalSpent.toLocaleString('es-MX')}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Disponible</p>
              <p className="text-2xl font-black text-orange-600">${overview.remaining.toLocaleString('es-MX')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Distribución por Categoría</h3>
        <CategoryPieChart data={categoryData} />
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Tendencia Mensual</h3>
        {trends.length > 0 ? (
          <div className="space-y-2">
            {trends.map((t) => (
              <div key={t.month} className="flex items-center gap-3">
                <span className="w-24 text-sm font-semibold capitalize">
                  {new Date(0, t.month - 1).toLocaleString('es-MX', { month: 'long' })}
                </span>
                <div className="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.min((t.total / (overview?.budgeted || 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="w-24 text-right font-bold">${t.total.toLocaleString('es-MX')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Sin datos para este año</p>
        )}
      </div>
    </div>
  )
}
