import { useCategories } from "../../hooks/useCategories";
import { useTranslation } from 'react-i18next';

export type DateRange = 'all' | 'last7' | 'last30' | 'currentMonth' | 'previousQuarter';
export type FilterStatus = 'all' | 'paid' | 'pending' | 'partial';

interface FilterProps {
  category: string;
  status: FilterStatus;
  dateRange: DateRange;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: FilterStatus) => void;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export default function Filter({
  category,
  status,
  dateRange,
  onCategoryChange,
  onStatusChange,
  onDateRangeChange,
}: FilterProps) {
  const { categories } = useCategories();
  const { t } = useTranslation()

  const selectClassName = 'h-9 appearance-none rounded-md border border-white/[0.08] bg-[#1B202B] px-3 pr-9 text-sm text-[#F9FAFB] outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30';

  const statusButtonClass = (btnStatus: FilterStatus) => {
    return `flex min-h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-md px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] sm:h-8 sm:min-h-0 sm:rounded-full sm:px-3 ${
      status === btnStatus
        ? 'bg-[#3B82F6] text-white'
        : 'text-[#9CA3AF] hover:bg-white/[0.06] hover:text-[#F9FAFB]'
    }`;
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-white/[0.08] bg-[#14171F] p-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3">
        <label className="grid min-w-0 grid-cols-[6rem_minmax(0,1fr)] items-center gap-2 text-xs text-[#9CA3AF] sm:flex">
          <span className="shrink-0">{t('filters.dateRange')}</span>
          <span className="relative block w-full min-w-0 sm:inline-flex sm:w-auto">
            <select
              className={`${selectClassName} w-full min-w-0 cursor-pointer sm:w-[164px]`}
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
            >
              <option value="all">{t('filters.allDates')}</option>
              <option value="last7">{t('filters.last7')}</option>
              <option value="last30">{t('filters.last30')}</option>
              <option value="currentMonth">{t('filters.currentMonth')}</option>
              <option value="previousQuarter">{t('filters.previousQuarter')}</option>
            </select>
            <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[#9CA3AF]">expand_more</span>
          </span>
        </label>
        <label className="grid min-w-0 grid-cols-[6rem_minmax(0,1fr)] items-center gap-2 text-xs text-[#9CA3AF] sm:flex">
          <span className="shrink-0">{t('filters.category')}</span>
          <span className="relative block w-full min-w-0 sm:inline-flex sm:w-auto">
            <select
              className={`${selectClassName} w-full min-w-0 cursor-pointer sm:w-[180px]`}
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="">{t('filters.allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[#9CA3AF]">expand_more</span>
          </span>
        </label>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center" role="group" aria-label={t('filters.paymentStatus')}>
          <span className="shrink-0 text-xs text-[#9CA3AF]">{t('filters.paymentStatus')}</span>
          <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-[#0B0D11] p-1 sm:inline-grid sm:w-auto sm:grid-cols-4 sm:rounded-full">
            <button type="button" aria-pressed={status === 'all'} className={statusButtonClass('all')} onClick={() => onStatusChange('all')}>{t('filters.all')}</button>
            <button type="button" aria-pressed={status === 'paid'} className={statusButtonClass('paid')} onClick={() => onStatusChange('paid')}>{t('expense.paid')}</button>
            <button type="button" aria-pressed={status === 'pending'} className={statusButtonClass('pending')} onClick={() => onStatusChange('pending')}>{t('expense.pending')}</button>
            <button type="button" aria-pressed={status === 'partial'} className={statusButtonClass('partial')} onClick={() => onStatusChange('partial')}>{t('expense.partial')}</button>
          </div>
        </div>
    </div>
  );
}
