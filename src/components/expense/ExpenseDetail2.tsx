export interface TransactionDetail {
    merchant: string;
    amount: string;
    category: string;
    date: string;
    status: 'Paid' | 'Pending' | 'Partial' | 'Incomes' | string;
}

interface ExpenseDetail2Props {
    isOpen: boolean;
    onClose: () => void;
    transaction: TransactionDetail | null;
}

const iconMap: Record<string, string> = {
    'Infrastructure': 'cloud',
    'Marketing': 'work',
    'Software SaaS': 'draw',
    'Operations': 'shopping_cart',
    'Finance': 'payments',
};

const statusClass = (status: string) => {
    if (status === 'Paid') return 'status-paid';
    if (status === 'Pending') return 'status-pending';
    if (status === 'Incomes') return 'status-pending';
    return 'status-partial';
};

export default function ExpenseDetail2({ isOpen, onClose, transaction }: ExpenseDetail2Props) {

    const icon = transaction ? (iconMap[transaction.category] || 'receipt') : 'receipt';

    return (
        <div>
            {/* Overlay: visibility now driven by isOpen, not classList toggling */}
            <div
                className={`fixed inset-0 drawer-overlay z-[100] transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            ></div>

            {/* Drawer: slides in/out based on isOpen */}
            <div
                className={`fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-[101] transition-transform duration-300 ease-in-out p-lg flex flex-col ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between mb-xl">
                    <h3 className="text-headline-md font-headline-md">Transaction Details</h3>
                    <button className="p-xs hover:bg-surface-container rounded-full" onClick={onClose}>
                        <span className="material-symbols-outlined" data-icon="close">close</span>
                    </button>
                </div>

                {transaction && (
                    <div className="flex-1 space-y-lg overflow-y-auto hide-scrollbar">
                        <div className="flex items-center gap-md">
                            <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-[32px] text-primary" data-icon={icon}>{icon}</span>
                            </div>
                            <div>
                                <h4 className="text-headline-sm font-bold text-on-surface">{transaction.merchant}</h4>
                                <p className="text-body-sm text-on-surface-variant">{transaction.category}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-md p-lg bg-surface-container-low rounded-xl">
                            <div>
                                <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">Amount</p>
                                <p className="text-headline-md font-data-mono text-on-surface">-{transaction.amount}</p>
                            </div>
                            <div>
                                <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">Status</p>
                                <span className={`px-sm py-xs rounded-full text-label-caps font-label-caps uppercase ${statusClass(transaction.status)}`}>
                                    {transaction.status}
                                </span>
                            </div>
                            <div className="col-span-2 pt-md border-t border-outline-variant">
                                <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">Transaction ID</p>
                                <p className="text-data-mono text-body-sm">TXN-492-8812-AF01</p>
                            </div>
                        </div>
                        <div className="space-y-md">
                            <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                                <span className="text-body-md text-on-surface-variant">Date of Payment</span>
                                <span className="text-body-md font-semibold">{transaction.date}</span>
                            </div>
                            <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                                <span className="text-body-md text-on-surface-variant">Payment Method</span>
                                <span className="text-body-md font-semibold flex items-center gap-xs">
                                    <span className="material-symbols-outlined text-[18px]" data-icon="credit_card">credit_card</span>
                                    Visa •••• 4242
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                                <span className="text-body-md text-on-surface-variant">Reference</span>
                                <span className="text-body-md font-semibold">REF-INV-2023-09</span>
                            </div>
                        </div>
                        <div className="space-y-sm">
                            <p className="text-label-caps font-label-caps text-on-surface-variant uppercase">Attached Documents</p>
                            <div className="p-md border border-dashed border-outline-variant rounded-lg flex items-center gap-md hover:border-primary transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-outline" data-icon="description">description</span>
                                <div className="flex-1">
                                    <p className="text-body-sm font-semibold">receipt_invoice_v2.pdf</p>
                                    <p className="text-body-sm text-outline">1.2 MB • Added Oct 14</p>
                                </div>
                                <span className="material-symbols-outlined text-outline" data-icon="download">download</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-lg border-t border-outline-variant flex gap-md">
                    <button className="flex-1 py-md border border-outline-variant rounded-lg font-bold hover:bg-surface-container transition-colors">Edit Transaction</button>
                    <button className="flex-1 py-md bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity">Confirm Payment</button>
                </div>
            </div>
        </div>
    )
}