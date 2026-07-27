

export default function Dashboard2() {
  return (
    <div>
        <main className=" min-h-screen pb-xl">
       
        
        {/* <!-- Content Canvas --> */}
        <div className="p-container-margin max-w-7xl mx-auto space-y-gutter">
            <div className="mb-xl text-center py-xl relative overflow-hidden rounded-xl bg-primary-container text-on-primary">
                        <div className="relative z-10">
                            <h2 className="text-headline-lg font-xl mb-xs">Report</h2>
                            <p className="text-lg opacity-80 max-w-2xl mx-auto">Generate and view your financial reports.</p>
                        </div>
                    </div>
            {/* <!-- Enhanced Header Stats --> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                <div className="bento-card">
                    <div className="flex justify-between items-start mb-xs">
                        <p className="text-label-caps font-label-caps text-on-surface-variant">TOTAL BALANCE</p>
                        <span className="text-secondary material-symbols-outlined text-sm">account_balance</span>
                    </div>
                    <h2 className="text-headline-lg font-bold text-primary font-data-mono mb-2">$124,560.82</h2>
                    <div className="flex items-center gap-1 text-secondary text-body-sm">
                        <span className="material-symbols-outlined text-[16px]">trending_up</span> +2.4% <span className="text-on-surface-variant ml-1 font-normal">vs last month</span>
                    </div>
                </div>
                <div className="bento-card">
                    <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">AVG DAILY SPEND</p>
                    <h2 className="text-headline-lg font-bold text-on-surface font-data-mono mb-2">$273.67</h2>
                    <div className="flex items-center gap-1 text-error text-body-sm">
                        <span className="material-symbols-outlined text-[16px]">trending_up</span> +5.2% <span className="text-on-surface-variant ml-1 font-normal">from avg</span>
                    </div>
                </div>
                <div className="bento-card">
                    <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">BUDGET UTILIZATION</p>
                    <div className="flex items-baseline gap-2 mb-2">
                        <h2 className="text-headline-lg font-bold text-on-surface font-data-mono">68%</h2>
                        <span className="text-body-sm text-on-surface-variant">($8,210 / $12,000)</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[68%]"></div>
                    </div>
                </div>
                <div className="bento-card">
                    <p className="text-label-caps font-label-caps text-on-surface-variant mb-xs">EXPENSE VELOCITY</p>
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-headline-lg font-bold text-secondary font-data-mono">Steady</h2>
                        <span className="material-symbols-outlined text-secondary">bolt</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">Consuming 3.2% budget / day</p>
                </div>
            </div>
            {/* <!-- Weekly Spend & Comparison Row --> */}
            <div className="grid grid-cols-12 gap-gutter">
                {/* <!-- Weekly Spend Chart - Spans 8 --> */}
                <div className="col-span-12 lg:col-span-8 bento-card">
                    <div className="flex justify-between items-center mb-lg">
                        <div>
                            <p className="text-label-caps font-label-caps text-on-surface-variant">WEEKLY EXPENDITURE</p>
                            <h3 className="text-headline-md">Trend Over Past 7 Days</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-body-sm text-on-surface-variant mr-4">
                                <span className="w-3 h-3 bg-primary rounded-full"></span> This Week
                            </div>
                            <div className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                                <span className="w-3 h-3 bg-outline-variant rounded-full"></span> Last Week
                            </div>
                        </div>
                    </div>
                    {/* <!-- Mock Bar/Area Chart --> */}
                    <div className="h-64 w-full flex items-end justify-between gap-4 px-4 border-b border-outline-variant/30">
                        {/* <!-- Day 1 --> */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                                <div className="w-full bg-outline-variant/20 h-[60%] rounded-t-sm absolute bottom-0"></div>
                                <div className="w-full bg-primary h-[45%] rounded-t-sm relative z-10 hover:opacity-80 cursor-pointer"></div>
                            </div>
                            <span className="text-label-caps text-on-surface-variant">MON</span>
                        </div>
                        {/* <!-- Day 2 --> */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                                <div className="w-full bg-outline-variant/20 h-[40%] rounded-t-sm absolute bottom-0"></div>
                                <div className="w-full bg-primary h-[85%] rounded-t-sm relative z-10 hover:opacity-80 cursor-pointer"></div>
                            </div>
                            <span className="text-label-caps text-on-surface-variant">TUE</span>
                        </div>
                        {/* <!-- Day 3 --> */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                                <div className="w-full bg-outline-variant/20 h-[70%] rounded-t-sm absolute bottom-0"></div>
                                <div className="w-full bg-primary h-[50%] rounded-t-sm relative z-10 hover:opacity-80 cursor-pointer"></div>
                            </div>
                            <span className="text-label-caps text-on-surface-variant">WED</span>
                        </div>
                        {/* <!-- Day 4 --> */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                                <div className="w-full bg-outline-variant/20 h-[50%] rounded-t-sm absolute bottom-0"></div>
                                <div className="w-full bg-primary h-[90%] rounded-t-sm relative z-10 hover:opacity-80 cursor-pointer">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-on-primary text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">$1,240</div>
                                </div>
                            </div>
                            <span className="text-label-caps text-on-surface-variant font-bold">THU</span>
                        </div>
                        {/* <!-- Day 5 --> */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                                <div className="w-full bg-outline-variant/20 h-[30%] rounded-t-sm absolute bottom-0"></div>
                                <div className="w-full bg-primary h-[35%] rounded-t-sm relative z-10 hover:opacity-80 cursor-pointer"></div>
                            </div>
                            <span className="text-label-caps text-on-surface-variant">FRI</span>
                        </div>
                        {/* <!-- Day 6 --> */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                                <div className="w-full bg-outline-variant/20 h-[20%] rounded-t-sm absolute bottom-0"></div>
                                <div className="w-full bg-primary h-[25%] rounded-t-sm relative z-10 hover:opacity-80 cursor-pointer"></div>
                            </div>
                            <span className="text-label-caps text-on-surface-variant">SAT</span>
                        </div>
                        {/* <!-- Day 7 --> */}
                        <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                                <div className="w-full bg-outline-variant/20 h-[10%] rounded-t-sm absolute bottom-0"></div>
                                <div className="w-full bg-primary h-[15%] rounded-t-sm relative z-10 hover:opacity-80 cursor-pointer"></div>
                            </div>
                            <span className="text-label-caps text-on-surface-variant">SUN</span>
                        </div>
                    </div>
                </div>
                {/* <!-- Periodic Comparison - Spans 4 --> */}
                <div className="col-span-12 lg:col-span-4 bento-card flex flex-col">
                    <p className="text-label-caps font-label-caps text-on-surface-variant mb-lg">PERIODIC COMPARISON</p>
                    <div className="space-y-lg flex-1">
                        <div className="p-md bg-surface-container-low rounded-xl">
                            <div className="flex justify-between items-center mb-sm">
                                <p className="text-body-sm font-medium">Monthly Contrast</p>
                                <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] rounded font-bold">UP 12.5%</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-headline-md font-data-mono">$12,450</p>
                                    <p className="text-[10px] text-on-surface-variant">Current Month</p>
                                </div>
                                <div className="h-10 w-24">
                                    <svg className="w-full h-full" viewBox="0 0 100 40">
                                        <path d="M0 35 L20 30 L40 32 L60 20 L80 15 L100 5" fill="none" stroke="#006c49" stroke-width="2" vector-effect="non-scaling-stroke"></path>
                                    </svg>
                                </div>
                                <div className="text-right">
                                    <p className="text-body-sm font-data-mono text-on-surface-variant">$11,066</p>
                                    <p className="text-[10px] text-on-surface-variant">Previous</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-md bg-surface-container-low rounded-xl">
                            <div className="flex justify-between items-center mb-sm">
                                <p className="text-body-sm font-medium">Yearly Performance</p>
                                <span className="px-2 py-0.5 bg-error/10 text-error text-[10px] rounded font-bold">DOWN 3.1%</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-headline-md font-data-mono">$142.3k</p>
                                    <p className="text-[10px] text-on-surface-variant">YTD 2024</p>
                                </div>
                                <div className="h-10 w-24">
                                    <svg className="w-full h-full" viewBox="0 0 100 40">
                                        <path d="M0 5 L20 15 L40 10 L60 25 L80 20 L100 35" fill="none" stroke="#ba1a1a" stroke-width="2" vector-effect="non-scaling-stroke"></path>
                                    </svg>
                                </div>
                                <div className="text-right">
                                    <p className="text-body-sm font-data-mono text-on-surface-variant">$146.8k</p>
                                    <p className="text-[10px] text-on-surface-variant">YTD 2023</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-lg pt-md border-t border-outline-variant">
                        <p className="text-[10px] text-on-surface-variant italic">Data updated as of 12:45 PM GMT</p>
                    </div>
                </div>
            </div>
            {/* <!-- Main Insights Row --> */}
            <div className="grid grid-cols-12 gap-gutter">
                {/* <!-- Expense Breakdown & Top Volume - Spans 8 --> */}
                <div className="col-span-12 lg:col-span-8 bento-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                        {/* <!-- Value Breakdown --> */}
                        <div>
                            <div className="flex justify-between items-center mb-lg">
                                <p className="text-label-caps font-label-caps text-on-surface-variant">BY VALUE ($)</p>
                                <span className="material-symbols-outlined text-sm text-on-surface-variant">info</span>
                            </div>
                            <div className="space-y-md">
                                <div>
                                    <div className="flex justify-between text-body-sm mb-xs">
                                        <span className="font-medium">Rent &amp; Utilities</span>
                                        <span className="font-data-mono">$3,200.00</span>
                                    </div>
                                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[45%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-body-sm mb-xs">
                                        <span className="font-medium">Marketing</span>
                                        <span className="font-data-mono">$1,850.00</span>
                                    </div>
                                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[30%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-body-sm mb-xs">
                                        <span className="font-medium">Hardware &amp; Tech</span>
                                        <span className="font-data-mono">$1,200.00</span>
                                    </div>
                                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[20%]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-xl p-md bg-primary-container rounded-lg">
                                <p className="text-label-caps text-on-primary-container mb-1">PREDICTED EOM SPEND</p>
                                <p className="text-headline-md font-bold text-on-primary font-data-mono">$10,450.00</p>
                                <p className="text-body-sm text-on-primary-container">Based on 21 days remaining</p>
                            </div>
                        </div>
                        {/* <!-- Volume Breakdown --> */}
                        <div>
                            <div className="flex justify-between items-center mb-lg">
                                <p className="text-label-caps font-label-caps text-on-surface-variant">BY VOLUME (COUNT)</p>
                                <span className="material-symbols-outlined text-sm text-on-surface-variant">receipt</span>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-md">
                                    <span className="text-body-sm w-20 text-on-surface-variant">Food</span>
                                    <div className="flex-1 bg-surface-container-high h-6 rounded flex items-center px-2">
                                        <div className="bg-secondary h-4 rounded-sm w-[80%]"></div>
                                        <span className="ml-2 text-[10px] font-bold">42</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-md">
                                    <span className="text-body-sm w-20 text-on-surface-variant">Transport</span>
                                    <div className="flex-1 bg-surface-container-high h-6 rounded flex items-center px-2">
                                        <div className="bg-secondary h-4 rounded-sm w-[65%]"></div>
                                        <span className="ml-2 text-[10px] font-bold">34</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-md">
                                    <span className="text-body-sm w-20 text-on-surface-variant">Shopping</span>
                                    <div className="flex-1 bg-surface-container-high h-6 rounded flex items-center px-2">
                                        <div className="bg-secondary h-4 rounded-sm w-[40%]"></div>
                                        <span className="ml-2 text-[10px] font-bold">21</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-md">
                                    <span className="text-body-sm w-20 text-on-surface-variant">Subscr.</span>
                                    <div className="flex-1 bg-surface-container-high h-6 rounded flex items-center px-2">
                                        <div className="bg-secondary h-4 rounded-sm w-[25%]"></div>
                                        <span className="ml-2 text-[10px] font-bold">12</span>
                                    </div>
                                </div>
                            </div>
                            <button className="mt-8 w-full border border-outline-variant py-2 rounded text-body-sm font-bold hover:bg-surface-container-low transition-colors">
                                Detailed Breakdown Report
                            </button>
                        </div>
                    </div>
                </div>
                {/* <!-- Recent Activities - Spans 4 --> */}
                <div className="col-span-12 lg:col-span-4 bento-card">
                    <div className="flex justify-between items-center mb-lg">
                        <p className="text-label-caps font-label-caps text-on-surface-variant">RECENT ACTIVITIES</p>
                        <button className="text-on-surface-variant hover:text-primary">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                    </div>
                    <div className="space-y-sm max-h-[360px] overflow-y-auto custom-scrollbar pr-xs">
                        <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors border-b border-outline-variant/30 last:border-0">
                            <div className="flex items-center gap-md">
                                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-[18px]">shopping_cart</span>
                                </div>
                                <div>
                                    <p className="font-bold text-on-surface text-body-sm">AWS Billing</p>
                                    <p className="text-on-surface-variant text-[11px]">Today, 10:45 AM</p>
                                </div>
                            </div>
                            <span className="font-data-mono text-error font-bold text-sm">-$420</span>
                        </div>
                        <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors border-b border-outline-variant/30 last:border-0">
                            <div className="flex items-center gap-md">
                                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                                    <span className="material-symbols-outlined text-on-secondary-container text-[18px]">payments</span>
                                </div>
                                <div>
                                    <p className="font-bold text-on-surface text-body-sm">Client: Acme</p>
                                    <p className="text-on-surface-variant text-[11px]">Yesterday</p>
                                </div>
                            </div>
                            <span className="font-data-mono text-secondary font-bold text-sm">+$3,500</span>
                        </div>
                        <div className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors border-b border-outline-variant/30 last:border-0">
                            <div className="flex items-center gap-md">
                                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-[18px]">restaurant</span>
                                </div>
                                <div>
                                    <p className="font-bold text-on-surface text-body-sm">Le Bistro</p>
                                    <p className="text-on-surface-variant text-[11px]">Aug 23</p>
                                </div>
                            </div>
                            <span className="font-data-mono text-error font-bold text-sm">-$124</span>
                        </div>
                    </div>
                    <div className="mt-lg pt-lg border-t border-outline-variant text-center">
                        <a className="text-primary font-bold text-body-sm hover:underline" href="#">View All Transactions</a>
                    </div>
                </div>
            </div>
        </div>
    </main>
    </div>
  )
}
