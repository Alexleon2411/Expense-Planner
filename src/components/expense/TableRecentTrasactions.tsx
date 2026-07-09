import type { TransactionDetail } from './ExpenseDetail2';

interface TableRecentTransactionsProps {
    onRowClick: (transaction: TransactionDetail) => void;
}

interface Row extends TransactionDetail {
    icon: string;
    displayAmount: string;
    statusLabel: string;
    statusClassName: string;
}

const rows: Row[] = [
    {
        merchant: 'Amazon Web Services',
        amount: '$1,240.00',
        category: 'Infrastructure',
        date: 'Oct 14, 2023',
        status: 'Paid',
        icon: 'cloud',
        displayAmount: '-$1,240.00',
        statusLabel: 'Paid',
        statusClassName: 'status-paid',
    },
    {
        merchant: 'Upwork Global Inc',
        amount: '$850.00',
        category: 'Marketing',
        date: 'Oct 12, 2023',
        status: 'Pending',
        icon: 'work',
        displayAmount: '-$850.00',
        statusLabel: 'Income',
        statusClassName: 'status-pending',
    },
    {
        merchant: 'Figma Subscription',
        amount: '$45.00',
        category: 'Software SaaS',
        date: 'Oct 11, 2023',
        status: 'Paid',
        icon: 'draw',
        displayAmount: '-$45.00',
        statusLabel: 'Paid',
        statusClassName: 'status-paid',
    },
    {
        merchant: 'Office Depot',
        amount: '$210.45',
        category: 'Operations',
        date: 'Oct 10, 2023',
        status: 'Partial',
        icon: 'shopping_cart',
        displayAmount: '-$210.45',
        statusLabel: 'Partial',
        statusClassName: 'status-partial',
    },
    {
        merchant: 'Stripe Fees',
        amount: '$12.40',
        category: 'Finance',
        date: 'Oct 09, 2023',
        status: 'Paid',
        icon: 'payments',
        displayAmount: '-$12.40',
        statusLabel: 'Paid',
        statusClassName: 'status-paid',
    },
];

export default function TableRecentTransactions({ onRowClick }: TableRecentTransactionsProps) {

    return (
        <div className="bento-card !p-0 overflow-hidden">
            <div className="p-lg flex justify-between items-center">
                <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase">Recent Transactions</h3>
                <span className="text-body-sm font-body-sm text-outline">Showing 15 of 128 items</span>
            </div>
            <div className="overflow-x-auto">
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
                        {rows.map((row) => (
                            <tr
                                key={row.merchant + row.date}
                                className="hover:bg-surface-container-lowest cursor-pointer transition-colors group"
                                onClick={() => onRowClick({
                                    merchant: row.merchant,
                                    amount: row.amount,
                                    category: row.category,
                                    date: row.date,
                                    status: row.status,
                                })}
                            >
                                <td className="px-lg py-md text-body-sm font-body-sm text-on-surface">{row.date}</td>
                                <td className="px-lg py-md">
                                    <div className="flex items-center gap-sm">
                                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary" data-icon={row.icon}>{row.icon}</span>
                                        </div>
                                        <span className="text-body-md font-body-md text-on-surface font-semibold">{row.merchant}</span>
                                    </div>
                                </td>
                                <td className="px-lg py-md">
                                    <span className="px-sm py-xs bg-surface-container rounded-full text-body-sm text-on-surface-variant">{row.category}</span>
                                </td>
                                <td className="px-lg py-md text-right text-data-mono font-data-mono text-on-surface">{row.displayAmount}</td>
                                <td className="px-lg py-md text-center">
                                    <span className={`px-sm py-xs rounded-full text-label-caps font-label-caps uppercase ${row.statusClassName}`}>
                                        {row.statusLabel}
                                    </span>
                                </td>
                                <td className="px-lg py-md text-right">
                                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="chevron_right">chevron_right</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-lg border-t border-outline-variant flex justify-center">
                <button className="text-primary font-bold text-body-sm hover:underline flex items-center gap-xs">
                    Load More Transactions
                    <span className="material-symbols-outlined" data-icon="refresh">refresh</span>
                </button>
            </div>
        </div>
    )
}