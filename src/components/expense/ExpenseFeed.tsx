import React, { useState, useMemo, useEffect } from 'react';
import ExpenseDetail2 from './ExpenseDetail2';
import Filter from './FilterSection';
import type { DateRange, FilterStatus } from './FilterSection';
import TableRecentTransactions from "./TableRecentTrasactions"
import AddNewTrasaction from './AddNewTransaction';
import { useBudget } from "../../hooks/useBudget"
import { Expense } from '../../types';

interface ExpenseFeedProps {
  title?: string;
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

const ExpenseFeed: React.FC<ExpenseFeedProps> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partialData, setPartialData] = useState<{ category: string; amount: number } | null>(null);
  const { state, getAllExpenses, loadMoreExpenses, apiLoading } = useBudget();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    setPage(1);
    getAllExpenses(1, ITEMS_PER_PAGE).then((result) => {
      if (result) setTotalPages(result.totalPages);
    });
  }, [getAllExpenses]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const result = await loadMoreExpenses(nextPage, ITEMS_PER_PAGE);
    if (result) {
      setTotalPages(result.totalPages);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('all');

  const filteredExpenses = useMemo(
    () => filterExpenses(state.expenses, selectedCategory, selectedStatus, selectedDateRange),
    [state.expenses, selectedCategory, selectedStatus, selectedDateRange]
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const openEmptyModal = () => {
    setPartialData(null);
    setIsModalOpen(true);
  };

  const handleExpenseCreated = () => {
    setPage(1);
    getAllExpenses(1, ITEMS_PER_PAGE).then((result) => {
      if (result) setTotalPages(result.totalPages);
    });
  };

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDrawerOpen(true);
  };

  return (
    <section>
      <main className="min-h-screen">
        <div className="p-lg space-y-lg">
            <div className="flex justify-end">
              <button
                className="py-md px-lg bg-primary text-on-primary rounded-lg font-body-md font-bold flex items-center gap-xs shadow-md hover:opacity-90"
                onClick={openEmptyModal}>
              <span className="material-symbols-outlined" data-icon="add">add</span>
              Add Transaction
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
          <TableRecentTransactions
            expenses={filteredExpenses}
            onRowClick={handleRowClick}
            hasMore={page < totalPages}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
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
