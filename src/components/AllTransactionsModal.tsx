import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { expensesApi } from '../api'
import type { ExpenseResponse } from '../api/expenses'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { formatCurrecy } from '../helpers'
import { buildTransactions } from '../helpers/transactions'
import '../i18n/reportsPageResources'
import AllTransactions from './AllTransactions'
import Button from './ui/Button'
import DialogShell from './ui/DialogShell'
import Skeleton from './ui/Skeleton'

interface AllTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
  month: number
  year: number
}

export default function AllTransactionsModal({ isOpen, onClose, month, year }: AllTransactionsModalProps) {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [loading, setLoading] = useState(false)

  const { fixedExpenses } = useFixedExpenses()
  const { t, i18n } = useTranslation()
  const monthLabel = new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(new Date(year, month - 1, 1))

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    expensesApi
      .listExpenses({ month, year, page: 1, limit: 500 })
      .then((res) => setExpenses(res.expenses))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, month, year])

  const transactions = useMemo(
    () => buildTransactions(expenses, fixedExpenses, month, year),
    [expenses, fixedExpenses, month, year],
  )

  const total = transactions.reduce((sum, row) => sum + row.amount, 0)

  return (
    <DialogShell
      open={isOpen}
      onClose={onClose}
      size="lg"
      title={t('reportsPage.modal.allTitle')}
      subtitle={`${monthLabel} ${year}`}
      closeLabel={t('reportsPage.close')}
      footer={
        <>
          <p className="text-ui-caption tabular-nums text-ui-fg-muted">
            {t('reportsPage.modal.footerTotal', { count: transactions.length, total: formatCurrecy(total) })}
          </p>
          <Button variant="secondary" onClick={onClose}>
            {t('reportsPage.close')}
          </Button>
        </>
      }
    >
      {loading ? (
        <div aria-busy="true" className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((row) => (
            <Skeleton key={row} className="h-11" />
          ))}
        </div>
      ) : (
        <AllTransactions transactions={transactions} />
      )}
    </DialogShell>
  )
}
