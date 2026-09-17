import { useState, useRef } from "react"
import { useBudget } from "../../hooks/useBudget"
import { useCategories } from "../../hooks/useCategories"
import { scanReceipt } from "../../services/receiptScanner"
import { useTranslation } from 'react-i18next'
import { parseInputDate, toDateOnly } from '../../helpers'

interface AddNewTrasactionProps {
    isOpen: boolean;
    onClose: () => void;
    initialCategory?: string;
    initialAmount?: number;
    onExpenseCreated?: () => void;
}

type Status = 'paid' | 'pending' | 'partial' | null;

export default function AddNewTrasaction({
    isOpen,
    onClose,
    initialCategory = '',
    initialAmount = 0,
    onExpenseCreated,
}: AddNewTrasactionProps) {
    const { addExpense } = useBudget()
    const { categories } = useCategories()
    const { t } = useTranslation()

    const [status, setStatus] = useState<Status>(null);
    const [category, setCategory] = useState(initialCategory);
    const [merchant, setMerchant] = useState('');
    const [amount, setAmount] = useState(initialAmount || 0);
    const [date, setDate] = useState(() => toDateOnly(new Date()));
    const [type, setType] = useState<'expense' | 'saving'>('expense');
    const [partialAmount, setPartialAmount] = useState(0);
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const resetForm = () => {
        setMerchant('');
        setCategory(initialCategory);
        setAmount(initialAmount || 0);
        setDate(toDateOnly(new Date()));
        setStatus(null);
        setPartialAmount(0);
        setComment('');
        setReceiptFile(null);
        setReceiptPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert(t('upload.fileTooLarge'));
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
            console.error(t('upload.scanError'), error);
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
        if (!merchant.trim() || !category || amount <= 0) return;
        setSaving(true);
        try {
            await addExpense({
                expenseName: merchant.trim(),
                amount,
                category,
                date: parseInputDate(date),
                status: status || 'pending',
                partialAmount: status === 'partial' ? partialAmount : undefined,
                comment: comment.trim() || undefined,
                type,
            });
            resetForm();
            onClose();
            onExpenseCreated?.();
        } catch (error) {
            console.error(t('expense.createError'), error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 drawer-overlay z-[100] transition-opacity duration-300 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div
                className="fixed inset-0 z-[101] flex items-center justify-center p-lg"
                role="dialog"
                aria-modal="true"
                onClick={onClose}
            >
                <div className="w-full max-w-md max-h-[90vh] bg-surface shadow-2xl rounded-xl flex flex-col" onClick={(e) => e.stopPropagation()}>

                    <div className="px-lg  py-md  text-primary flex justify-between items-center">
                        <h3 className="text-headline-md font-headline-md">{t('expense.addTransaction')}</h3>
                        <button className="p-xs hover:bg-surface-container rounded-full" onClick={onClose} aria-label={t('common.close')} title={t('common.close')}>
                            <span className="material-symbols-outlined" data-icon="close">close</span>
                        </button>
                    </div>

                    <div className="flex-1 space-y-lg overflow-y-auto hide-scrollbar p-sm">

<div className="flex items-center gap-md">
                            <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-[32px] text-primary" data-icon="receipt_long">receipt_long</span>
                            </div>
                            <div className="flex-1 space-y-xs">
                                <input
                                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                    placeholder={t('expense.merchant')}
                                    type="text"
                                    value={merchant}
                                    onChange={(e) => setMerchant(e.target.value)}
                                />
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">{t('expense.select')}</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-sm">
                            <button type="button"
                                className={`px-lg py-sm rounded-full border text-label-caps font-label-caps transition-all flex items-center justify-center gap-xs ${
                                    type === 'expense'
                                        ? 'bg-primary text-white border-primary'
                                        : 'border-outline-variant'
                                }`}
                                onClick={() => setType('expense')}
                            >
                                <span className="material-symbols-outlined" data-icon="shopping_bag">shopping_bag</span>
                                {t('expense.typeExpense')}
                            </button>
                            <button type="button"
                                className={`px-lg py-sm rounded-full border text-label-caps font-label-caps transition-all flex items-center justify-center gap-xs ${
                                    type === 'saving'
                                        ? 'bg-primary text-white border-primary'
                                        : 'border-outline-variant'
                                }`}
                                onClick={() => setType('saving')}
                            >
                                <span className="material-symbols-outlined" data-icon="savings">savings</span>
                                {t('expense.typeSaving')}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-md p-lg bg-surface-container-low rounded-xl">
                            <div>
                                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">{t('expense.amountLabel')}</label>
                                <div className="relative">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant font-data-mono p-2">$</span>
                                    <input
                                        className="w-full px-5 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                        placeholder={t('expense.amountPlaceholder')}
                                        step="0.01"
                                        type="number"
                                        value={amount || ''}
                                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">{t('expense.date')}</label>
                                <input
                                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 pt-md border-t-2 border-outline-variant">
                                <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs">{t('expense.status')}</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        className={statusButtonClasses('paid')}
                                        onClick={() => handleStatus('paid')}
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-sm">check_circle</span> {t('expense.paid')}
                                    </button>
                                    <button
                                        className={statusButtonClasses('pending')}
                                        onClick={() => handleStatus('pending')}
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-sm">schedule</span> {t('expense.pending')}
                                    </button>
                                    <button
                                        className={statusButtonClasses('partial')}
                                        onClick={() => handleStatus('partial')}
                                        type="button"
                                    >
                                        <span className="material-symbols-outlined text-sm">incomplete_circle</span> {t('expense.partial')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {status === 'partial' && (
                            <div className="space-y-md animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                                    <span className="text-body-md text-on-surface-variant">{t('expense.paidSoFar')}</span>
                                    <span className="text-body-md font-semibold font-data-mono">
                                        <input
                                            className="text-right bg-transparent outline-none w-24"
                                             placeholder={t('expense.amountPlaceholder')}
                                            step="0.01"
                                            type="number"
                                            value={partialAmount || ''}
                                            onChange={(e) => setPartialAmount(parseFloat(e.target.value) || 0)}
                                        />
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-sm border-b border-outline-variant">
                                    <span className="text-body-md text-on-surface-variant">{t('expense.remaining')}</span>
                                    <span className="text-body-md font-semibold font-data-mono text-error">
                                        ${Math.max(0, amount - partialAmount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-sm">
                            <p className="text-label-caps font-label-caps text-on-surface-variant uppercase">
                                {status === 'partial' ? t('expense.paymentComments') : t('upload.upload')}
                            </p>
                            {status === 'partial' ? (
                                <textarea
                                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary transition-all resize-none"
                                     placeholder={t('expense.partialCommentPlaceholder')}
                                    rows={3}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            ) : (
                                <div className="space-y-sm">
                                    {scanning ? (
                                        <div className="p-md border border-outline-variant rounded-lg flex items-center gap-md bg-surface-container-low">
                                            <span className="material-symbols-outlined text-primary animate-spin" data-icon="sync">sync</span>
                                            <div className="flex-1">
                                                 <p className="text-body-sm font-semibold">{t('upload.scanning')}</p>
                                                 <p className="text-body-sm text-outline">{t('upload.extracting')}</p>
                                            </div>
                                        </div>
                                    ) : receiptPreview ? (
                                        <div className="relative rounded-lg overflow-hidden border border-outline-variant">
                                             <img src={receiptPreview} alt={t('upload.preview')} className="w-full max-h-48 object-contain bg-surface-container-low" />
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
                                             <p className="text-body-sm font-semibold">{t('upload.upload')}</p>
                                             <p className="text-body-sm text-outline">{t('upload.formats')}</p>
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
                            )}
                        </div>
                    </div>

                    <div className="pt-lg border-t border-outline-variant flex gap-md p-2">
                        <button
                            className="flex-1 py-md border border-outline-variant rounded-lg font-bold hover:bg-surface-container transition-colors"
                            onClick={onClose}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            className="flex-1 py-md bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                            onClick={handleSave}
                            disabled={saving || !merchant.trim() || !category || amount <= 0}
                        >
                            {saving ? t('budget.saving') : t('expense.saveTransaction')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
