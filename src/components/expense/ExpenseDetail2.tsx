import { useState, useEffect, useRef } from 'react';
import { useBudget } from '../../hooks/useBudget';
import { useCategories } from '../../hooks/useCategories';
import { Expense } from '../../types';
import { scanReceipt } from '../../services/receiptScanner';
import CategoryIcon from '../CategoryIcon';

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
    expense: Expense | null;
}

type EditStatus = 'paid' | 'pending' | 'partial';

const statusClass = (status: string) => {
    if (status === 'paid') return 'status-paid';
    if (status === 'pending') return 'status-pending';
    return 'status-partial';
};

function toInputDate(date: Expense['date']): string {
    if (!date) return '';
    if (Array.isArray(date)) return '';
    const d = date instanceof Date ? date : new Date(date as string);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
}

function formatDisplayDate(date: Expense['date']): string {
    if (!date) return '';
    if (Array.isArray(date)) return '';
    const d = date instanceof Date ? date : new Date(date as string);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ExpenseDetail2({ isOpen, onClose, expense }: ExpenseDetail2Props) {
    const { editExpense, updateExpensePartialAmount } = useBudget();
    const { categories } = useCategories();
    const categoryById = Object.fromEntries(categories.map(c => [c.id, c]));

    const [editing, setEditing] = useState(false);
    const [merchant, setMerchant] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState('');
    const [status, setStatus] = useState<EditStatus>('paid');
    const [partialAmount, setPartialAmount] = useState('');
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (expense) {
            setMerchant(expense.expenseName);
            setCategory(expense.category);
            setAmount(expense.amount);
            setDate(toInputDate(expense.date));
            setStatus((expense.status || 'pending') as EditStatus);
            setPartialAmount(expense.partialAmount ? String(expense.partialAmount) : '');
            setComment(expense.comment || '');
            setReceiptFile(null);
            setReceiptPreview(null);
            setEditing(false);
        }
    }, [expense]);

    if (!isOpen || !expense) return null;

    const statusBtnClass = (s: EditStatus) =>
        `px-sm py-xs rounded-full border text-label-caps font-label-caps transition-all text-xs ${
            status === s
                ? 'bg-primary text-white border-primary'
                : 'border-outline-variant text-on-surface-variant hover:border-primary'
        }`;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be under 5MB');
            return;
        }
        setReceiptFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setReceiptPreview(null);
        }

        setScanning(true);
        try {
            const result = await scanReceipt(file);
            if (result.merchant) setMerchant(result.merchant);
            if (result.amount > 0) setAmount(result.amount);
            if (result.date) setDate(result.date);
            if (result.category) {
                const matched = categories.find(c => c.name.toLowerCase() === result.category.toLowerCase());
                setCategory(matched?.id || '');
            }
        } catch (error) {
            console.error('Error scanning receipt:', error);
        } finally {
            setScanning(false);
        }
    };

    const handleRemoveReceipt = () => {
        setReceiptFile(null);
        setReceiptPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated: Expense = {
                ...expense,
                expenseName: merchant.trim(),
                category,
                amount,
                date: new Date(date),
                status,
                partialAmount: status === 'partial' ? parseFloat(partialAmount) || 0 : undefined,
                comment: comment.trim() || undefined,
            };
            await editExpense(updated);
            if (status === 'partial') {
                await updateExpensePartialAmount(expense.id, parseFloat(partialAmount) || 0);
            }
            setEditing(false);
        } catch (error) {
            console.error('Error al guardar el gasto', error);
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmPayment = async () => {
        setSaving(true);
        try {
            const updated: Expense = { ...expense, status: 'paid', partialAmount: undefined };
            await editExpense(updated);
            setStatus('paid');
            setEditing(false);
        } catch (error) {
            console.error('Error al confirmar el pago', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div
                className={`fixed inset-0 drawer-overlay z-[100] transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            ></div>

            <div
                className={`fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-[101] transition-transform duration-300 ease-in-out p-lg flex flex-col ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between mb-xl">
                    <h3 className="text-headline-md font-headline-md">
                        {editing ? 'Edit Transaction' : 'Transaction Details'}
                    </h3>
                    <button className="p-xs hover:bg-surface-container rounded-full" onClick={onClose}>
                        <span className="material-symbols-outlined" data-icon="close">close</span>
                    </button>
                </div>

                <div className="flex-1 space-y-lg overflow-y-auto hide-scrollbar">
                    {/* Header */}
                    <div className="flex items-center gap-md">
                        <CategoryIcon
                            icon={categoryById[expense.category]?.icon}
                            color={categoryById[expense.category]?.color}
                            name={categoryById[expense.category]?.name || expense.category}
                            size="lg"
                        />
                        <div className="flex-1">
                            {editing ? (
                                <input
                                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all font-bold text-on-surface"
                                    value={merchant}
                                    onChange={(e) => setMerchant(e.target.value)}
                                />
                            ) : (
                                <h4 className="text-headline-sm font-bold text-on-surface">{expense.expenseName}</h4>
                            )}
                            {editing ? (
                                <select
                                    className="w-full mt-1 px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all text-body-sm"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-body-sm text-on-surface-variant">{categoryById[expense.category]?.name || expense.category}</p>
                            )}
                        </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="grid grid-cols-2 gap-md p-lg bg-surface-container-low rounded-xl">
                        <div>
                            <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">Amount</p>
                            {editing ? (
                                <div className="relative">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant font-data-mono p-2 text-sm">$</span>
                                    <input
                                        className="w-full px-5 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all text-headline-md font-data-mono"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={amount || ''}
                                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            ) : (
                                <p className="text-headline-md font-data-mono text-on-surface">${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">Status</p>
                            {editing ? (
                                <div className="flex flex-wrap gap-1">
                                    <button className={statusBtnClass('paid')} onClick={() => setStatus('paid')} type="button">Paid</button>
                                    <button className={statusBtnClass('pending')} onClick={() => setStatus('pending')} type="button">Pending</button>
                                    <button className={statusBtnClass('partial')} onClick={() => setStatus('partial')} type="button">Partial</button>
                                </div>
                            ) : (
                                <span className={`px-sm py-xs rounded-full text-label-caps font-label-caps uppercase ${statusClass(expense.status || 'pending')}`}>
                                    {expense.status || 'pending'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Partial Amount (only when editing and status is partial) */}
                    {editing && status === 'partial' && (
                        <div className="space-y-md animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                                <span className="text-body-md text-on-surface-variant">Amount Paid So Far</span>
                                <span className="text-body-md font-semibold font-data-mono">
                                    <input
                                        className="text-right bg-transparent outline-none w-24 border-b border-outline-variant focus:border-primary"
                                        placeholder="0.00"
                                        step="0.01"
                                        type="number"
                                        min="0"
                                        max={amount}
                                        value={partialAmount}
                                        onChange={(e) => setPartialAmount(e.target.value)}
                                    />
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                                <span className="text-body-md text-on-surface-variant">Remaining Balance</span>
                                <span className="text-body-md font-semibold font-data-mono text-error">
                                    ${Math.max(0, amount - (parseFloat(partialAmount) || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Detail rows */}
                    <div className="space-y-md">
                        <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                            <span className="text-body-md text-on-surface-variant">Date of Payment</span>
                            {editing ? (
                                <input
                                    className="text-right bg-transparent outline-none border-b border-outline-variant focus:border-primary text-body-md font-semibold"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            ) : (
                                <span className="text-body-md font-semibold">{formatDisplayDate(expense.date)}</span>
                            )}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-sm">
                        <p className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                            {editing ? 'Comment' : 'Payment Comment'}
                        </p>
                        {editing ? (
                            <textarea
                                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary transition-all resize-none"
                                placeholder="Add a comment..."
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                        ) : expense.comment ? (
                            <p className="text-body-sm text-on-surface-variant bg-surface-container-low p-md rounded-lg">{expense.comment}</p>
                        ) : (
                            <p className="text-body-sm text-outline italic">No comments</p>
                        )}
                    </div>

                    {/* Receipt */}
                    <div className="space-y-sm">
                        <p className="text-label-caps font-label-caps text-on-surface-variant uppercase">Receipt</p>
                        {editing ? (
                            <div className="space-y-sm">
                                {scanning ? (
                                    <div className="p-md border border-outline-variant rounded-lg flex items-center gap-md bg-surface-container-low">
                                        <span className="material-symbols-outlined text-primary animate-spin" data-icon="sync">sync</span>
                                        <div className="flex-1">
                                            <p className="text-body-sm font-semibold">Scanning receipt...</p>
                                            <p className="text-body-sm text-outline">Extracting merchant, amount and date</p>
                                        </div>
                                    </div>
                                ) : receiptPreview ? (
                                    <div className="relative rounded-lg overflow-hidden border border-outline-variant">
                                        <img src={receiptPreview} alt="Receipt preview" className="w-full max-h-48 object-contain bg-surface-container-low" />
                                        <button
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                            onClick={handleRemoveReceipt}
                                            type="button"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                ) : receiptFile ? (
                                    <div className="flex items-center gap-md p-md border border-outline-variant rounded-lg bg-surface-container-low">
                                        <span className="material-symbols-outlined text-primary" data-icon="description">description</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-body-sm font-semibold truncate">{receiptFile.name}</p>
                                            <p className="text-body-sm text-outline">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button className="text-red-600 hover:text-red-700" onClick={handleRemoveReceipt} type="button">
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="p-md border border-dashed border-outline-variant rounded-lg flex items-center gap-md hover:border-primary transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <span className="material-symbols-outlined text-outline" data-icon="upload">upload</span>
                                        <div className="flex-1">
                                            <p className="text-body-sm font-semibold">Upload receipt or invoice</p>
                                            <p className="text-body-sm text-outline">PDF, PNG or JPG up to 5MB</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        ) : (
                            <div className="p-md border border-dashed border-outline-variant rounded-lg flex items-center gap-md hover:border-primary transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-outline" data-icon="description">description</span>
                                <div className="flex-1">
                                    <p className="text-body-sm font-semibold">receipt_invoice_v2.pdf</p>
                                    <p className="text-body-sm text-outline">1.2 MB</p>
                                </div>
                                <span className="material-symbols-outlined text-outline" data-icon="download">download</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer actions */}
                <div className="pt-lg border-t border-outline-variant flex gap-md">
                    {editing ? (
                        <>
                            <button
                                className="flex-1 py-md border border-outline-variant rounded-lg font-bold hover:bg-surface-container transition-colors"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-md bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                                onClick={handleSave}
                                disabled={saving || !merchant.trim() || amount <= 0}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="flex-1 py-md border border-outline-variant rounded-lg font-bold hover:bg-surface-container transition-colors flex items-center justify-center gap-xs"
                                onClick={() => setEditing(true)}
                            >
                                <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                                Edit
                            </button>
                            <button
                                className="flex-1 py-md bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity"
                                onClick={handleConfirmPayment}
                                disabled={saving || expense.status === 'paid'}
                            >
                                {expense.status === 'paid' ? 'Paid' : 'Confirm Payment'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
