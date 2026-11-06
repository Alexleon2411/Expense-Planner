import { useState, useMemo, useEffect } from 'react';
import { useFixedExpenses } from '../hooks/useFixedExpenses';
import { categoriesApi, statsApi } from '../api';
import FixedExpensesCalendar from './FixedExpensesCalendar';
import CategoryIcon from './CategoryIcon';
import { useTranslation } from 'react-i18next';
import { formatCurrecy } from '../helpers';

export default function FixedExpenses() {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [flippedId, setFlippedId] = useState<string | null>(null);
    const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(() => new Set());
    const [showCalendar, setShowCalendar] = useState(false);
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    const [showForm, setShowForm] = useState(false);
    const [showNewMenu, setShowNewMenu] = useState(false);
    const [formMode, setFormMode] = useState<'template' | 'item'>('item');
    const [editingExpense, setEditingExpense] = useState<typeof fixedExpenses[number] | null>(null);
    const [groupName, setGroupName] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemAmount, setItemAmount] = useState('');
    const [itemCategory, setItemCategory] = useState('');
    const [itemDay, setItemDay] = useState('');
    const [existingTemplateId, setExistingTemplateId] = useState('');
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [trends, setTrends] = useState<{ month: number; total: number }[]>([]);
    const [overview, setOverview] = useState<{ totalSpent: number; budgeted: number; remaining: number; percentage: number } | null>(null);

    const { t, i18n } = useTranslation();
    const monthName = (month: number) => new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(new Date(selectedYear, month - 1, 1));

    function navigateMonth(direction: number) {
        setSelectedMonth((prev) => {
            let newMonth = prev + direction
            if (newMonth > 12) {
                newMonth = 1
                setSelectedYear((y) => y + 1)
            } else if (newMonth < 1) {
                newMonth = 12
                setSelectedYear((y) => y - 1)
            }
            return newMonth
        })
    }

    const { fixedExpenses, loading, error, markItemAsPaid, getPendingExpenses, getPaidExpenses, getTotalFixedExpenses, createTemplate, createItem, updateItem, deleteItem } = useFixedExpenses();

    const pendingExpenses = useMemo(() => getPendingExpenses(), [getPendingExpenses]);
    const paidExpenses = useMemo(() => getPaidExpenses(), [getPaidExpenses]);
    const totalFixed = useMemo(() => getTotalFixedExpenses(), [getTotalFixedExpenses]);
    const paidFixedAmount = useMemo(() => {
        return fixedExpenses.reduce((sum, expense) => {
            if (expense.status === 'paid') return sum + expense.amount;
            if (expense.status === 'partial') return sum + (expense.partialAmount || 0);
            return sum;
        }, 0);
    }, [fixedExpenses]);
    const remainingFixedAmount = totalFixed - paidFixedAmount;

    const templateGroups = useMemo(() => {
        const groupMap = new Map<string, { id: string; name: string; expenses: typeof fixedExpenses }>();
        fixedExpenses.forEach((e) => {
            const existing = groupMap.get(e.templateId);
            if (existing) {
                existing.expenses.push(e);
            } else {
                groupMap.set(e.templateId, {
                    id: e.templateId,
                    name: e.templateGroupName || e.category,
                    expenses: [e],
                });
            }
        });
        return Array.from(groupMap.values());
    }, [fixedExpenses]);

    useEffect(() => {
        categoriesApi.listCategories().then(setCategories).catch(() => {});
    }, []);

    useEffect(() => {
        statsApi.getMonthlyTrend(selectedYear).then(setTrends).catch(() => {});
        statsApi.getOverview(selectedMonth, selectedYear).then(setOverview).catch(() => {});
    }, [selectedMonth, selectedYear]);

    function resetForm() {
        setGroupName('');
        setItemName('');
        setItemAmount('');
        setItemCategory('');
        setItemDay('');
        setExistingTemplateId('');
        setEditingExpense(null);
    }

    function openNewItemForm() {
        resetForm();
        setFormMode('item');
        setShowForm(true);
        setShowNewMenu(false);
    }

    function openNewTemplateForm() {
        resetForm();
        setFormMode('template');
        setShowForm(true);
        setShowNewMenu(false);
    }

    function openAddItemForm(templateId: string) {
        resetForm();
        setFormMode('item');
        setExistingTemplateId(templateId);
        setShowForm(true);
    }

    function openEditItemForm(expense: typeof fixedExpenses[number]) {
        resetForm();
        setFormMode('item');
        setEditingExpense(expense);
        setExistingTemplateId(expense.templateId);
        setItemName(expense.name);
        setItemAmount(String(expense.amount));
        setItemCategory(expense.categoryId);
        setItemDay(expense.dueDay ? String(expense.dueDay) : '');
        setShowForm(true);
    }

    async function handleSubmit() {
        if (editingExpense) {
            if (!itemName.trim() || !itemAmount || !itemCategory) return;
            await updateItem(editingExpense.templateId, editingExpense.id, {
                name: itemName.trim(),
                amount: parseFloat(itemAmount),
                categoryId: itemCategory,
                dayOfMonth: itemDay ? parseInt(itemDay) : undefined,
            });
        } else if (formMode === 'template') {
            if (!groupName.trim() || !itemName.trim() || !itemAmount || !itemCategory) return;
            const template = await createTemplate(groupName.trim());
            if (template) {
                await createItem(template.id, {
                    name: itemName.trim(),
                    amount: parseFloat(itemAmount),
                    categoryId: itemCategory,
                    dayOfMonth: itemDay ? parseInt(itemDay) : undefined,
                });
            }
        } else {
            if (!existingTemplateId || !itemName.trim() || !itemAmount || !itemCategory) return;
            await createItem(existingTemplateId, {
                name: itemName.trim(),
                amount: parseFloat(itemAmount),
                categoryId: itemCategory,
                dayOfMonth: itemDay ? parseInt(itemDay) : undefined,
            });
        }
        setShowForm(false);
        resetForm();
    }

    function getStatusColor(status: string): string {
        switch (status) {
            case 'paid': return 'bg-emerald-400/[0.12] text-[#34D399]';
            case 'partial': return 'bg-blue-400/[0.12] text-[#60A5FA]';
            case 'pending': return 'bg-amber-400/[0.12] text-[#FBBF24]';
            default: return 'bg-white/[0.06] text-[#9CA3AF]';
        }
    }

    function getStatusLabel(status: string): string {
        if (status === 'paid') return t('fixedExpenses.paid');
        if (status === 'partial') return t('templates.partial');
        return t('fixedExpenses.pending');
    }

    function toggleFlip(id: string) {
        setFlippedId((prev) => (prev === id ? null : id));
    }

    function toggleGroup(groupId: string) {
        setCollapsedGroupIds((current) => {
            const next = new Set(current);
            if (next.has(groupId)) next.delete(groupId);
            else next.add(groupId);
            return next;
        });
    }

    function handleMarkAsPaid(templateId: string, itemId: string) {
        markItemAsPaid(templateId, itemId);
    }

    const formFieldClassName = 'w-full rounded-md border border-white/[0.08] bg-[#1B202B] px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 [color-scheme:dark]';
    const formLabelClassName = 'mb-2 block text-xs font-medium text-[#9CA3AF]';

    return (
        <div className="min-h-screen bg-[#0B0D11] p-4 text-[#F9FAFB] sm:p-6">
            <main className="space-y-4">
                <header className="flex min-h-12 items-center justify-between gap-4">
                    <h1 className="min-w-0 text-xl font-semibold tracking-tight">{t('fixedExpenses.title')}</h1>
                    <div className="relative shrink-0">
                        <button
                            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#3B82F6] px-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] sm:min-h-9"
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={showNewMenu}
                            onClick={() => setShowNewMenu((visible) => !visible)}
                        >
                            <span aria-hidden="true" className="text-lg leading-none">+</span>
                            <span>{t('fixedExpenses.new')}</span>
                            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">expand_more</span>
                        </button>
                        <div className={`absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-white/[0.08] bg-[#1B202B] shadow-xl transition-opacity ${showNewMenu ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'}`}>
                            <button
                                type="button"
                                onClick={openNewItemForm}
                                className="flex min-h-11 w-full items-center gap-3 px-3 text-left text-sm text-[#F9FAFB] transition-colors hover:bg-white/[0.06]"
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#60A5FA]">add_circle</span>
                                <span>{t('fixedExpenses.addExpense')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={openNewTemplateForm}
                                className="flex min-h-11 w-full items-center gap-3 border-t border-white/[0.08] px-3 text-left text-sm text-[#F9FAFB] transition-colors hover:bg-white/[0.06]"
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#60A5FA]">library_add</span>
                                <span>{t('fixedExpenses.newTemplateExpense')}</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-[#14171F] p-3">
                    <div className="inline-flex items-center rounded-md bg-[#0B0D11] p-1" role="group" aria-label={t('fixedExpenses.viewMode')}>
                        <button
                            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] sm:min-h-9 ${viewMode === 'grid' ? 'bg-[#3B82F6] text-white' : 'text-[#9CA3AF] hover:bg-white/[0.06] hover:text-[#F9FAFB]'}`}
                            type="button"
                            onClick={() => setViewMode('grid')}
                            aria-label={t('fixedExpenses.showCards')}
                            aria-pressed={viewMode === 'grid'}
                        >
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">grid_view</span>
                            <span className="hidden sm:inline">{t('fixedExpenses.cards')}</span>
                        </button>
                        <button
                            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] sm:min-h-9 ${viewMode === 'table' ? 'bg-[#3B82F6] text-white' : 'text-[#9CA3AF] hover:bg-white/[0.06] hover:text-[#F9FAFB]'}`}
                            type="button"
                            onClick={() => setViewMode('table')}
                            aria-label={t('fixedExpenses.showTable')}
                            aria-pressed={viewMode === 'table'}
                        >
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">table_rows</span>
                            <span className="hidden sm:inline">{t('fixedExpenses.table')}</span>
                        </button>
                    </div>
                    <button
                        className={`hidden min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] sm:inline-flex ${showCalendar ? 'border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#60A5FA]' : 'border-white/[0.08] text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]'}`}
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        aria-pressed={showCalendar}
                    >
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">calendar_month</span>
                        <span className="hidden sm:inline">{t('fixedExpenses.calendar')}</span>
                    </button>
                </div>

                {loading && (
                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#9CA3AF]">
                        <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[#60A5FA]">progress_activity</span>
                        <span>{t('fixedExpenses.loading')}</span>
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-[#F87171]/25 bg-[#F87171]/[0.08] p-3 text-sm text-[#F87171]">
                        {error}
                    </div>
                )}

                {/* Summary */}
                <section className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#14171F]">
                    <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
                        <span className="text-sm font-medium text-[#9CA3AF]">{t('fixedExpenses.total')}</span>
                        <span className="text-right font-mono text-lg font-semibold tabular-nums text-[#F9FAFB]">{formatCurrecy(totalFixed)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4">
                        <div className="min-w-0 space-y-1">
                            <p className="text-xs text-[#9CA3AF]">
                                {t('fixedExpenses.paid')} · {paidExpenses.length} {paidExpenses.length === 1 ? t('fixedExpenses.item') : t('fixedExpenses.items')}
                            </p>
                            <p className="truncate font-mono text-sm font-medium tabular-nums text-[#34D399]">{formatCurrecy(paidFixedAmount)}</p>
                        </div>
                        <div className="min-w-0 space-y-1">
                            <p className="text-xs text-[#9CA3AF]">
                                {t('fixedExpenses.pending')} · {pendingExpenses.length} {pendingExpenses.length === 1 ? t('fixedExpenses.item') : t('fixedExpenses.items')}
                            </p>
                            <p className="truncate font-mono text-sm font-medium tabular-nums text-[#FBBF24]">{formatCurrecy(remainingFixedAmount)}</p>
                        </div>
                        <div className="col-span-2 h-2 overflow-hidden rounded-full bg-[#1B202B]">
                            <div
                                className="h-full rounded-full bg-[#34D399] transition-[width]"
                                style={{ width: `${totalFixed > 0 ? (paidFixedAmount / totalFixed) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </section>

                {/* Calendar Section */}
                {showCalendar && (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-medium text-[#9CA3AF]">{t('fixedExpenses.calendar')}</h3>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => navigateMonth(-1)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.08] text-[#9CA3AF] transition-colors hover:bg-white/[0.06] hover:text-[#F9FAFB]"
                                >
                                    <span aria-hidden="true" className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <span className="min-w-[120px] text-center text-sm font-medium text-[#F9FAFB] sm:min-w-[140px]">
                                    {monthName(selectedMonth)} {selectedYear}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => navigateMonth(1)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.08] text-[#9CA3AF] transition-colors hover:bg-white/[0.06] hover:text-[#F9FAFB]"
                                >
                                    <span aria-hidden="true" className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <FixedExpensesCalendar
                            fixedExpenses={fixedExpenses}
                            onMarkAsPaid={handleMarkAsPaid}
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            trends={trends}
                            overview={overview}
                        />
                    </section>
                )}

                {/* Template Groups */}
                {templateGroups.length === 0 && !loading && (
                    <div className="rounded-lg border border-white/[0.08] bg-[#14171F] p-6 text-center">
                        <span aria-hidden="true" className="material-symbols-outlined mb-3 block text-4xl text-[#6B7280]">folder_open</span>
                        <p className="mb-1 text-base font-semibold text-[#F9FAFB]">{t('fixedExpenses.noTemplates')}</p>
                        <p className="mb-4 text-sm text-[#9CA3AF]">{t('fixedExpenses.createFirst')}</p>
                        <button
                            type="button"
                            onClick={openNewTemplateForm}
                            className="inline-flex min-h-11 items-center rounded-md bg-[#3B82F6] px-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
                        >
                            {t('fixedExpenses.createTemplate')}
                        </button>
                    </div>
                )}

                {templateGroups.map((group) => {
                    const groupTotal = group.expenses.reduce((s, e) => s + e.amount, 0);
                    const isCollapsed = collapsedGroupIds.has(group.id);

                    return (
                        <section key={group.id} className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#14171F]">
                            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <button
                                        type="button"
                                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-white/[0.06] hover:text-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                                        onClick={() => toggleGroup(group.id)}
                                        aria-expanded={!isCollapsed}
                                        aria-controls={`fixed-expense-group-${group.id}`}
                                        aria-label={t(isCollapsed ? 'common.expandGroup' : 'common.collapseGroup', { name: group.name })}
                                        title={t(isCollapsed ? 'common.expandGroup' : 'common.collapseGroup', { name: group.name })}
                                    >
                                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{isCollapsed ? 'expand_more' : 'expand_less'}</span>
                                    </button>
                                    <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[18px] text-[#9CA3AF]">folder</span>
                                    <h3 className="truncate text-sm font-medium text-[#F9FAFB]">{group.name}</h3>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span className="whitespace-nowrap text-right font-mono text-xs tabular-nums text-[#9CA3AF] sm:text-sm">
                                        {formatCurrecy(groupTotal)} / {t('fixedExpenses.month')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => openAddItemForm(group.id)}
                                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#3B82F6] text-white transition-colors hover:bg-[#2563EB] sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
                                        title={t('fixedExpenses.addTo', { name: group.name })}
                                        aria-label={t('fixedExpenses.addTo', { name: group.name })}
                                    >
                                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
                                        <span className="hidden text-sm sm:inline">{t('fixedExpenses.addExpenseShort')}</span>
                                    </button>
                                </div>
                            </div>

                            <div id={`fixed-expense-group-${group.id}`} hidden={isCollapsed} className="p-3 sm:p-4">
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {group.expenses.map((expense) => {
                                            const isPaid = expense.status === 'paid';
                                            const isFlipped = flippedId === expense.id;
                                            const statusLabel = getStatusLabel(expense.status);

                                            return (
                                                <div
                                                    key={expense.id}
                                                    className="cursor-pointer"
                                                    style={{ perspective: '1000px' }}
                                                    onClick={() => toggleFlip(expense.id)}
                                                >
                                                    <div
                                                        className="grid [&>*]:col-start-1 [&>*]:row-start-1 transition-transform duration-500"
                                                        style={{
                                                            transformStyle: 'preserve-3d',
                                                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                        }}
                                                    >
                                                        <div
                                                            className="flex min-h-[220px] flex-col justify-between rounded-lg border border-white/[0.08] bg-[#1B202B] p-4"
                                                            style={{ backfaceVisibility: 'hidden' }}
                                                        >
                                                            <div>
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <CategoryIcon
                                                                        icon={expense.categoryIcon}
                                                                        color={expense.categoryColor}
                                                                        name={expense.category}
                                                                        size="md"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); openEditItemForm(expense); }}
                                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-white/[0.06] hover:text-[#F9FAFB]"
                                                                        title={t('fixedExpenses.edit')}
                                                                        aria-label={t('fixedExpenses.edit')}
                                                                    >
                                                                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">edit</span>
                                                                    </button>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <span className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium uppercase ${getStatusColor(expense.status)}`}>
                                                                        {statusLabel}
                                                                    </span>
                                                                </div>
                                                                <h4 className="mb-1 mt-2 text-sm font-medium text-[#F9FAFB]">{expense.name}</h4>
                                                                <p className="font-mono text-lg font-medium tabular-nums text-[#F9FAFB]">{formatCurrecy(expense.amount)}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-[#9CA3AF]">
                                                                    {expense.dueDay ? t('fixedExpenses.due', { day: expense.dueDay }) : t('fixedExpenses.noDue')}
                                                                </p>
                                                                <p className="text-xs text-[#9CA3AF]">{expense.category}</p>
                                                                {!isPaid ? (
                                                                    <button
                                                                        className="min-h-10 w-full rounded-md bg-[#3B82F6] px-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(expense.templateId, expense.id); }}
                                                                    >
                                                                         {t('fixedExpenses.markPaid')}
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="min-h-10 w-full rounded-md border border-white/[0.08] px-3 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-white/[0.04] hover:text-[#F9FAFB]"
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); deleteItem(expense.templateId, expense.id); }}
                                                                    >
                                                                         {t('fixedExpenses.remove')}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div
                                                            className="flex min-h-[220px] flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#1B202B] p-4"
                                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                                        >
                                                            <div className="mb-3 flex items-center justify-between gap-2">
                                                                <h4 className="truncate text-sm font-medium text-[#F9FAFB]">{expense.name}</h4>
                                                                <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[18px] text-[#9CA3AF]">history</span>
                                                            </div>
                                                            <p className="mb-2 text-xs font-medium text-[#9CA3AF]">{t('fixedExpenses.history')}</p>
                                                            <div className="flex-1 space-y-1 overflow-y-auto">
                                                                {[...expense.history].reverse().map((record, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`flex items-center justify-between rounded px-2 py-1 text-xs ${record.paid ? 'bg-emerald-400/[0.08] text-[#34D399]' : 'bg-white/[0.04] text-[#9CA3AF]'}`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
                                                                                {record.paid ? 'check_circle' : 'pending'}
                                                                            </span>
                                                                            <span>{record.month}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="mt-2 text-center text-xs text-[#6B7280]">{t('fixedExpenses.flipBack')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                 ) : (
                                     <>
                                    <div className="hidden max-h-[400px] overflow-auto sm:block">
                                        <table className="w-full min-w-[900px] border-collapse text-left sm:table-fixed">
                                            <thead>
                                                <tr className="border-b border-white/[0.08]">
                                                    <th className="px-4 py-3 text-xs font-medium text-[#9CA3AF]">{t('fixedExpenses.name')}</th>
                                                    <th className="px-4 py-3 text-xs font-medium text-[#9CA3AF]">{t('fixedExpenses.category')}</th>
                                                    <th className="px-4 py-3 text-right font-mono text-xs font-medium tabular-nums text-[#9CA3AF]">{t('fixedExpenses.amount')}</th>
                                                    <th className="px-4 py-3 text-xs font-medium text-[#9CA3AF]">{t('fixedExpenses.dueDay')}</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-[#9CA3AF]">{t('fixedExpenses.status')}</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-[#9CA3AF]">{t('fixedExpenses.action')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.08]">
                                                {group.expenses.map((expense) => {
                                                    const isPaid = expense.status === 'paid';

                                                    return (
                                                        <tr key={expense.id} className="transition-colors hover:bg-white/[0.03]">
                                                            <td className="px-4 py-3">
                                                                <div className="flex min-w-0 items-center gap-3">
                                                                    <CategoryIcon
                                                                        icon={expense.categoryIcon}
                                                                        color={expense.categoryColor}
                                                                        name={expense.category}
                                                                        size="sm"
                                                                    />
                                                                    <span className="truncate text-sm font-medium text-[#F9FAFB]">{expense.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-[#9CA3AF]">{expense.category}</td>
                                                            <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-[#F9FAFB]">{formatCurrecy(expense.amount)}</td>
                                                            <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                                                                {expense.dueDay ? t('fixedExpenses.due', { day: expense.dueDay }) : '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium uppercase ${getStatusColor(expense.status)}`}>
                                                                    {getStatusLabel(expense.status)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    {!isPaid && (
                                                                        <button
                                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-emerald-400/[0.08] hover:text-[#34D399]"
                                                                            type="button"
                                                                            onClick={() => handleMarkAsPaid(expense.templateId, expense.id)}
                                                                            title={t('fixedExpenses.addPaid', { name: expense.name })}
                                                                            aria-label={t('fixedExpenses.addPaid', { name: expense.name })}
                                                                        >
                                                                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">paid</span>
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-white/[0.06] hover:text-[#F9FAFB]"
                                                                        type="button"
                                                                        onClick={() => openEditItemForm(expense)}
                                                                        title={t('fixedExpenses.edit')}
                                                                        aria-label={t('fixedExpenses.editExpense')}
                                                                    >
                                                                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">edit</span>
                                                                    </button>
                                                                    <button
                                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F87171]/[0.08] hover:text-[#F87171]"
                                                                        type="button"
                                                                        onClick={() => deleteItem(expense.templateId, expense.id)}
                                                                        title={t('fixedExpenses.remove')}
                                                                        aria-label={t('fixedExpenses.deleteExpense')}
                                                                    >
                                                                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">delete</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="divide-y divide-white/[0.08] sm:hidden">
                                        {group.expenses.map((expense) => {
                                            const isPaid = expense.status === 'paid';

                                            return (
                                                <article key={expense.id} className="px-4 py-3 transition-colors hover:bg-white/[0.03]">
                                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <CategoryIcon
                                                                icon={expense.categoryIcon}
                                                                color={expense.categoryColor}
                                                                name={expense.category}
                                                                size="sm"
                                                            />
                                                            <div className="min-w-0">
                                                                <h4 className="truncate text-sm font-medium text-[#F9FAFB]">{expense.name}</h4>
                                                                <p className="truncate text-xs text-[#9CA3AF]">{expense.category}</p>
                                                            </div>
                                                        </div>
                                                        <span className="shrink-0 whitespace-nowrap text-right font-mono text-sm font-medium tabular-nums text-[#F9FAFB]">
                                                            {formatCurrecy(expense.amount)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                        <span className="min-w-0 text-xs text-[#9CA3AF]">
                                                            {expense.dueDay ? t('fixedExpenses.due', { day: expense.dueDay }) : t('fixedExpenses.noDue')}
                                                        </span>
                                                        <div className="flex shrink-0 items-center gap-1">
                                                            <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium uppercase ${getStatusColor(expense.status)}`}>
                                                                {getStatusLabel(expense.status)}
                                                            </span>
                                                            {!isPaid && (
                                                                <button
                                                                    className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-emerald-400/[0.08] hover:text-[#34D399]"
                                                                    type="button"
                                                                    onClick={() => handleMarkAsPaid(expense.templateId, expense.id)}
                                                                    title={t('fixedExpenses.addPaid', { name: expense.name })}
                                                                    aria-label={t('fixedExpenses.addPaid', { name: expense.name })}
                                                                >
                                                                    <span aria-hidden="true" className="material-symbols-outlined">paid</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-white/[0.06] hover:text-[#F9FAFB]"
                                                                type="button"
                                                                onClick={() => openEditItemForm(expense)}
                                                                title={t('fixedExpenses.editExpense')}
                                                                aria-label={t('fixedExpenses.editExpense')}
                                                            >
                                                                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">edit</span>
                                                            </button>
                                                            <button
                                                                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F87171]/[0.08] hover:text-[#F87171]"
                                                                type="button"
                                                                onClick={() => deleteItem(expense.templateId, expense.id)}
                                                                title={t('fixedExpenses.deleteExpense')}
                                                                aria-label={t('fixedExpenses.deleteExpense')}
                                                            >
                                                                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                      </>
                                  )}
                            </div>
                        </section>
                    );
                })}
            </main>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
                    <div aria-hidden="true" className="absolute inset-0 bg-black/70" onClick={() => setShowForm(false)} />
                    <div
                        className="relative flex max-h-[calc(100dvh_-_1rem)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#14171F] text-[#F9FAFB] shadow-2xl sm:max-h-[90vh] sm:rounded-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="fixed-expense-form-title"
                    >
                        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6">
                            <h3 id="fixed-expense-form-title" className="text-lg font-semibold">
                                {formMode === 'template' ? t('fixedExpenses.newTemplate') : editingExpense ? t('fixedExpenses.editExpense') : t('fixedExpenses.addTitle')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-white/[0.06] hover:text-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] sm:h-9 sm:w-9"
                                aria-label={t('common.close')}
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </header>

                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                            {formMode === 'template' && (
                                <div>
                                    <label htmlFor="fixed-template-name" className={formLabelClassName}>{t('fixedExpenses.templateName')}</label>
                                    <input
                                        id="fixed-template-name"
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder={t('fixedExpenses.templatePlaceholder')}
                                        className={formFieldClassName}
                                    />
                                </div>
                            )}

                            {formMode === 'item' && !editingExpense && (
                                <div>
                                    <label htmlFor="fixed-template-group" className={formLabelClassName}>{t('fixedExpenses.templateGroup')}</label>
                                    <select
                                        id="fixed-template-group"
                                        value={existingTemplateId}
                                        onChange={(e) => setExistingTemplateId(e.target.value)}
                                        className={formFieldClassName}
                                    >
                                        <option value="">{t('fixedExpenses.selectTemplate')}</option>
                                        {templateGroups.map((g) => (
                                            <option key={g.id} value={g.id}>{g.name} ({g.expenses.length} expenses)</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label htmlFor="fixed-expense-name" className={formLabelClassName}>{t('fixedExpenses.expenseName')}</label>
                                <input
                                    id="fixed-expense-name"
                                    type="text"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    placeholder={t('fixedExpenses.expensePlaceholder')}
                                    className={formFieldClassName}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="fixed-expense-amount" className={formLabelClassName}>{t('fixedExpenses.amount')}</label>
                                    <input
                                        id="fixed-expense-amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={itemAmount}
                                        onChange={(e) => setItemAmount(e.target.value)}
                                        placeholder={t('fixedExpenses.amountPlaceholder')}
                                        className={`${formFieldClassName} font-mono tabular-nums`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="fixed-expense-due-day" className={formLabelClassName}>{t('fixedExpenses.dueDay')}</label>
                                    <input
                                        id="fixed-expense-due-day"
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={itemDay}
                                        onChange={(e) => setItemDay(e.target.value)}
                                        placeholder={t('fixedExpenses.duePlaceholder')}
                                        className={`${formFieldClassName} font-mono tabular-nums`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="fixed-expense-category" className={formLabelClassName}>{t('fixedExpenses.category')}</label>
                                <select
                                    id="fixed-expense-category"
                                    value={itemCategory}
                                    onChange={(e) => setItemCategory(e.target.value)}
                                    className={formFieldClassName}
                                >
                                    <option value="">{t('fixedExpenses.selectCategory')}</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-white/[0.08] p-4 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); resetForm(); }}
                                className="min-h-11 w-full rounded-md border border-white/[0.12] px-4 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-white/[0.04] hover:text-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] sm:w-auto"
                            >
                                {t('fixedExpenses.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={formMode === 'template'
                                    ? !groupName.trim() || !itemName.trim() || !itemAmount || !itemCategory
                                    : editingExpense
                                        ? !itemName.trim() || !itemAmount || !itemCategory
                                        : !existingTemplateId || !itemName.trim() || !itemAmount || !itemCategory}
                                className="min-h-11 w-full rounded-md bg-[#3B82F6] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] sm:w-auto"
                            >
                                {formMode === 'template' ? t('fixedExpenses.create') : editingExpense ? t('fixedExpenses.save') : t('fixedExpenses.add')}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
