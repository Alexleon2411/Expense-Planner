import { useState, useRef, useEffect } from "react"
import { useBudget } from "../../hooks/useBudget"
import { useCategories } from "../../hooks/useCategories"
import { scanReceipt } from "../../services/receiptScanner"
import { useTranslation } from 'react-i18next'
import { parseInputDate, toDateOnly } from '../../helpers'
import { plansApi } from '../../api'
import type { SavingPlanResponse } from '../../api/plans'

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
    const [savingPlans, setSavingPlans] = useState<SavingPlanResponse[]>([]);
    const [selectedSavingPlanId, setSelectedSavingPlanId] = useState('');
    const [loadingSavingPlans, setLoadingSavingPlans] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen || type !== 'saving') return;
        if (!date) {
            setSavingPlans([]);
            setSelectedSavingPlanId('');
            setLoadingSavingPlans(false);
            return;
        }

        let cancelled = false;
        setLoadingSavingPlans(true);
        plansApi.getPlansForPeriod(date, date)
            .then((plans) => {
                if (cancelled) return;
                setSavingPlans(plans);
                setSelectedSavingPlanId((current) =>
                    plans.some((plan) => plan.id === current) ? current : plans[0]?.id ?? ''
                );
            })
            .catch((error) => {
                if (cancelled) return;
                console.error('Error loading saving plans for transaction date', error);
                setSavingPlans([]);
                setSelectedSavingPlanId('');
            })
            .finally(() => {
                if (!cancelled) setLoadingSavingPlans(false);
            });

        return () => { cancelled = true; };
    }, [isOpen, type, date]);

    if (!isOpen) return null;

    const handleStatus = (newStatus: Status) => {
        setStatus(newStatus);
    };

    const fieldClassName = 'w-full rounded-md border border-white/[0.08] bg-[#1B202B] px-3 py-2.5 text-sm leading-5 text-[#F9FAFB] placeholder:text-[#6B7280] outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 [color-scheme:dark]';
    const fieldLabelClassName = 'mb-2 block text-xs font-medium text-[#9CA3AF]';

    const statusButtonClasses = (btnStatus: Exclude<Status, null>) => {
        const selectedClassName = btnStatus === 'paid'
            ? 'border-emerald-400/20 bg-emerald-400/[0.12] text-[#34D399]'
            : btnStatus === 'pending'
                ? 'border-amber-400/20 bg-amber-400/[0.12] text-[#FBBF24]'
                : 'border-blue-400/20 bg-blue-400/[0.12] text-[#60A5FA]';

        return `inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-md border px-2 text-center text-xs font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] sm:rounded-full sm:px-3 sm:text-sm ${
            status === btnStatus
                ? selectedClassName
                : 'border-white/[0.08] bg-[#1B202B] text-[#9CA3AF] hover:border-white/20 hover:text-[#F9FAFB]'
        }`;
    };

    const typeButtonClasses = (selected: boolean) =>
        `inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
            selected
                ? 'border-[#3B82F6] bg-[#3B82F6] text-white'
                : 'border-white/[0.08] bg-[#1B202B] text-[#9CA3AF] hover:border-white/20 hover:text-[#F9FAFB]'
        }`;

    const resetForm = () => {
        setMerchant('');
        setCategory(initialCategory);
        setAmount(initialAmount || 0);
        setDate(toDateOnly(new Date()));
        setType('expense');
        setSavingPlans([]);
        setSelectedSavingPlanId('');
        setLoadingSavingPlans(false);
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
            if (result.category && type === 'expense') {
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
        const selectedSavingPlan = savingPlans.find((plan) => plan.id === selectedSavingPlanId);
        if (
            !merchant.trim()
            || !date
            || amount <= 0
            || (type === 'expense' && !category)
            || (type === 'saving' && !selectedSavingPlan)
        ) return;
        setSaving(true);
        try {
            if (type === 'saving') {
                if (!selectedSavingPlan) return;
                await plansApi.createContribution(selectedSavingPlan.id, {
                    name: merchant.trim(),
                    amount,
                    date,
                    comment: comment.trim() || undefined,
                });
            } else {
                await addExpense({
                    expenseName: merchant.trim(),
                    amount,
                    category,
                    date: parseInputDate(date),
                    status: status || 'pending',
                    partialAmount: status === 'partial' ? partialAmount : undefined,
                    comment: comment.trim() || undefined,
                });
            }
            resetForm();
            onClose();
            onExpenseCreated?.();
        } catch (error) {
            console.error(type === 'saving' ? 'Error creating saving contribution' : t('expense.createError'), error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div
                aria-hidden="true"
                className="drawer-overlay fixed inset-0 z-[100] bg-black/70 transition-opacity duration-300"
                onClick={onClose}
            />

            <div
                className="fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-transaction-title"
                onClick={onClose}
            >
                <div
                    className="flex max-h-[calc(100dvh_-_1rem)] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#14171F] text-[#F9FAFB] shadow-2xl sm:max-h-[90vh] sm:rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6">
                        <h2 id="add-transaction-title" className="text-lg font-semibold">
                            {t('expense.addTransaction')}
                        </h2>
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-white/[0.06] hover:text-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                            onClick={onClose}
                            aria-label={t('common.close')}
                            title={t('common.close')}
                        >
                            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </header>

                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void handleSave();
                        }}
                    >
                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    aria-pressed={type === 'expense'}
                                    className={typeButtonClasses(type === 'expense')}
                                    onClick={() => setType('expense')}
                                >
                                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">shopping_bag</span>
                                    <span className="truncate">{t('expense.typeExpense')}</span>
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={type === 'saving'}
                                    className={typeButtonClasses(type === 'saving')}
                                    onClick={() => setType('saving')}
                                >
                                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">savings</span>
                                    <span className="truncate">{t('expense.typeSaving')}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label htmlFor="transaction-merchant" className="block min-w-0">
                                    <span className={fieldLabelClassName}>
                                        {type === 'saving' ? t('expense.savingContributionName') : t('expense.merchant')}
                                    </span>
                                    <input
                                        id="transaction-merchant"
                                        className={fieldClassName}
                                        placeholder={type === 'saving'
                                            ? t('expense.savingContributionPlaceholder')
                                            : t('expense.merchant')}
                                        type="text"
                                        autoComplete="off"
                                        value={merchant}
                                        onChange={(e) => setMerchant(e.target.value)}
                                        required
                                    />
                                </label>

                                {type === 'expense' ? (
                                    <label htmlFor="transaction-category" className="block min-w-0">
                                        <span className={fieldLabelClassName}>{t('expense.category')}</span>
                                        <span className="relative block">
                                            <select
                                                id="transaction-category"
                                                className={`${fieldClassName} appearance-none pr-10`}
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                required
                                            >
                                                <option value="">{t('expense.select')}</option>
                                                {categories.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9CA3AF]">expand_more</span>
                                        </span>
                                    </label>
                                ) : (
                                    <div className="min-w-0">
                                        <span id="transaction-saving-plan-label" className={fieldLabelClassName}>
                                            {t('dashboard.savingsPlans', 'Planes de ahorro')}
                                        </span>
                                            {loadingSavingPlans ? (
                                                <span className="flex h-11 items-center gap-2 text-sm text-[#9CA3AF]">
                                                    <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                                    {t('common.loading')}
                                                </span>
                                            ) : savingPlans.length > 0 ? (
                                                <span className="relative block">
                                                    <select
                                                        id="transaction-saving-plan"
                                                        aria-labelledby="transaction-saving-plan-label"
                                                        className={`${fieldClassName} appearance-none pr-10`}
                                                        value={selectedSavingPlanId}
                                                        onChange={(e) => setSelectedSavingPlanId(e.target.value)}
                                                        required
                                                    >
                                                        {savingPlans.map((plan) => (
                                                            <option key={plan.id} value={plan.id}>
                                                                {plan.name || t('dashboard.savingsDefaultName')}
                                                                {' · '}{plan.startDate.slice(0, 10)} – {plan.endDate.slice(0, 10)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9CA3AF]">expand_more</span>
                                                </span>
                                            ) : (
                                                <p className="flex min-h-11 items-center rounded-md border border-dashed border-white/[0.12] px-3 text-xs text-[#9CA3AF]">
                                                    {t('dashboard.savingsPlansEmpty', 'Crea un plan de ahorro para esta fecha')}
                                                </p>
                                            )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label htmlFor="transaction-amount" className="block min-w-0">
                                    <span className={fieldLabelClassName}>{t('expense.amountLabel')}</span>
                                    <span className="relative block">
                                        <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#9CA3AF]">€</span>
                                        <input
                                            id="transaction-amount"
                                            className={`${fieldClassName} pl-9 font-mono tabular-nums`}
                                            placeholder={t('expense.amountPlaceholder')}
                                            step="0.01"
                                            min="0"
                                            type="number"
                                            value={amount || ''}
                                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                            required
                                        />
                                    </span>
                                </label>

                                <label htmlFor="transaction-date" className="block min-w-0">
                                    <span className={fieldLabelClassName}>{t('expense.date')}</span>
                                    <input
                                        id="transaction-date"
                                        className={fieldClassName}
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>

                            {type === 'expense' && (
                                <>
                            <fieldset className="space-y-2">
                                <legend className={fieldLabelClassName}>{t('expense.status')}</legend>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    <button
                                        className={statusButtonClasses('paid')}
                                        aria-pressed={status === 'paid'}
                                        onClick={() => handleStatus('paid')}
                                        type="button"
                                    >
                                        <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[16px]">check_circle</span>
                                        <span>{t('expense.paid')}</span>
                                    </button>
                                    <button
                                        className={statusButtonClasses('pending')}
                                        aria-pressed={status === 'pending'}
                                        onClick={() => handleStatus('pending')}
                                        type="button"
                                    >
                                        <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[16px]">schedule</span>
                                        <span>{t('expense.pending')}</span>
                                    </button>
                                    <button
                                        className={statusButtonClasses('partial')}
                                        aria-pressed={status === 'partial'}
                                        onClick={() => handleStatus('partial')}
                                        type="button"
                                    >
                                        <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[16px]">incomplete_circle</span>
                                        <span>{t('expense.partial')}</span>
                                    </button>
                                </div>
                            </fieldset>

                            {status === 'partial' && (
                                <div className="space-y-3 rounded-lg border border-white/[0.08] bg-[#1B202B] p-3 sm:p-4">
                                    <label htmlFor="transaction-partial-amount" className="block">
                                        <span className={fieldLabelClassName}>{t('expense.paidSoFar')}</span>
                                        <span className="relative block">
                                            <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#9CA3AF]">€</span>
                                            <input
                                                id="transaction-partial-amount"
                                                className={`${fieldClassName} pl-9 font-mono tabular-nums`}
                                                placeholder={t('expense.amountPlaceholder')}
                                                step="0.01"
                                                type="number"
                                                min="0"
                                                max={amount}
                                                value={partialAmount || ''}
                                                onChange={(e) => setPartialAmount(parseFloat(e.target.value) || 0)}
                                            />
                                        </span>
                                    </label>
                                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#0B0D11] px-3 py-2 text-sm">
                                        <span className="text-[#9CA3AF]">{t('expense.remaining')}</span>
                                        <span className="font-mono tabular-nums text-[#FBBF24]">€{Math.max(0, amount - partialAmount).toFixed(2)}</span>
                                    </div>
                                    <label htmlFor="transaction-comment" className="block">
                                        <span className={fieldLabelClassName}>{t('expense.paymentComments')}</span>
                                        <textarea
                                            id="transaction-comment"
                                            className={`${fieldClassName} min-h-24 resize-y`}
                                            placeholder={t('expense.partialCommentPlaceholder')}
                                            rows={3}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </label>
                                </div>
                            )}

                            {status !== 'partial' && (
                                <section className="space-y-2">
                                    <h3 className={fieldLabelClassName}>{t('expense.receipt')}</h3>
                                    {scanning ? (
                                        <div className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-[#1B202B] p-3">
                                            <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[#3B82F6]">sync</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-[#F9FAFB]">{t('upload.scanning')}</p>
                                                <p className="text-xs text-[#9CA3AF]">{t('upload.extracting')}</p>
                                            </div>
                                        </div>
                                    ) : receiptPreview ? (
                                        <div className="relative overflow-hidden rounded-md border border-white/[0.08] bg-[#1B202B]">
                                            <img src={receiptPreview} alt={t('upload.preview')} className="max-h-40 w-full object-contain" />
                                            <button
                                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0B0D11] text-[#F9FAFB] hover:bg-white/[0.1]"
                                                onClick={handleRemoveReceipt}
                                                type="button"
                                                aria-label={t('common.close')}
                                            >
                                                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ) : receiptFile ? (
                                        <div className="flex min-w-0 items-center gap-3 rounded-md border border-white/[0.08] bg-[#1B202B] p-3">
                                            <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[#9CA3AF]">description</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-[#F9FAFB]">{receiptFile.name}</p>
                                                <p className="text-xs text-[#9CA3AF]">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-white/[0.06] hover:text-[#F9FAFB]" onClick={handleRemoveReceipt} type="button" aria-label={t('common.close')}>
                                                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="flex min-h-16 w-full items-center gap-3 rounded-md border border-dashed border-white/[0.16] bg-[#1B202B] px-3 py-3 text-left transition-colors hover:border-[#3B82F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                                            onClick={() => fileInputRef.current?.click()}
                                            type="button"
                                        >
                                            <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[#9CA3AF]">upload_file</span>
                                            <span className="min-w-0">
                                                <span className="block text-sm font-medium text-[#F9FAFB]">{t('upload.upload')}</span>
                                                <span className="block text-xs text-[#9CA3AF]">{t('upload.formats')}</span>
                                            </span>
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </section>
                            )}
                                </>
                            )}

                            {type === 'saving' && (
                                <label htmlFor="transaction-comment" className="block">
                                    <span className={fieldLabelClassName}>{t('expense.savingContributionNote')}</span>
                                    <textarea
                                        id="transaction-comment"
                                        className={`${fieldClassName} min-h-24 resize-y`}
                                        placeholder={t('expense.savingContributionNotePlaceholder')}
                                        rows={3}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </label>
                            )}
                        </div>

                        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-white/[0.08] p-4 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
                            <button
                                type="button"
                                className="min-h-11 flex-1 rounded-md border border-white/[0.12] px-4 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-white/[0.04] hover:text-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] sm:flex-none"
                                onClick={onClose}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="min-h-11 flex-1 rounded-md bg-[#3B82F6] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                                disabled={saving || !merchant.trim() || !date || (type === 'expense' ? !category : loadingSavingPlans || !selectedSavingPlanId) || amount <= 0}
                            >
                                {saving ? t('budget.saving') : t('expense.saveTransaction')}
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
        </>
    )
}
