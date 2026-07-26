import { useCategories } from "../../hooks/useCategories";

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

  const statusButtonClass = (btnStatus: FilterStatus) => {
    return `px-md py-xs rounded-full border text-primary text-body-sm transition-all ${
      status === btnStatus
        ? 'bg-primary text-white border-primary'
        : 'border-outline-variant '
    }`;
  }

  return (
    <div>
      <div className="bento-card !p-md flex flex-wrap items-center gap-md">
        <div className="flex flex-col gap-xs min-w-[200px] w-[100%] md:w-auto lg:w-auto">
          <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Date Range</span>
          <div className="relative">
            <select
              className="w-full appearance-none bg-surface-container border border-outline-variant rounded-lg px-md py-xs text-body-sm pr-10 focus:ring-primary outline-none cursor-pointer"
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
            >
              <option value="all">All Dates</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="currentMonth">Current Month</option>
              <option value="previousQuarter">Previous Quarter</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="expand_more">expand_more</span>
          </div>
        </div>
        <div className="flex flex-col gap-xs min-w-[200px] w-[100%] md:w-auto lg:w-auto">
          <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Category</span>
          <div className="relative">
            <select
              className="w-full appearance-none bg-surface-container border border-outline-variant rounded-lg px-md py-xs text-body-sm pr-10 focus:ring-primary outline-none cursor-pointer"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="category">category</span>
          </div>
        </div>
        <div className="flex flex-col gap-xs min-w-[200px]">
          <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Payment Status</span>
          <div className="flex items-center gap-xs">
            <button className={statusButtonClass('all')} onClick={() => onStatusChange('all')}>All</button>
            <button className={statusButtonClass('paid')} onClick={() => onStatusChange('paid')}>Paid</button>
            <button className={statusButtonClass('pending')} onClick={() => onStatusChange('pending')}>Pending</button>
            <button className={statusButtonClass('partial')} onClick={() => onStatusChange('partial')}>Partial</button>
          </div>
        </div>
      </div>
    </div>
  );
}
