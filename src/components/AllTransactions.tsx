import { useCategories } from '../hooks/useCategories'
import { formatCurrecy } from '../helpers'
import type { TransactionRow } from '../helpers/transactions'
import CategoryIcon from './CategoryIcon'

interface AllTransactionsProps {
  transactions: TransactionRow[]
}

export default function AllTransactions({ transactions }: AllTransactionsProps) {
  const { categories } = useCategories()
  const getCategoryInfo = (categoryId: string) => categories.find((c) => c.id === categoryId)

  const typeBadge = (isFixed: boolean, status?: string) => {
    if (isFixed) {
      return <span className="px-sm py-xs rounded-full text-[10px] font-bold uppercase bg-secondary/10 text-secondary">Fixed</span>
    }
    if (status === 'paid') {
      return <span className="px-sm py-xs rounded-full text-[10px] font-bold uppercase bg-secondary/10 text-secondary">Paid</span>
    }
    if (status === 'partial') {
      return <span className="px-sm py-xs rounded-full text-[10px] font-bold uppercase bg-tertiary-container/10 text-on-tertiary-container">Partial</span>
    }
    return <span className="px-sm py-xs rounded-full text-[10px] font-bold uppercase bg-surface-container-high text-on-surface-variant">Expense</span>
  }

  return (
    <div>
      <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-left text-body-sm">
        <thead>
          <tr className="text-label-caps font-label-caps text-on-surface-variant border-b border-outline-variant">
            <th className="py-xs pr-md whitespace-nowrap">Date</th>
            <th className="py-xs pr-md">Category</th>
            <th className="py-xs pr-md">Name</th>
            <th className="py-xs pr-md">Type</th>
            <th className="py-xs pr-md text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const info = getCategoryInfo(t.category)
            return (
              <tr key={t.id} className="border-b border-outline-variant/30 last:border-0">
                <td className="py-sm pr-md whitespace-nowrap text-on-surface-variant">
                  {new Date(t.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </td>
                <td className="py-sm pr-md">
                  <div className="flex items-center gap-xs min-w-[120px]">
                    <CategoryIcon icon={info?.icon} color={info?.color} name={info?.name || t.category} size="sm" />
                    <span className="truncate">{info?.name || t.category}</span>
                  </div>
                </td>
                <td className="py-sm pr-md truncate max-w-[220px]">{t.name}</td>
                <td className="py-sm pr-md">{typeBadge(t.isFixed, t.status)}</td>
                <td className="py-sm pr-md text-right font-data-mono">{formatCurrecy(t.amount)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
      <div className="sm:hidden space-y-sm">
        {transactions.map((t) => {
          const info = getCategoryInfo(t.category)
          return (
            <article key={t.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
              <div className="flex items-start justify-between gap-sm">
                <div className="flex min-w-0 items-center gap-sm">
                  <CategoryIcon icon={info?.icon} color={info?.color} name={info?.name || t.category} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.name}</p>
                    <p className="text-body-xs text-on-surface-variant truncate">{info?.name || t.category}</p>
                  </div>
                </div>
                <span className="shrink-0 font-data-mono">{formatCurrecy(t.amount)}</span>
              </div>
              <div className="mt-sm flex items-center justify-between border-t border-outline-variant pt-sm text-body-xs text-on-surface-variant">
                <span>{new Date(t.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                {typeBadge(t.isFixed, t.status)}
              </div>
            </article>
          )
        })}
      </div>
      {transactions.length === 0 && (
        <p className="text-body-sm text-on-surface-variant text-center py-8">No transactions for this period.</p>
      )}
    </div>
  )
}
