import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useCategories } from '../hooks/useCategories'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

interface Props {
  data: { category: string; total: number; count: number }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFormatter = (value: any) =>
  [`$${Number(value).toLocaleString('es-MX')}`, 'Monto'] as [string, string]

export default function CategoryPieChart({ data }: Props) {
  const { categories } = useCategories()
  const total = data.reduce((s, d) => s + d.total, 0)

  const enrichedData = data.map((d) => {
    const cat = categories.find((c) => c.id === d.category)
    return { ...d, name: cat?.name || d.category }
  })

  if (data.length === 0) {
    return <p className="text-gray-500 text-center py-8">Sin datos para mostrar</p>
  }

  const renderLabel = (entry: { name?: string; percent?: number }) =>
    `${entry.name || ''} ${((entry.percent || 0) * 100).toFixed(0)}%`

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={enrichedData}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={renderLabel}
          >
            {enrichedData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-lg font-bold mt-2">Total: ${total.toLocaleString('es-MX')}</p>
    </div>
  )
}
