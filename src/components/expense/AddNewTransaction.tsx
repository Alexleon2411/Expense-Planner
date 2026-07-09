import { useState } from "react"

interface AddNewTrasactionProps {
    isOpen: boolean;
    onClose: () => void;
    initialCategory?: string;
    initialAmount?: number;
}

type Status = 'paid' | 'pending' | 'partial' | null;

export default function AddNewTrasaction({
    isOpen,
    onClose,
    initialCategory = '',
    initialAmount = 0,
}: AddNewTrasactionProps) {

    const [status, setStatus] = useState<Status>(null);
    const [category, setCategory] = useState(initialCategory);
    const [merchant, setMerchant] = useState('');

    if (!isOpen) return null;

    const handleStatus = (newStatus: Status) => {
        setStatus(newStatus);
    };

    const statusButtonClasses = (btnStatus: Status) =>
        `status-btn px-lg py-sm rounded-full border text-label-caps font-label-caps transition-all flex items-center gap-xs ${
            status === btnStatus
                ? 'bg-primary text-white border-primary'
                : 'border-outline-variant'
        }`;

    return (
        <>
            {/* Overlay, same family as drawerOverlay */}
            <div
                className="fixed inset-0 drawer-overlay z-[100] transition-opacity duration-300 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Panel, styled like detailDrawer but centered as a modal */}
            <div
                className="fixed inset-0 z-[101] flex items-center justify-center p-lg"
                role="dialog"
                aria-modal="true"
                onClick={onClose}
            >
                <div className="w-full max-w-md max-h-[90vh] bg-surface shadow-2xl rounded-xl flex flex-col"  onClick={(e) => e.stopPropagation()}>

                    {/* Header — mirrors ExpenseDetail2's header */}
                    <div className="px-lg  py-md  text-primary flex justify-between items-center">
                        <h3 className="text-headline-md font-headline-md">New Transaction</h3>
                        <button className="p-xs hover:bg-surface-container rounded-full" onClick={onClose}>
                            <span className="material-symbols-outlined" data-icon="close">close</span>
                        </button>
                    </div>

                    <div className="flex-1 space-y-lg overflow-y-auto hide-scrollbar p-sm">

                        {/* Identity block — mirrors merchant/category header in ExpenseDetail2 */}
                        <div className="flex items-center gap-md">
                            <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-[32px] text-primary" data-icon="receipt_long">receipt_long</span>
                            </div>
                            <div className="flex-1 space-y-xs">
                                <input
                                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                    placeholder="Merchant Name"
                                    type="text"
                                    value={merchant}
                                    onChange={(e) => setMerchant(e.target.value)}
                                />
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select a category</option>
                                    <option>Housing & Utilities</option>
                                    <option>Food & Dining</option>
                                    <option>Transportation</option>
                                    <option>Business Expenses</option>
                                    <option>Entertainment</option>
                                    <option>Healthcare</option>
                                </select>
                            </div>
                        </div>

                        {/* Amount & Date block — mirrors the Amount/Status grid in ExpenseDetail2 */}
                        <div className="grid grid-cols-2 gap-md p-lg bg-surface-container-low rounded-xl">
                            <div>
                                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant font-data-mono p-2">$</span>
                                    <input
                                        className="w-full px-5 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                        placeholder="0.00"
                                        step="0.01"
                                        type="number"
                                        defaultValue={initialAmount || undefined}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">Date</label>
                                <input
                                   className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                    type="date"
                                />
                            </div>
                            <div className="col-span-2 pt-md border-t-2 border-outline-variant">
                                <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">Payment Status</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        className={statusButtonClasses('paid')}
                                        onClick={() => handleStatus('paid')}
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-sm">check_circle</span> Paid
                                    </button>
                                    <button
                                        className={statusButtonClasses('pending')}
                                        onClick={() => handleStatus('pending')}
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-sm">schedule</span> Pending
                                    </button>
                                    <button
                                        className={statusButtonClasses('partial')}
                                        onClick={() => handleStatus('partial')}
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-sm">incomplete_circle</span> Partial
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Detail rows — mirrors the Date/Payment Method/Reference rows in ExpenseDetail2 */}
                        {status === 'partial' && (
                            <div className="space-y-md animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                                    <span className="text-body-md text-on-surface-variant">Amount Paid So Far</span>
                                    <span className="text-body-md font-semibold font-data-mono">
                                        <input
                                            className="text-right bg-transparent outline-none w-24"
                                            placeholder="0.00"
                                            step="0.01"
                                            type="number"
                                        />
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                                    <span className="text-body-md text-on-surface-variant">Remaining Balance</span>
                                    <span className="text-body-md font-semibold font-data-mono text-error">$0.00</span>
                                </div>
                            </div>
                        )}

                        {/* Attachment block — mirrors "Attached Documents" in ExpenseDetail2 */}
                        <div className="space-y-sm">
                            <p className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                                {status === 'partial' ? 'Payment Comments' : 'Attach Receipt'}
                            </p>
                            {status === 'partial' ? (
                                <textarea
                                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary transition-all resize-none"
                                    placeholder="Explain the payment schedule or reason for partial payment..."
                                    rows={3}
                                ></textarea>
                            ) : (
                                <div className="p-md border border-dashed border-outline-variant rounded-lg flex items-center gap-md hover:border-primary transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-outline" data-icon="upload">upload</span>
                                    <div className="flex-1">
                                        <p className="text-body-sm font-semibold">Upload receipt or invoice</p>
                                        <p className="text-body-sm text-outline">PDF, PNG or JPG up to 5MB</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer actions — mirrors "Edit Transaction" / "Confirm Payment" in ExpenseDetail2 */}
                    <div className="pt-lg border-t border-outline-variant flex gap-md p-2">
                        <button
                            className="flex-1 py-md border border-outline-variant rounded-lg font-bold hover:bg-surface-container transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button className="flex-1 py-md bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity">
                            Save Transaction
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}