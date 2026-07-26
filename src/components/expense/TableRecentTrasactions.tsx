import { useMemo, useState } from 'react';
import { useCategories } from "../../hooks/useCategories"
import { useBudget } from "../../hooks/useBudget"
import { Expense } from '../../types';
import CategoryIcon from '../CategoryIcon';

interface TableRecentTransactionsProps {
    expenses: Expense[];
    onRowClick: (expense: Expense) => void;
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
}

interface Row {
    id: string;
    merchant: string;
    amount: string;
    category: string;
    date: string;
    status: string;
    icon: string | null;
    categoryColor: string | null;
    displayAmount: string;
    statusLabel: string;
    statusClassName: string;
    rawStatus: string;
    rawAmount: number;
    partialAmount?: number;
}

const statusMap: Record<string, { label: string; className: string }> = {
    paid: { label: 'Paid', className: 'status-paid' },
    pending: { label: 'Pending', className: 'status-pending' },
    partial: { label: 'Partial', className: 'status-partial' },
};

function formatDate(date: Expense['date']): string {
    if (!date) return '';
    if (Array.isArray(date)) return '';
    const d = date instanceof Date ? date : new Date(date as string);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type EditStatus = 'paid' | 'pending' | 'partial';

export default function TableRecentTransactions({ expenses, onRowClick, hasMore, loadingMore, onLoadMore }: TableRecentTransactionsProps) {
  const { categories } = useCategories();
  const { editExpense, updateExpensePartialAmount } = useBudget();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<EditStatus>('paid');
  const [editPartialAmount, setEditPartialAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const categoryById = useMemo(() => {
    const map: Record<string, typeof categories[0]> = {};
    categories.forEach(c => { map[c.id] = c; });
    return map;
  }, [categories]);

  const rows: Row[] = useMemo(() => {
    return expenses.map((expense) => {
      const statusInfo = statusMap[expense.status || 'pending'];
      return {
        id: expense.id,
        merchant: expense.expenseName,
        amount: formatAmount(expense.amount),
        category: categoryById[expense.category]?.name || expense.category,
        date: formatDate(expense.date),
        status: statusInfo.label,
        icon: categoryById[expense.category]?.icon || null,
        categoryColor: categoryById[expense.category]?.color || null,
        displayAmount: `-${formatAmount(expense.amount)}`,
        statusLabel: statusInfo.label,
        statusClassName: statusInfo.className,
        rawStatus: expense.status || 'pending',
        rawAmount: expense.amount,
        partialAmount: expense.partialAmount,
      };
    });
  }, [expenses, categoryById]);

  const startEditing = (row: Row, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(row.id);
    setEditStatus(row.rawStatus as EditStatus);
    setEditPartialAmount(row.partialAmount ? String(row.partialAmount) : '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPartialAmount('');
  };

  const saveStatus = async (expense: Expense) => {
    setSaving(true);
    try {
      const updated: Expense = {
        ...expense,
        status: editStatus,
        partialAmount: editStatus === 'partial' ? parseFloat(editPartialAmount) || 0 : undefined,
      };
      await editExpense(updated);
      if (editStatus === 'partial') {
        const amt = parseFloat(editPartialAmount) || 0;
        await updateExpensePartialAmount(expense.id, amt);
      }
      cancelEditing();
    } catch (error) {
      console.error('Error al actualizar el estado', error);
    } finally {
      setSaving(false);
    }
  };

  const statusBtnClass = (s: EditStatus) =>
    `px-sm py-xs rounded-full border text-label-caps font-label-caps transition-all text-xs ${
      editStatus === s
        ? 'bg-primary text-white border-primary'
        : 'border-outline-variant text-on-surface-variant hover:border-primary'
    }`;

  return (
    <div className="bento-card !p-0 overflow-hidden relative">
      <div className="p-lg flex justify-between items-center">
        <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase">Recent Transactions</h3>
        <span className="text-body-sm font-body-sm text-outline sm:display-none">Showing {rows.length} items</span>
      </div>
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-lg py-md text-label-caps font-label-caps text-on-surface-variant uppercase">Date</th>
              <th className="px-lg py-md text-label-caps font-label-caps text-on-surface-variant uppercase">Merchant / Recipient</th>
              <th className="px-lg py-md text-label-caps font-label-caps text-on-surface-variant uppercase">Category</th>
              <th className="px-lg py-md text-label-caps font-label-caps text-on-surface-variant uppercase text-right">Amount</th>
              <th className="px-lg py-md text-label-caps font-label-caps text-on-surface-variant uppercase text-center">Status</th>
              <th className="px-lg py-md"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {rows.map((row) => {
              const expense = expenses.find(e => e.id === row.id);
              const isEditing = editingId === row.id;

              return (
                <tr
                  key={row.id}
                  className="hover:bg-surface-container-lowest cursor-pointer transition-colors group"
                  onClick={() => !isEditing && expense && onRowClick(expense)}
                >
                  <td className="px-lg py-md text-body-sm font-body-sm text-on-surface">{row.date}</td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <span className="text-body-md font-body-md text-on-surface font-semibold">{row.merchant}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <CategoryIcon
                        icon={row.icon}
                        color={row.categoryColor}
                        name={row.category}
                        size="sm"
                      />
                      -
                    <span className="py-xs rounded-full text-body-sm text-on-surface-variant">{row.category}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md text-right text-data-mono font-data-mono text-on-surface">{row.displayAmount}</td>
                  <td className="px-lg py-md text-center">
                    {isEditing ? (
                      <div className="flex flex-col items-center gap-xs" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-xs">
                          <button className={statusBtnClass('paid')} onClick={() => setEditStatus('paid')} type="button">Paid</button>
                          <button className={statusBtnClass('pending')} onClick={() => setEditStatus('pending')} type="button">Pending</button>
                          <button className={statusBtnClass('partial')} onClick={() => setEditStatus('partial')} type="button">Partial</button>
                        </div>
                        {editStatus === 'partial' && (
                          <div className="flex items-center gap-xs animate-in fade-in duration-200">
                            <span className="text-on-surface-variant text-xs">$</span>
                            <input
                              className="w-20 px-xs py-xs rounded border border-outline-variant bg-slate-50 text-center text-xs focus:ring-primary focus:outline-none"
                              type="number"
                              step="0.01"
                              min="0"
                              max={row.rawAmount}
                              placeholder="0.00"
                              value={editPartialAmount}
                              onChange={(e) => setEditPartialAmount(e.target.value)}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-xs">
                          <button
                            className="px-sm py-xs rounded bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                            onClick={() => expense && saveStatus(expense)}
                            disabled={saving || (editStatus === 'partial' && (!editPartialAmount || parseFloat(editPartialAmount) <= 0))}
                            type="button"
                          >
                            {saving ? '...' : 'Save'}
                          </button>
                          <button className="px-sm py-xs rounded bg-gray-200 text-xs hover:bg-gray-300" onClick={cancelEditing} type="button">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <span
                        className={`px-sm py-xs rounded-full text-label-caps font-label-caps uppercase ${row.statusClassName} cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={(e) => startEditing(row, e)}
                      >
                        {row.statusLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-lg py-md text-right">
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="chevron_right">chevron_right</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {hasMore && (
          <button
            className="sticky bottom-0 left-1/2 -translate-x-1/2 mb-sm mt-xs px-md py-xs bg-primary text-on-primary rounded-full shadow-lg hover:opacity-90 transition-all flex items-center gap-xs disabled:opacity-50 z-10"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
            )}
          </button>
        )}
      </div>
      {hasMore && (
        <div className="p-lg border-t border-outline-variant flex justify-center">
          <button
            className="text-primary font-bold text-body-sm hover:underline flex items-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Loading...
              </>
            ) : (
              <>
                Load More Transactions
                <span className="material-symbols-outlined text-[18px]" data-icon="refresh">refresh</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
