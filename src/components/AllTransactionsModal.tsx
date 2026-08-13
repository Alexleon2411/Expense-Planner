import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { expensesApi } from '../api'
import type { ExpenseResponse } from '../api/expenses'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { formatCurrecy } from '../helpers'
import { buildTransactions } from '../helpers/transactions'
import AllTransactions from './AllTransactions'

const MONTHS_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

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

  const total = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[300]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-surface shadow-xl transition-all flex flex-col max-h-[90vh] text-left">
                <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant bg-surface-container-low">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                    <div>
                      <h2 className="text-headline-md font-bold text-on-surface">All Transactions</h2>
                      <p className="text-body-sm text-on-surface-variant">{MONTHS_LONG[month - 1]} {year}</p>
                    </div>
                  </div>
                  <button
                    className="p-xs hover:bg-surface-container rounded-full transition-colors"
                    onClick={onClose}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-lg">
                  {loading ? (
                    <div className="flex items-center justify-center py-24">
                      <p className="text-body-lg text-on-surface-variant">Loading transactions...</p>
                    </div>
                  ) : (
                    <AllTransactions transactions={transactions} />
                  )}
                </div>

                <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between">
                  <p className="text-body-sm text-on-surface-variant">
                    {transactions.length} transaction{transactions.length === 1 ? '' : 's'} &middot; Total {formatCurrecy(total)}
                  </p>
                  <button
                    className="px-md py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
