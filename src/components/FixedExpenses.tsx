import { useState, useMemo, useEffect } from 'react';
import { useFixedExpenses } from '../hooks/useFixedExpenses';
import { categoriesApi, statsApi } from '../api';
import FixedExpensesCalendar from './FixedExpensesCalendar';
import CategoryIcon from './CategoryIcon';

export default function FixedExpenses() {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [flippedId, setFlippedId] = useState<string | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    const [showForm, setShowForm] = useState(false);
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

    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

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
    }

    function openNewTemplateForm() {
        resetForm();
        setFormMode('template');
        setShowForm(true);
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

    function getOrdinalSuffix(day: number): string {
        if (day === 1 || day === 21 || day === 31) return 'st';
        if (day === 2 || day === 22) return 'nd';
        if (day === 3 || day === 23) return 'rd';
        return 'th';
    }

    function getStatusColor(status: string): string {
        switch (status) {
            case 'paid': return 'status-gain';
            case 'partial': return 'text-yellow-600 bg-yellow-100';
            case 'pending': return 'status-loss';
            default: return 'text-on-surface-variant bg-surface-container-high';
        }
    }

    function toggleFlip(id: string) {
        setFlippedId((prev) => (prev === id ? null : id));
    }

    function handleMarkAsPaid(templateId: string, itemId: string) {
        markItemAsPaid(templateId, itemId);
    }

    return (
        <div className="p-lg space-y-lg">
            <main className="space-y-xl">
                {/* Header */}
                <div className="mb-xl text-center py-xl relative overflow-hidden rounded-xl bg-primary-container text-on-primary">
                        <div className="relative z-10">
                            <h2 className="text-headline-lg font-headline-lg mb-xs">Fixed Expenses</h2>
                            <p className="text-body-md opacity-80 max-w-2xl mx-auto">Manage your monthly recurring costs and payment templates.</p>
                        </div>
                    </div>
                <div className="block lg:flex justify-between items-end">
                    <div className="flex items-center space-x-md mt-4 lg:mt-0 justify-center lg:justify-end">
                        <div className="flex bg-surface-container-highest rounded-lg overflow-hidden ">
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
                        <button
                            className={`hidden md:flex lg:flex items-center space-x-xs px-md py-sm rounded-lg font-bold transition-colors ${showCalendar ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'}`}
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                        >
                            <span className="material-symbols-outlined">calendar_month</span>
                            <span>Calendar</span>
                        </button>
                        <div className="relative group">
                            <button className="flex items-center space-x-xs px-md py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity">
                                <span className="material-symbols-outlined">add</span>
                                <span>New</span>
                                <span className="material-symbols-outlined text-xs">expand_more</span>
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-56 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <button
                                    type="button"
                                    onClick={openNewItemForm}
                                    className="w-full flex items-center space-x-sm px-md py-sm text-on-surface hover:bg-surface-container-high transition-colors rounded-t-lg text-left"
                                >
                                    <span className="material-symbols-outlined text-primary">add_circle</span>
                                    <span className="text-body-md">Add Fixed Expense</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={openNewTemplateForm}
                                    className="w-full flex items-center space-x-sm px-md py-sm text-on-surface hover:bg-surface-container-high transition-colors rounded-b-lg text-left"
                                >
                                    <span className="material-symbols-outlined text-primary">library_add</span>
                                    <span className="text-body-md">New Template + Expense</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-xl">
                        <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                        <span className="ml-sm text-on-surface-variant">Loading fixed expenses...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-md text-red-600">
                        {error}
                    </div>
                )}

                {/* Summary */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
                    <div className="flex items-center justify-between px-md py-sm bg-surface-container-low border-b border-outline-variant">
                        <div className="flex items-center space-x-sm">
                            <span className="material-symbols-outlined text-primary">receipt_long</span>
                            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Total Fixed</span>
                        </div>
                        <span className="text-headline-md font-headline-md text-primary">${totalFixed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="p-md space-y-sm">
                        <div className="flex justify-between items-baseline">
                            <span className="text-body-sm text-on-surface-variant">
                                Pagado <span className="text-on-surface-variant/60">· {paidExpenses.length} {paidExpenses.length === 1 ? 'item' : 'items'}</span>
                            </span>
                            <span className="text-headline-sm font-headline-sm text-green-500">${paidFixedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-body-sm text-on-surface-variant">
                                Pendiente <span className="text-on-surface-variant/60">· {pendingExpenses.length} {pendingExpenses.length === 1 ? 'item' : 'items'}</span>
                            </span>
                            <span className="text-headline-sm font-headline-sm text-red-500">${remainingFixedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                            <div
                                className="h-2 rounded-full bg-green-500"
                                style={{ width: `${totalFixed > 0 ? (paidFixedAmount / totalFixed) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Calendar Section */}
                {showCalendar && (
                    <section>
                        <div className="flex items-center justify-between mb-md">
                            <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest">Calendar</h3>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => navigateMonth(-1)}
                                    className="p-xs rounded-lg bg-surface-container-highest hover:bg-surface-container-high transition-colors"
                                >
                                    <span className="material-symbols-outlined text-on-surface">chevron_left</span>
                                </button>
                                <span className="text-body-md font-body-md text-on-surface min-w-[140px] text-center">
                                    {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => navigateMonth(1)}
                                    className="p-xs rounded-lg bg-surface-container-highest hover:bg-surface-container-high transition-colors"
                                >
                                    <span className="material-symbols-outlined text-on-surface">chevron_right</span>
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
                    <div className="bg-surface-container-low rounded-xl p-xl text-center">
                        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-md block">folder_open</span>
                        <p className="text-headline-sm font-headline-sm text-on-surface mb-xs">No templates yet</p>
                        <p className="text-body-md text-on-surface-variant mb-lg">Create your first template to start managing fixed expenses.</p>
                        <button
                            type="button"
                            onClick={openNewTemplateForm}
                            className="px-md py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity"
                        >
                            Create Template
                        </button>
                    </div>
                )}

                {templateGroups.map((group) => {
                    const groupTotal = group.expenses.reduce((s, e) => s + e.amount, 0);

                    return (
                        <section key={group.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
                            <div className="flex items-center justify-between px-lg py-md bg-surface-container-low border-b border-outline-variant">
                                <div className="hidden md:flex items-center space-x-sm">
                                    <span className="material-symbols-outlined text-primary">folder</span>
                                    <h3 className="text-headline-sm font-headline-sm text-on-surface">{group.name}</h3>
                                    
                                </div>
                                <div className="flex items-center space-x-md">
                                    <span className="text-body-sm font-data-mono text-on-surface-variant">
                                        ${groupTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => openAddItemForm(group.id)}
                                        className="flex items-center space-x-xs px-sm py-xs bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity text-body-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-lg">
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                                        {group.expenses.map((expense) => {
                                            const isPaid = expense.status === 'paid';
                                            const isFlipped = flippedId === expense.id;

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
                                                            className="bento-card flex flex-col justify-between rounded-xl min-h-[220px]"
                                                            style={{ backfaceVisibility: 'hidden' }}
                                                        >
                                                            <div>
                                                                <div className="flex justify-between items-start mb-sm">
                                                                    <CategoryIcon
                                                                        icon={expense.categoryIcon}
                                                                        color={expense.categoryColor}
                                                                        name={expense.category}
                                                                        size="md"
                                                                    />
                                                                    <div className="flex items-center gap-xs">
                                                                        {isPaid ? (
                                                                            <span className="status-gain px-2 py-0.5 rounded-full text-label-caps">Paid</span>
                                                                        ) : (
                                                                            <span className="status-loss px-2 py-0.5 rounded-full text-label-caps">Pending</span>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); openEditItemForm(expense); }}
                                                                            className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                                                                            title="Edit"
                                                                        >
                                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <h4 className="text-body-md font-body-md mb-xs">{expense.name}</h4>
                                                                <p className="text-data-mono font-data-mono text-lg text-primary">${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                            </div>
                                                            <div className="space-y-xs">
                                                                <p className="text-body-xs text-on-surface-variant">
                                                                    {expense.dueDay ? `Due ${expense.dueDay}${getOrdinalSuffix(expense.dueDay)}` : 'No due date'}
                                                                </p>
                                                                <p className="text-body-xs text-on-surface-variant">{expense.category}</p>
                                                                {!isPaid ? (
                                                                    <button
                                                                        className="w-full py-1.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity text-body-sm"
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(expense.templateId, expense.id); }}
                                                                    >
                                                                        Mark as Paid
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="w-full py-1.5 bg-surface-container-highest text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-colors text-body-sm"
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); deleteItem(expense.templateId, expense.id); }}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div
                                                            className="bento-card flex flex-col rounded-xl min-h-[220px] overflow-hidden"
                                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                                        >
                                                            <div className="flex items-center justify-between mb-sm">
                                                                <h4 className="text-body-md font-body-md">{expense.name}</h4>
                                                                <span className="material-symbols-outlined text-on-surface-variant text-sm">history</span>
                                                            </div>
                                                            <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-xs text-xs">Payment History</p>
                                                            <div className="flex-1 space-y-xs overflow-y-auto">
                                                                {[...expense.history].reverse().map((record, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`flex items-center justify-between px-xs py-0.5 rounded text-body-xs ${record.paid ? 'bg-primary/10' : 'bg-surface-container-high'}`}
                                                                    >
                                                                        <div className="flex items-center space-x-xs">
                                                                            <span className={`material-symbols-outlined text-xs ${record.paid ? 'text-primary' : 'text-on-surface-variant'}`}>
                                                                                {record.paid ? 'check_circle' : 'pending'}
                                                                            </span>
                                                                            <span className="text-on-surface">{record.month}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-body-xs text-on-surface-variant text-center mt-xs">Tap to flip back</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto overflow-y-auto sm:max-h-[400px]">
                                        <table className="w-full min-w-[900px] border-collapse sm:table-fixed">
                                            <thead>
                                                <tr className="text-left border-b border-outline-variant">
                                                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase">Name</th>
                                                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase">Category</th>
                                                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase">Amount</th>
                                                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase">Due</th>
                                                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase">Status</th>
                                                    <th className="px-md py-sm font-label-caps text-label-caps text-on-surface-variant uppercase">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant">
                                                {group.expenses.map((expense) => {
                                                    const isPaid = expense.status === 'paid';

                                                    return (
                                                        <tr key={expense.id} className="hover:bg-surface-container-lowest transition-colors">
                                                            <td className="px-lg py-sm">
                                                                <div className="flex items-center space-x-sm">
                                                                    <CategoryIcon
                                                                        icon={expense.categoryIcon}
                                                                        color={expense.categoryColor}
                                                                        name={expense.category}
                                                                        size="sm"
                                                                    />
                                                                    <span className="text-body-sm">{expense.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-md py-sm text-body-sm text-on-surface-variant">{expense.category}</td>
                                                            <td className="px-md py-sm text-body-sm font-data-mono text-data-mono">${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-md py-sm text-body-sm text-on-surface-variant">
                                                                {expense.dueDay ? `${expense.dueDay}${getOrdinalSuffix(expense.dueDay)}` : '-'}
                                                            </td>
                                                            <td className="px-md py-sm">
                                                                <span className={`px-xs py-0.5 rounded text-body-xs ${getStatusColor(expense.status)}`}>
                                                                    {expense.status === 'paid' ? 'Paid' : expense.status === 'partial' ? 'Partial' : 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-md py-sm">
                                                                <div className="flex items-center space-x-xs">
                                                                    {!isPaid && (
                                                                        <button
                                                                            className="px-sm py-xs bg-primary text-on-primary font-bold rounded hover:opacity-90 transition-opacity text-body-xs"
                                                                            type="button"
                                                                            onClick={() => handleMarkAsPaid(expense.templateId, expense.id)}
                                                                        >
                                                                            Pay
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        className="p-0.5 text-on-surface-variant hover:text-primary transition-colors"
                                                                        type="button"
                                                                        onClick={() => openEditItemForm(expense)}
                                                                        title="Edit"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                                    </button>
                                                                    <button
                                                                        className="p-0.5 text-on-surface-variant hover:text-red-500 transition-colors"
                                                                        type="button"
                                                                        onClick={() => deleteItem(expense.templateId, expense.id)}
                                                                        title="Remove"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })}
            </main>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
                    <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg mx-4 p-lg space-y-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="text-headline-sm font-headline-sm text-on-surface">
                                {formMode === 'template' ? 'New Template + Expense' : editingExpense ? 'Edit Fixed Expense' : 'Add Fixed Expense'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="p-xs rounded-lg hover:bg-surface-container-high transition-colors"
                            >
                                <span className="material-symbols-outlined text-on-surface-variant">close</span>
                            </button>
                        </div>

                        <div className="space-y-md">
                            {formMode === 'template' && (
                                <div>
                                    <label className="block text-body-sm font-body-sm text-on-surface-variant mb-xs">Template Name</label>
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="e.g. Monthly Bills, Office Expenses"
                                        className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            )}

                            {formMode === 'item' && !editingExpense && (
                                <div>
                                    <label className="block text-body-sm font-body-sm text-on-surface-variant mb-xs">Template Group</label>
                                    <select
                                        value={existingTemplateId}
                                        onChange={(e) => setExistingTemplateId(e.target.value)}
                                        className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary"
                                    >
                                        <option value="">Select a template group</option>
                                        {templateGroups.map((g) => (
                                            <option key={g.id} value={g.id}>{g.name} ({g.expenses.length} expenses)</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-body-sm font-body-sm text-on-surface-variant mb-xs">Expense Name</label>
                                <input
                                    type="text"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    placeholder="e.g. Rent, Internet, Insurance"
                                    className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-md">
                                <div>
                                    <label className="block text-body-sm font-body-sm text-on-surface-variant mb-xs">Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={itemAmount}
                                        onChange={(e) => setItemAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-body-sm font-body-sm text-on-surface-variant mb-xs">Due Day (optional)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={itemDay}
                                        onChange={(e) => setItemDay(e.target.value)}
                                        placeholder="1-31"
                                        className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-body-sm font-body-sm text-on-surface-variant mb-xs">Category</label>
                                <select
                                    value={itemCategory}
                                    onChange={(e) => setItemCategory(e.target.value)}
                                    className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-sm pt-sm">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); resetForm(); }}
                                className="px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={formMode === 'template'
                                    ? !groupName.trim() || !itemName.trim() || !itemAmount || !itemCategory
                                    : editingExpense
                                        ? !itemName.trim() || !itemAmount || !itemCategory
                                        : !existingTemplateId || !itemName.trim() || !itemAmount || !itemCategory}
                                className="px-md py-sm bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {formMode === 'template' ? 'Create Template' : editingExpense ? 'Save Changes' : 'Add Expense'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
