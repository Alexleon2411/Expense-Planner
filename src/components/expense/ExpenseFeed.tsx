import React, { useState, useMemo, useEffect } from 'react';
import ExpenseDetail2 from './ExpenseDetail2';
import Filter from './FilterSection';
import type { DateRange, FilterStatus } from './FilterSection';
import TableRecentTransactions from "./TableRecentTrasactions"
import AddNewTrasaction from './AddNewTransaction';
import { expensesApi } from '../../api'
import type { ExpenseResponse } from '../../api/expenses'
import { Expense } from '../../types';
import { useTranslation } from 'react-i18next';

interface ExpenseFeedProps {
  title?: string;
  searchTerm?: string;
}

function getDateBoundaries(range: DateRange): { start: Date; end: Date } | null {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (range) {
    case 'last7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case 'last30': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case 'currentMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end };
    }
    case 'previousQuarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const prevQuarterStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
      const prevQuarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0, 23, 59, 59, 999);
      return { start: prevQuarterStart, end: prevQuarterEnd };
    }
    default:
      return null;
  }
}

function parseExpenseDate(date: Expense['date']): Date | null {
  if (!date) return null;
  if (Array.isArray(date)) return null;
  if (date instanceof Date) return date;
  const d = new Date(date as string);
  return isNaN(d.getTime()) ? null : d;
}

const PAGE_SIZE = 200

function mapExpense(expense: ExpenseResponse): Expense | null {
  if (expense.kind === 'fixed' || expense.templateId) return null
  return {
    id: expense.id,
    expenseName: expense.name,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    comment: expense.comment,
    status: (expense.status as Expense['status']) || 'pending',
    partialAmount: expense.partialAmount,
    type: (expense.type as Expense['type']) || 'expense',
    kind: expense.kind === 'fixed' ? 'fixed' : 'variable',
  }
}

function filterExpenses(expenses: Expense[], category: string, status: FilterStatus, dateRange: DateRange): Expense[] {
  return expenses.filter((expense) => {
    if (category && expense.category !== category) return false;

    if (status !== 'all') {
      if ((expense.status || 'pending') !== status) return false;
    }

    if (dateRange !== 'all') {
      const boundaries = getDateBoundaries(dateRange);
      if (boundaries) {
        const expenseDate = parseExpenseDate(expense.date);
        if (!expenseDate || expenseDate < boundaries.start || expenseDate > boundaries.end) return false;
      }
    }

    return true;
  });
}

const ExpenseFeed: React.FC<ExpenseFeedProps> = ({ searchTerm = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partialData, setPartialData] = useState<{ category: string; amount: number } | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const { t } = useTranslation()

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('all');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false
    const now = new Date()
    const params: { month?: number; year?: number; status?: string; category?: string; page: number; limit: number } = {
      page: 1,
      limit: PAGE_SIZE,
    }
    if (selectedDateRange === 'currentMonth') {
      params.month = now.getMonth() + 1
      params.year = now.getFullYear()
    }
    if (selectedStatus !== 'all') params.status = selectedStatus
    if (selectedCategory) params.category = selectedCategory

    const load = async () => {
      setLoadingList(true)
      try {
        const first = await expensesApi.listExpenses(params)
        const pages = [first.expenses]
        for (let page = 2; page <= first.totalPages; page++) {
          const next = await expensesApi.listExpenses({ ...params, page })
          pages.push(next.expenses)
        }
        if (cancelled) return
        setExpenses(pages.flat().map(mapExpense).filter((expense): expense is Expense => expense !== null))
      } catch (error) {
        console.error('Error al cargar los gastos', error)
      } finally {
        if (!cancelled) setLoadingList(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [selectedCategory, selectedStatus, selectedDateRange, reloadKey]);

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
    return filterExpenses(expenses, selectedCategory, selectedStatus, selectedDateRange)
      .filter((expense) => {
        if (!normalizedSearch) return true;
        return [expense.expenseName, expense.category, expense.comment]
          .filter(Boolean)
          .some((value) => String(value).toLocaleLowerCase().includes(normalizedSearch));
      });
  }, [expenses, selectedCategory, selectedStatus, selectedDateRange, searchTerm]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const openEmptyModal = () => {
    setPartialData(null);
    setIsModalOpen(true);
  };

  const handleExpenseCreated = () => {
    setReloadKey((key) => key + 1);
  };

  const handleDeleted = (id: string) => {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  };

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDrawerOpen(true);
  };

  return (
    <section>
      <main className="min-h-screen">
        <div className="p-lg space-y-lg">
            <div className="mb-xl text-center py-xl relative overflow-hidden rounded-xl bg-primary-container text-on-primary">
                <div className="relative z-10">
                    <h2 className="text-headline-lg font-headline-lg mb-xs">{t('expense.title')}</h2>
                    <p className="text-body-md opacity-80 max-w-2xl mx-auto">{t('expense.description')}</p>
                </div>
            </div>
            <div className="flex justify-start">
              <button
                className="py-md px-lg bg-primary text-on-primary rounded-lg font-body-md font-bold flex items-center gap-xs shadow-md hover:opacity-90"
                onClick={openEmptyModal}>
              <span className="material-symbols-outlined" data-icon="add">add</span>
              {t('expense.addTransaction')}
              </button>
            </div>
          <Filter
            category={selectedCategory}
            status={selectedStatus}
            dateRange={selectedDateRange}
            onCategoryChange={setSelectedCategory}
            onStatusChange={setSelectedStatus}
            onDateRangeChange={setSelectedDateRange}
          />
          {loadingList && filteredExpenses.length === 0 && (
            <p className="text-body-sm text-on-surface-variant">{t('common.loading')}</p>
          )}
          <TableRecentTransactions
            expenses={filteredExpenses}
            onRowClick={handleRowClick}
            loadingMore={loadingList}
            onDeleted={handleDeleted}
          />
        </div>
      </main>

      <AddNewTrasaction
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategory={partialData?.category}
        initialAmount={partialData?.amount}
        onExpenseCreated={handleExpenseCreated}
      />

      <ExpenseDetail2
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        expense={selectedExpense}
      />
    </section>
  );
};

export default ExpenseFeed;
