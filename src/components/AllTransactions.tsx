import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategories } from '../hooks/useCategories'
import { formatCurrecy } from '../helpers'
import type { TransactionRow } from '../helpers/transactions'
import '../i18n/reportsPageResources'
import CategoryIcon from './CategoryIcon'
import DataTable, { type DataTableColumn } from './ui/DataTable'
import EmptyState from './ui/EmptyState'
import StatusBadge from './ui/StatusBadge'

interface AllTransactionsProps {
  transactions: TransactionRow[]
}

export default function AllTransactions({ transactions }: AllTransactionsProps) {
  const { categories } = useCategories()
  const { t, i18n } = useTranslation()
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' }),
    [i18n.language],
  )

  if (transactions.length === 0) {
    return <EmptyState icon="receipt_long" title={t('reportsPage.modal.noTransactions')} />
  }

  const typeBadge = (row: TransactionRow) => {
    if (row.isFixed) return <StatusBadge icon="event_repeat">{t('reportsPage.type.fixed')}</StatusBadge>
    if (row.status === 'paid') {
      return (
        <StatusBadge tone="success" icon="check_circle">
          {t('reportsPage.type.paid')}
        </StatusBadge>
      )
    }
    if (row.status === 'partial') {
      return (
        <StatusBadge tone="warning" icon="incomplete_circle">
          {t('reportsPage.type.partial')}
        </StatusBadge>
      )
    }
    return <StatusBadge icon="receipt">{t('reportsPage.type.expense')}</StatusBadge>
  }

  const columns: DataTableColumn<TransactionRow>[] = [
    {
      key: 'date',
      header: t('reportsPage.table.date'),
      hideBelow: 'sm',
      cell: (row) => <span className="whitespace-nowrap text-ui-fg-muted">{dateFormat.format(new Date(row.date))}</span>,
    },
    {
      key: 'category',
      header: t('reportsPage.table.category'),
      cell: (row) => {
        const info = categories.find((category) => category.id === row.category)
        return (
          <div className="flex min-w-0 items-center gap-2">
            <CategoryIcon icon={info?.icon} color={info?.color} name={info?.name || row.category} size="sm" />
            <span className="truncate">{info?.name || row.category}</span>
          </div>
        )
      },
    },
    {
      key: 'name',
      header: t('reportsPage.table.name'),
      cell: (row) => <span className="block max-w-[220px] truncate">{row.name}</span>,
    },
    {
      key: 'type',
      header: t('reportsPage.table.type'),
      hideBelow: 'md',
      cell: typeBadge,
    },
    {
      key: 'amount',
      header: t('reportsPage.table.amount'),
      align: 'right',
      cell: (row) => formatCurrecy(row.amount),
    },
  ]

  return (
    <DataTable
      caption={t('reportsPage.modal.allTitle')}
      columns={columns}
      rows={transactions}
      getRowKey={(row) => `${row.isFixed ? 'fixed' : 'expense'}-${row.id}`}
    />
  )
}
