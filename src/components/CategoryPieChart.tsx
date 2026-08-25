import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useCategories } from '../hooks/useCategories'

const COLORS = ['#0A1B2E', '#112A46', '#1B3B5A', '#34506D', '#557392', '#7A8CA6', '#A1B3C4', '#C4D2E1']

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
          >
            {enrichedData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{ borderRadius: '1.5rem', border: '1px solid #C4D2E1', boxShadow: '0 4px 12px rgba(10,27,46,0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-4 space-y-1.5">
        {enrichedData.map((d, i) => (
          <li key={d.category} className="flex items-center gap-2 text-sm min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 truncate">{d.name}</span>
            <span className="font-bold shrink-0 text-xs sm:text-sm text-right">${d.total.toLocaleString('es-MX')} · {((d.total / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
      <p className="text-center text-lg font-bold mt-2">Total: ${total.toLocaleString('es-MX')}</p>
    </div>
  )
}
