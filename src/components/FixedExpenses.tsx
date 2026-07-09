import { useState } from 'react';

interface PaymentRecord {
    month: string;
    paid: boolean;
    paidDate?: string;
}

interface MonthlyTemplate {
    id: string;
    name: string;
    icon: string;
    amount: number;
    dueDay: number;
    history: PaymentRecord[];
}

const INITIAL_TEMPLATES: MonthlyTemplate[] = [
    {
        id: 'rent',
        name: 'Rent',
        icon: 'home_work',
        amount: 1850,
        dueDay: 1,
        history: [
            { month: 'Jan 2024', paid: true, paidDate: 'Jan 02' },
            { month: 'Feb 2024', paid: true, paidDate: 'Feb 01' },
            { month: 'Mar 2024', paid: false },
        ],
    },
    {
        id: 'internet',
        name: 'Internet Fiber',
        icon: 'wifi',
        amount: 89.99,
        dueDay: 15,
        history: [
            { month: 'Jan 2024', paid: true, paidDate: 'Jan 14' },
            { month: 'Feb 2024', paid: true, paidDate: 'Feb 13' },
            { month: 'Mar 2024', paid: true, paidDate: 'Mar 15' },
        ],
    },
    {
        id: 'salaries',
        name: 'Salaries',
        icon: 'group',
        amount: 4200,
        dueDay: 30,
        history: [
            { month: 'Jan 2024', paid: true, paidDate: 'Jan 29' },
            { month: 'Feb 2024', paid: true, paidDate: 'Feb 28' },
            { month: 'Mar 2024', paid: false },
        ],
    },
];

