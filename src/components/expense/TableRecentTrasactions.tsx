import { useMemo, useState } from 'react';
import { useCategories } from "../../hooks/useCategories"
import { useBudget } from "../../hooks/useBudget"
import { Expense } from '../../types';
import CategoryIcon from '../CategoryIcon';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';

interface TableRecentTransactionsProps {
    expenses: Expense[];
    onRowClick: (expense: Expense) => void;
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
    onDeleted?: (id: string) => void;
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

const statusMap: Record<string, { key: string; className: string }> = {
    paid: { key: 'expense.paid', className: 'bg-emerald-400/[0.12] text-[#34D399]' },
    pending: { key: 'expense.pending', className: 'bg-amber-400/[0.12] text-[#FBBF24]' },
    partial: { key: 'expense.partial', className: 'bg-blue-500/[0.12] text-[#60A5FA]' },
};

const statusPillClassName = 'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium uppercase';

function formatDate(date: Expense['date']): string {
    if (!date) return '';
    if (Array.isArray(date)) return '';
    const d = date instanceof Date ? date : new Date(date as string);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(amount: number): string {
    return amount.toLocaleString(i18n.language, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type EditStatus = 'paid' | 'pending' | 'partial';

export default function TableRecentTransactions({ expenses, onRowClick, hasMore, loadingMore, onLoadMore, onDeleted }: TableRecentTransactionsProps) {
  const { categories } = useCategories();
  const { editExpense, updateExpensePartialAmount, removeExpense } = useBudget();
  const { t } = useTranslation()

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
        status: t(statusInfo.key),
        icon: categoryById[expense.category]?.icon || null,
        categoryColor: categoryById[expense.category]?.color || null,
        displayAmount: `${expense.type === 'saving' ? '+' : '-'}${formatAmount(expense.amount)}`,
        statusLabel: t(statusInfo.key),
        statusClassName: statusInfo.className,
        rawStatus: expense.status || 'pending',
        rawAmount: expense.amount,
        partialAmount: expense.partialAmount,
      };
    });
  }, [expenses, categoryById, t]);

  const startEditing = (row: Row, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expenses.some((expense) => expense.id === row.id && expense.type === 'saving')) return;
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

  const handleDelete = async (expense: Expense, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t('expense.confirmDelete'))) return;
    try {
      await removeExpense(expense.id);
      onDeleted?.(expense.id);
    } catch (error) {
      console.error('Error al eliminar el gasto', error);
    }
  };

  const statusBtnClass = (s: EditStatus) =>
    `inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:min-h-8 ${
      editStatus === s
        ? 'border-[#3B82F6] bg-[#3B82F6] text-white'
        : 'border-white/[0.08] text-[#9CA3AF] hover:border-[#3B82F6] hover:text-[#F9FAFB]'
    }`;

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[0.08] bg-[#14171F]">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
         <h3 className="text-sm font-medium text-[#F9FAFB]">{t('expense.recent')}</h3>
         <span className="hidden text-xs text-[#9CA3AF] sm:inline">{t('expense.showing', { count: rows.length })}</span>
      </div>
      <div className="hidden sm:block overflow-x-auto max-h-[480px] overflow-y-auto relative">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.08]">
               <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF]">{t('expense.date')}</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF]">{t('expense.merchant')}</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF]">{t('expense.category')}</th>
               <th className="px-4 py-3 text-right font-mono text-xs font-medium tabular-nums text-[#9CA3AF]">{t('expense.amountLabel')}</th>
               <th className="px-4 py-3 text-center text-xs font-medium text-[#9CA3AF]">{t('expense.statusLabel')}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.08]">
            {rows.map((row) => {
              const expense = expenses.find(e => e.id === row.id);
              const isEditing = editingId === row.id;

              return (
                <tr
                  key={row.id}
                  className="cursor-pointer transition-colors hover:bg-white/[0.03] group"
                  onClick={() => !isEditing && expense && onRowClick(expense)}
                >
                  <td className="px-4 py-3 text-sm text-[#9CA3AF]">{row.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-sm">
                      <span className="text-sm font-medium text-[#F9FAFB]">{row.merchant}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-sm">
                      <CategoryIcon
                        icon={row.icon}
                        color={row.categoryColor}
                        name={row.category}
                        size="sm"
                      />
                    <span className="text-sm text-[#9CA3AF]">{row.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-[#F9FAFB]">{row.displayAmount}</td>
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <div className="flex flex-col items-center gap-xs" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-xs">
                           <button className={statusBtnClass('paid')} onClick={() => setEditStatus('paid')} type="button">{t('expense.paid')}</button>
                           <button className={statusBtnClass('pending')} onClick={() => setEditStatus('pending')} type="button">{t('expense.pending')}</button>
                           <button className={statusBtnClass('partial')} onClick={() => setEditStatus('partial')} type="button">{t('expense.partial')}</button>
                        </div>
                        {editStatus === 'partial' && (
                          <div className="flex items-center gap-xs animate-in fade-in duration-200">
                            <span className="text-on-surface-variant text-xs">$</span>
                            <input
                              className="w-20 px-xs py-xs rounded border border-outline-variant bg-surface-container-low text-center text-xs focus:ring-primary focus:outline-none"
                              type="number"
                              step="0.01"
                              min="0"
                              max={row.rawAmount}
                               placeholder={t('expense.amountPlaceholder')}
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
                             {saving ? '...' : t('common.save')}
                          </button>
                           <button className="px-sm py-xs rounded bg-surface-container-high text-xs hover:bg-surface-container-highest" onClick={cancelEditing} type="button">{t('common.cancel')}</button>
                        </div>
                      </div>
                     ) : expense?.type === 'saving' ? (
                       <span className="text-xs text-[#9CA3AF]">{t('expense.legacySavingLabel')}</span>
                     ) : (
                       <button
                        type="button"
                        className={`${statusPillClassName} ${row.statusClassName} transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]`}
                        onClick={(e) => startEditing(row, e)}
                      >
                        {row.statusLabel}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                     {expense?.type !== 'saving' && <button
                       type="button"
                       onClick={(e) => expense && handleDelete(expense, e)}
                      title={t('expense.delete')}
                      aria-label={t('expense.delete')}
                      className="p-xs rounded-full text-error hover:bg-error/10 transition-colors"
                    >
                       <span className="material-symbols-outlined text-[18px]">delete</span>
                     </button>}
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
      <div className="divide-y divide-white/[0.08] sm:hidden">
        {rows.map((row) => {
          const expense = expenses.find(e => e.id === row.id);
          const isEditing = editingId === row.id;
          if (!expense) return null;

          return (
            <article
              key={row.id}
              className="px-4 py-3 transition-colors hover:bg-white/[0.03]"
              onClick={() => !isEditing && onRowClick(expense)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#F9FAFB]">{row.merchant}</p>
                  <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#9CA3AF]">
                    <CategoryIcon icon={row.icon} color={row.categoryColor} name={row.category} size="sm" />
                    <span className="min-w-0 flex-1 truncate">{row.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0 whitespace-nowrap">{row.date}</span>
                  </div>
                </div>
                <span className="max-w-[45%] shrink-0 whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-[#F9FAFB]">{row.displayAmount}</span>
              </div>
              <div className="mt-2 min-w-0" onClick={(e) => e.stopPropagation()}>
                {isEditing ? (
                  <div className="space-y-sm">
                    <div className="flex flex-wrap gap-2">
                       <button className={statusBtnClass('paid')} onClick={() => setEditStatus('paid')} type="button">{t('expense.paid')}</button>
                       <button className={statusBtnClass('pending')} onClick={() => setEditStatus('pending')} type="button">{t('expense.pending')}</button>
                       <button className={statusBtnClass('partial')} onClick={() => setEditStatus('partial')} type="button">{t('expense.partial')}</button>
                    </div>
                    {editStatus === 'partial' && (
                      <input
                        className="w-full px-sm py-xs rounded border border-outline-variant bg-surface-container-low text-sm focus:ring-primary focus:outline-none"
                        type="number"
                        step="0.01"
                        min="0"
                        max={row.rawAmount}
                         placeholder={t('expense.partialAmount')}
                        value={editPartialAmount}
                        onChange={(e) => setEditPartialAmount(e.target.value)}
                      />
                    )}
                    <div className="flex flex-wrap gap-2">
                       <button className="flex-1 px-sm py-xs rounded bg-green-600 text-white text-xs font-bold disabled:opacity-50" onClick={() => saveStatus(expense)} disabled={saving || (editStatus === 'partial' && (!editPartialAmount || parseFloat(editPartialAmount) <= 0))} type="button">{saving ? '...' : t('expense.saveStatus')}</button>
                       <button className="px-sm py-xs rounded bg-surface-container-high text-xs" onClick={cancelEditing} type="button">{t('common.cancel')}</button>
                    </div>
                  </div>
                ) : expense.type === 'saving' ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#9CA3AF]">{t('expense.legacySavingLabel')}</span>
                    <span className="text-body-xs text-on-surface-variant">{t('expense.details')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <button className={`${statusPillClassName} ${row.statusClassName} transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]`} onClick={(e) => startEditing(row, e)} type="button">{row.statusLabel}</button>
                    <div className="flex items-center gap-xs">
                      <span className="text-body-xs text-on-surface-variant">{t('expense.details')}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(expense, e)}
                        title={t('expense.delete')}
                        aria-label={t('expense.delete')}
                        className="p-xs rounded-full text-error hover:bg-error/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {hasMore && (
        <div className="flex justify-center border-t border-white/[0.08] p-4">
          <button
            className="text-primary font-bold text-body-sm hover:underline flex items-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                 {t('common.loading')}
              </>
            ) : (
              <>
                 {t('expense.loadMore')}
                <span className="material-symbols-outlined text-[18px]" data-icon="refresh">refresh</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
