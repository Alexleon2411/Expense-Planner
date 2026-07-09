import { useState } from "react";

type Status = 'paid' | 'pending' | 'partial' | 'income' | 'all' |null;

export default function Filter(){
  const [status, setStatus] = useState<Status>(null);

  const handleStatus = (status: Status) => setStatus(status);
  const statusButtonClass = (btnStatus: Status) => {
    return `px-md py-xs rounded-full border text-primary text-body-sm transition-all ${
      status === btnStatus
        ? 'bg-primary text-white border-primary'
        : 'border-outline-variant '
    }`;
  }
    return(
        <div>   
            {/* <!-- Bento Filter Bar --> */}  
          <div className="bento-card !p-md flex flex-wrap items-center gap-md">
            <div className="flex flex-col gap-xs min-w-[200px]">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Date Range</span>
              <div className="relative">
                <select className="w-full appearance-none bg-surface-container border border-outline-variant rounded-lg px-md py-xs text-body-sm pr-10 focus:ring-primary outline-none cursor-pointer">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>Current Month</option>
                  <option>Previous Quarter</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="expand_more">expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-xs min-w-[200px]">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Category</span>
              <div className="relative">
                <select className="w-full appearance-none bg-surface-container border border-outline-variant rounded-lg px-md py-xs text-body-sm pr-10 focus:ring-primary outline-none cursor-pointer">
                  <option>All Categories</option>
                  <option>Infrastructure</option>
                  <option>Marketing</option>
                  <option>Payroll</option>
                  <option>Software SaaS</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="category">category</span>
              </div>
            </div>
            <div className="flex flex-col gap-xs min-w-[200px]">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Payment Status</span>
              <div className="flex items-center gap-xs">
                <button className={statusButtonClass('all')} onClick={() => handleStatus('all')}>All</button>
                <button className={statusButtonClass('paid')} onClick={() => handleStatus('paid')}>Paid</button>
                <button className={statusButtonClass('pending')} onClick={() => handleStatus('pending')}>Pending</button>
                <button className={statusButtonClass('income')} onClick={() => handleStatus('income')}>Income</button>
                <button className={statusButtonClass('partial')} onClick={() => handleStatus('partial')}>Partial Paid</button>
              </div>
            </div>
            {/* <div className="ml-auto flex items-center gap-sm">
              <button className="p-xs text-outline hover:text-primary transition-colors border border-outline-variant rounded-lg">
                <span className="material-symbols-outlined" data-icon="filter_list">filter_list</span>
              </button>
              <button className="p-xs text-outline hover:text-primary transition-colors border border-outline-variant rounded-lg">
                <span className="material-symbols-outlined" data-icon="file_download">file_download</span>
              </button>
            </div> */}
          </div>
        </div>
    )
}