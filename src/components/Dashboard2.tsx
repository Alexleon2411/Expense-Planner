
export default function Report() {
  return (
    <div>
            <main className="min-h-screen pb-xl">
                <div className=" mt-6 mx-6 p-lg space-y-lg text-center py-xl  overflow-hidden rounded-xl bg-primary-container text-on-primary">
                    <div className="relative z-10">
                        <h2 className="text-display-md font-display-md mb-xs tracking-tight">Dashboard</h2>
                        <p className="text-headline-sm font-headline-sm opacity-80 max-w-2xl mx-auto">Overview of your financial performance.</p>
                    </div>
                </div>
        {/* <!-- Filters Bar --> */}
        <section className="px-container-margin py-md flex flex-wrap gap-md items-center justify-between">
            <div className="flex gap-sm items-center">
                <div className="flex bg-surface-container rounded-lg p-xs">
                    <button className="px-md py-xs bg-surface-container-lowest shadow-sm rounded-md font-label-caps text-label-caps text-primary">Monthly</button>
                    <button className="px-md py-xs font-label-caps text-label-caps text-on-surface-variant">Quarterly</button>
                    <button className="px-md py-xs font-label-caps text-label-caps text-on-surface-variant">Yearly</button>
                </div>
                <div className="relative">
                    <select className="appearance-none pl-md pr-xl py-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-body-sm font-medium focus:ring-2 focus:ring-primary">
                        <option>Octubre 2023</option>
                        <option>Septiembre 2023</option>
                        <option>Agosto 2023</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-xs top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                </div>
            </div>
            <div className="flex gap-sm">
                <button className="flex items-center gap-xs px-md py-xs border border-outline-variant rounded-lg text-body-sm font-medium hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    Profile: All
                </button>
                <button className="flex items-center gap-xs px-md py-xs bg-on-surface text-on-secondary rounded-lg text-body-sm font-medium hover:opacity-90">
                    <span className="material-symbols-outlined text-[20px]">file_download</span>
                    Export PDF
                </button>
            </div>
        </section>
        {/* <!-- Bento Grid Layout --> */}
        <div className="px-container-margin grid grid-cols-12 gap-gutter">
            {/* <!-- Summary Stats --> */}
            <div className="col-span-12 md:col-span-4 bento-card flex flex-col justify-between">
                <div>
                    <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">TOTAL EXPENSES</p>
                    <h3 className="text-display-lg font-display-lg text-on-surface">$12,450.00</h3>
                </div>
                <div className="mt-md flex items-center gap-sm">
                    <div className="flex items-center gap-xs bg-secondary-container/20 text-on-secondary-container px-sm py-1 rounded-full">
                        <span className="material-symbols-outlined text-[16px]">trending_down</span>
                        <span className="font-data-mono text-data-mono">8.2%</span>
                    </div>
                    <span className="text-body-sm text-on-surface-variant">vs last month</span>
                </div>
            </div>
            <div className="col-span-12 md:col-span-4 bento-card">
                <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">HIGHEST CATEGORY</p>
                <div className="flex items-center gap-md mt-sm">
                    <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-primary-fixed">home</span>
                    </div>
                    <div>
                        <h4 className="text-headline-md font-headline-md">Housing</h4>
                        <p className="text-body-sm text-on-surface-variant">$4,200.00 (33.7%)</p>
                    </div>
                </div>
            </div>
            <div className="col-span-12 md:col-span-4 bento-card">
                <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">MONTHLY SAVINGS</p>
                <div className="flex items-center gap-md mt-sm">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-secondary-container" data-weight="fill">savings</span>
                    </div>
                    <div>
                        <h4 className="text-headline-md font-headline-md">$3,120.00</h4>
                        <p className="text-body-sm text-on-surface-variant">+12% more than target</p>
                    </div>
                </div>
            </div>
            {/* <!-- Distribution Chart (Doughnut) --> */}
            <div className="col-span-12 md:col-span-5 bento-card flex flex-col">
                <h3 className="text-label-caps font-label-caps text-on-surface-variant mb-lg">CATEGORY DISTRIBUTION</h3>
                <div className="flex-grow flex items-center justify-center py-lg relative">
                    {/* <!-- Fake Chart Visual --> */}
                    <div className="w-48 h-48 rounded-full border-[16px] border-primary border-r-secondary-container border-b-surface-container-highest flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-headline-md font-headline-md block">$12.4k</span>
                            <span className="text-label-caps font-label-caps text-outline">Total</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-sm mt-md">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-sm">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-body-sm">Housing</span>
                        </div>
                        <span className="font-data-mono text-data-mono">33.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-sm">
                            <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                            <span className="text-body-sm">Food &amp; Dining</span>
                        </div>
                        <span className="font-data-mono text-data-mono">24.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-sm">
                            <div className="w-3 h-3 rounded-full bg-surface-container-highest"></div>
                            <span className="text-body-sm">Transport</span>
                        </div>
                        <span className="font-data-mono text-data-mono">18.5%</span>
                    </div>
                </div>
            </div>
            {/* <!-- Month-over-Month Comparison --> */}
            <div className="col-span-12 md:col-span-7 bento-card">
                <div className="flex justify-between items-center mb-lg">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant">MONTH-OVER-MONTH ANALYSIS</h3>
                    <div className="flex gap-md">
                        <div className="flex items-center gap-xs">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="text-body-sm">Current</span>
                        </div>
                        <div className="flex items-center gap-xs">
                            <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                            <span className="text-body-sm">Previous</span>
                        </div>
                    </div>
                </div>
                {/* <!-- Fake Bar Chart --> */}
                <div className="h-auto flex items-end justify-between gap-md ">
                    <div className="flex-grow flex flex-col gap-xs items-center group">
                        <div className="w-full bg-outline-variant/30 rounded-t-sm h-32"></div>
                        <div className="w-full bg-primary rounded-t-sm h-48 transition-all group-hover:opacity-80"></div>
                        <span className="text-label-caps font-label-caps mt-xs">MAY</span>
                    </div>
                    <div className="flex-grow flex flex-col gap-xs items-center group">
                        <div className="w-full bg-outline-variant/30 rounded-t-sm h-40"></div>
                        <div className="w-full bg-primary rounded-t-sm h-36 transition-all group-hover:opacity-80"></div>
                        <span className="text-label-caps font-label-caps mt-xs">JUN</span>
                    </div>
                    <div className="flex-grow flex flex-col gap-xs items-center group">
                        <div className="w-full bg-outline-variant/30 rounded-t-sm h-36"></div>
                        <div className="w-full bg-primary rounded-t-sm h-52 transition-all group-hover:opacity-80"></div>
                        <span className="text-label-caps font-label-caps mt-xs">JUL</span>
                    </div>
                    <div className="flex-grow flex flex-col gap-xs items-center group">
                        <div className="w-full bg-outline-variant/30 rounded-t-sm h-44"></div>
                        <div className="w-full bg-primary rounded-t-sm h-40 transition-all group-hover:opacity-80"></div>
                        <span className="text-label-caps font-label-caps mt-xs">AUG</span>
                    </div>
                    <div className="flex-grow flex flex-col gap-xs items-center group">
                        <div className="w-full bg-outline-variant/30 rounded-t-sm h-48"></div>
                        <div className="w-full bg-primary rounded-t-sm h-32 transition-all group-hover:opacity-80"></div>
                        <span className="text-label-caps font-label-caps mt-xs">SEP</span>
                    </div>
                    <div className="flex-grow flex flex-col gap-xs items-center group">
                        <div className="w-full bg-outline-variant/30 rounded-t-sm h-40"></div>
                        <div className="w-full bg-primary rounded-t-sm h-56 transition-all group-hover:opacity-80"></div>
                        <span className="text-label-caps font-label-caps mt-xs">OCT</span>
                    </div>
                </div>
            </div>
            {/* <!-- Top Merchants List --> */}
            <div className="col-span-12 bento-card">
                <div className="flex justify-between items-center mb-lg">
                    <h3 className="text-label-caps font-label-caps text-on-surface-variant">TOP MERCHANTS BY SPENDING</h3>
                    <button className="text-primary text-body-sm font-bold hover:underline">View All Transactions</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left border-b border-outline-variant">
                                <th className="pb-md text-label-caps font-label-caps text-outline">MERCHANT</th>
                                <th className="pb-md text-label-caps font-label-caps text-outline">CATEGORY</th>
                                <th className="pb-md text-label-caps font-label-caps text-outline">TRANSACTIONS</th>
                                <th className="pb-md text-right text-label-caps font-label-caps text-outline">TOTAL AMOUNT</th>
                                <th className="pb-md text-right text-label-caps font-label-caps text-outline">TREND</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            <tr className="group hover:bg-surface-container-low transition-colors">
                                <td className="py-md flex items-center gap-md">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                    </div>
                                    <span className="font-bold text-body-md">Whole Foods Market</span>
                                </td>
                                <td className="py-md">
                                    <span className="px-sm py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-body-sm">Groceries</span>
                                </td>
                                <td className="py-md">12 entries</td>
                                <td className="py-md text-right font-data-mono text-data-mono">$1,842.20</td>
                                <td className="py-md text-right">
                                    <span className="text-on-tertiary-container flex items-center justify-end gap-xs text-body-sm">
                                        <span className="material-symbols-outlined text-[16px]">trending_up</span> 4.2%
                                    </span>
                                </td>
                            </tr>
                            <tr className="group hover:bg-surface-container-low transition-colors">
                                <td className="py-md flex items-center gap-md">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">bolt</span>
                                    </div>
                                    <span className="font-bold text-body-md">Southern Electric</span>
                                </td>
                                <td className="py-md">
                                    <span className="px-sm py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-body-sm">Utilities</span>
                                </td>
                                <td className="py-md">1 entry</td>
                                <td className="py-md text-right font-data-mono text-data-mono">$245.00</td>
                                <td className="py-md text-right">
                                    <span className="text-on-secondary-container flex items-center justify-end gap-xs text-body-sm">
                                        <span className="material-symbols-outlined text-[16px]">trending_down</span> 1.5%
                                    </span>
                                </td>
                            </tr>
                            <tr className="group hover:bg-surface-container-low transition-colors">
                                <td className="py-md flex items-center gap-md">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">directions_car</span>
                                    </div>
                                    <span className="font-bold text-body-md">Uber Technologies</span>
                                </td>
                                <td className="py-md">
                                    <span className="px-sm py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-body-sm">Transport</span>
                                </td>
                                <td className="py-md">24 entries</td>
                                <td className="py-md text-right font-data-mono text-data-mono">$682.45</td>
                                <td className="py-md text-right">
                                    <span className="text-on-tertiary-container flex items-center justify-end gap-xs text-body-sm">
                                        <span className="material-symbols-outlined text-[16px]">trending_up</span> 12.8%
                                    </span>
                                </td>
                            </tr>
                            <tr className="group hover:bg-surface-container-low transition-colors">
                                <td className="py-md flex items-center gap-md">
                                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">subscriptions</span>
                                    </div>
                                    <span className="font-bold text-body-md">Netflix Inc.</span>
                                </td>
                                <td className="py-md">
                                    <span className="px-sm py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-body-sm">Entertainment</span>
                                </td>
                                <td className="py-md">1 entry</td>
                                <td className="py-md text-right font-data-mono text-data-mono">$18.99</td>
                                <td className="py-md text-right">
                                    <span className="text-outline flex items-center justify-end gap-xs text-body-sm">
                                        <span className="material-symbols-outlined text-[16px]">horizontal_rule</span> 0%
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
    </div>
  )
}