export default function FixedExpenses() {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
    const [flippedId, setFlippedId] = useState<string | null>(null);

    function getCurrentMonth(template: MonthlyTemplate): PaymentRecord | undefined {
        return template.history[template.history.length - 1];
    }

    function getPendingCount(): number {
        return templates.filter((t) => {
            const current = getCurrentMonth(t);
            return current && !current.paid;
        }).length;
    }

    function markAsPaid(templateId: string, e: React.MouseEvent) {
        e.stopPropagation();
        setTemplates((prev) =>
            prev.map((t) => {
                if (t.id !== templateId) return t;
                const history = [...t.history];
                const last = history[history.length - 1];
                if (last && !last.paid) {
                    history[history.length - 1] = {
                        ...last,
                        paid: true,
                        paidDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                    };
                }
                return { ...t, history };
            })
        );
    }

    function toggleFlip(id: string) {
        setFlippedId((prev) => (prev === id ? null : id));
    }

    return (
        <div className="p-lg space-y-lg">
            <main className="p-lg space-y-xl">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-headline-lg font-headline-lg text-primary">Fixed Expenses</h2>
                        <p className="text-body-md font-body-md text-on-surface-variant">Manage your monthly recurring costs and payment templates.</p>
                    </div>
                    <div className="flex items-center space-x-md">
                        <div className="flex bg-surface-container-highest rounded-lg overflow-hidden">
                            <button
                                className={`flex items-center space-x-xs px-md py-sm font-bold transition-colors ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-high'}`}
                                type="button"
                                onClick={() => setViewMode('grid')}
                            >
                                <span className="material-symbols-outlined">grid_view</span>
                            </button>
                            <button
                                className={`flex items-center space-x-xs px-md py-sm font-bold transition-colors ${viewMode === 'table' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-high'}`}
                                type="button"
                                onClick={() => setViewMode('table')}
                            >
                                <span className="material-symbols-outlined">table_rows</span>
                            </button>
                        </div>
                        <button className="flex items-center space-x-xs px-md py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity">
                            <span className="material-symbols-outlined">add</span>
                            <span>New Template</span>
                        </button>
                    </div>
                </div>

                {/* Section 1: Monthly Templates */}
                <section>
                    <div className="flex items-center justify-between mb-md">
                        <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest">Monthly Templates</h3>
                        <span className="text-body-sm font-body-sm text-on-surface-variant">{getPendingCount()} pending this month</span>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-6 gap-gutter">
                            {templates.map((template) => {
                                const current = getCurrentMonth(template);
                                const isPaid = current?.paid;
                                const isFlipped = flippedId === template.id;

                                return (
                                    <div
                                        key={template.id}
                                        className="cursor-pointer"
                                        style={{ perspective: '1000px' }}
                                        onClick={() => toggleFlip(template.id)}
                                    >
                                        <div
                                            className="grid [&>*]:col-start-1 [&>*]:row-start-1 transition-transform duration-500"
                                            style={{
                                                transformStyle: 'preserve-3d',
                                                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                            }}
                                        >
                                            <div
                                                className="bento-card flex flex-col justify-between rounded-xl min-h-[260px]"
                                                style={{ backfaceVisibility: 'hidden' }}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-md">
                                                        <div className={`p-xs rounded-lg ${isPaid ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
                                                            <span className={`material-symbols-outlined ${isPaid ? 'text-primary' : 'text-on-surface-variant'}`}>{template.icon}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-xs">
                                                            <span className="material-symbols-outlined text-xs text-on-surface-variant">autorenew</span>
                                                            {isPaid ? (
                                                                <span className="status-gain px-2 py-0.5 rounded-full text-label-caps">Paid</span>
                                                            ) : (
                                                                <span className="status-loss px-2 py-0.5 rounded-full text-label-caps">Pending</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <h4 className="text-headline-md font-headline-md mb-xs">{template.name}</h4>
                                                    <p className="text-data-mono font-data-mono text-headline-md text-primary">${template.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                                <div className="space-y-sm">
                                                    <p className="text-body-xs text-on-surface-variant">Due {template.dueDay}{template.dueDay === 1 ? 'st' : template.dueDay === 2 ? 'nd' : template.dueDay === 3 ? 'rd' : 'th'} every month</p>
                                                    {!isPaid && (
                                                        <button
                                                            className="w-full py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity"
                                                            type="button"
                                                            onClick={(e) => markAsPaid(template.id, e)}
                                                        >
                                                            Mark as Paid
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                className="bento-card flex flex-col rounded-xl min-h-[260px] overflow-hidden"
                                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                            >
                                                <div className="flex items-center justify-between mb-md">
                                                    <h4 className="text-headline-sm font-headline-sm">{template.name}</h4>
                                                    <span className="material-symbols-outlined text-on-surface-variant text-sm">history</span>
                                                </div>
                                                <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-sm">Payment History</p>
                                                <div className="flex-1 space-y-xs overflow-y-auto">
                                                    {[...template.history].reverse().map((record, i) => (
                                                        <div
                                                            key={i}
                                                            className={`flex items-center justify-between px-sm py-xs rounded-lg text-body-sm ${record.paid ? 'bg-primary/10' : 'bg-surface-container-high'}`}
                                                        >
                                                            <div className="flex items-center space-x-xs">
                                                                <span className={`material-symbols-outlined text-sm ${record.paid ? 'text-primary' : 'text-on-surface-variant'}`}>
                                                                    {record.paid ? 'check_circle' : 'pending'}
                                                                </span>
                                                                <span className="text-on-surface">{record.month}</span>
                                                            </div>
                                                            {record.paidDate && <span className="text-body-xs text-on-surface-variant">{record.paidDate}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-body-xs text-on-surface-variant text-center mt-sm">Tap to flip back</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-left">
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Name</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Amount</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Due</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Status</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">History</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {templates.map((template) => {
                                        const current = getCurrentMonth(template);
                                        const isPaid = current?.paid;
                                        const paidCount = template.history.filter((h) => h.paid).length;

                                        return (
                                            <tr key={template.id} className="hover:bg-surface-container-lowest transition-colors">
                                                <td className="px-lg py-md">
                                                    <div className="flex items-center space-x-sm">
                                                        <span className="material-symbols-outlined text-primary">{template.icon}</span>
                                                        <span className="font-body-md">{template.name}</span>
                                                        <span className="material-symbols-outlined text-sm text-on-surface-variant">autorenew</span>
                                                    </div>
                                                </td>
                                                <td className="px-lg py-md font-data-mono text-data-mono">${template.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                <td className="px-lg py-md text-on-surface-variant">{template.dueDay}{template.dueDay === 1 ? 'st' : template.dueDay === 2 ? 'nd' : template.dueDay === 3 ? 'rd' : 'th'}</td>
                                                <td className="px-lg py-md">
                                                    {isPaid ? (
                                                        <span className="status-gain px-xs py-0.5 rounded-md text-body-sm">Paid</span>
                                                    ) : (
                                                        <span className="status-loss px-xs py-0.5 rounded-md text-body-sm">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-lg py-md text-on-surface-variant">{paidCount}/{template.history.length}</td>
                                                <td className="px-lg py-md">
                                                    {!isPaid && (
                                                        <button
                                                            className="px-sm py-xs bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity text-body-sm"
                                                            type="button"
                                                            onClick={() => markAsPaid(template.id, {} as React.MouseEvent)}
                                                        >
                                                            Pay
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Section 2: Fixed Expenses List */}
                <section>
                    <div className="flex items-center justify-between mb-md">
                        <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest">Fixed Expenses List</h3>
                    </div>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-6 gap-gutter">
                            <div className="bento-card flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-md">
                                        <div className="p-xs bg-surface-container-high rounded-lg">
                                            <span className="material-symbols-outlined text-primary">inventory_2</span>
                                        </div>
                                        <span className="text-label-caps font-label-caps status-gain px-2 py-0.5 rounded-full">Recurring</span>
                                    </div>
                                    <h4 className="text-headline-md font-headline-md mb-xs">Office Supplies</h4>
                                    <p className="text-data-mono font-data-mono text-headline-md mb-lg text-primary">$120.00</p>
                                </div>
                                <p className="text-body-sm text-on-surface-variant mb-sm">Due: 5th Monthly</p>
                                <button className="w-full py-2 bg-surface-container-highest text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-colors" type="button">Details</button>
                            </div>
                            <div className="bento-card flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-md">
                                        <div className="p-xs bg-surface-container-high rounded-lg">
                                            <span className="material-symbols-outlined text-primary">cloud</span>
                                        </div>
                                        <span className="text-label-caps font-label-caps status-gain px-2 py-0.5 rounded-full">Recurring</span>
                                    </div>
                                    <h4 className="text-headline-md font-headline-md mb-xs">Cloud Hosting</h4>
                                    <p className="text-data-mono font-data-mono text-headline-md mb-lg text-primary">$450.00</p>
                                </div>
                                <p className="text-body-sm text-on-surface-variant mb-sm">Due: 15th Monthly</p>
                                <button className="w-full py-2 bg-surface-container-highest text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-colors" type="button">Details</button>
                            </div>
                            <div className="bento-card flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-md">
                                        <div className="p-xs bg-surface-container-high rounded-lg">
                                            <span className="material-symbols-outlined text-primary">gavel</span>
                                        </div>
                                        <span className="text-label-caps font-label-caps status-loss px-2 py-0.5 rounded-full">Overdue</span>
                                    </div>
                                    <h4 className="text-headline-md font-headline-md mb-xs">Legal Retainer</h4>
                                    <p className="text-data-mono font-data-mono text-headline-md mb-lg text-primary">$1,000.00</p>
                                </div>
                                <p className="text-body-sm text-on-surface-variant mb-sm">Due: 1st Monthly</p>
                                <button className="w-full py-2 bg-surface-container-highest text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-colors" type="button">Details</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-left">
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Description</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Category</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Due Date</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Amount</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Status</th>
                                        <th className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    <tr className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="px-lg py-md font-body-md">Office Supplies Subscription</td>
                                        <td className="px-lg py-md text-on-surface-variant">Administrative</td>
                                        <td className="px-lg py-md text-on-surface-variant">5th Monthly</td>
                                        <td className="px-lg py-md font-data-mono text-data-mono">$120.00</td>
                                        <td className="px-lg py-md"><span className="status-gain px-xs py-0.5 rounded-md text-body-sm">Recurring</span></td>
                                        <td className="px-lg py-md"><button className="material-symbols-outlined text-outline hover:text-primary transition-colors" type="button">more_vert</button></td>
                                    </tr>
                                    <tr className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="px-lg py-md font-body-md">Cloud Hosting (AWS)</td>
                                        <td className="px-lg py-md text-on-surface-variant">Infrastructure</td>
                                        <td className="px-lg py-md text-on-surface-variant">15th Monthly</td>
                                        <td className="px-lg py-md font-data-mono text-data-mono">$450.00</td>
                                        <td className="px-lg py-md"><span className="status-gain px-xs py-0.5 rounded-md text-body-sm">Recurring</span></td>
                                        <td className="px-lg py-md"><button className="material-symbols-outlined text-outline hover:text-primary transition-colors" type="button">more_vert</button></td>
                                    </tr>
                                    <tr className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="px-lg py-md font-body-md">Legal Retainer</td>
                                        <td className="px-lg py-md text-on-surface-variant">Professional Services</td>
                                        <td className="px-lg py-md text-on-surface-variant">1st Monthly</td>
                                        <td className="px-lg py-md font-data-mono text-data-mono">$1,000.00</td>
                                        <td className="px-lg py-md"><span className="status-loss px-xs py-0.5 rounded-md text-body-sm">Overdue</span></td>
                                        <td className="px-lg py-md"><button className="material-symbols-outlined text-outline hover:text-primary transition-colors" type="button">more_vert</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
