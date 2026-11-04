import { useState, useEffect } from 'react'
import { templatesApi, categoriesApi } from '../api'
import { NumericFormat } from 'react-number-format'
import PaymentStatusBadge from './PaymentStatusBadge'
import { useTranslation } from 'react-i18next'
import { formatCurrecy } from '../helpers'

interface TemplateItem {
  id: string
  name: string
  amount: number
  categoryId: string
  dayOfMonth: number | null
  comment: string | null
  status: string
  partialAmount: number | null
  category: { id: string; name: string; color: string | null }
}

interface TemplateGroup {
  id: string
  name: string
  items: TemplateItem[]
  createdAt: string
}

export default function ExpenseTemplates() {
  const { t } = useTranslation()
  const [groups, setGroups] = useState<TemplateGroup[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string; color: string | null }[]>([])
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

  // New item form state
  const [showItemForm, setShowItemForm] = useState<string | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemAmount, setItemAmount] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [itemDay, setItemDay] = useState('')

  // Edit group state
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [groupNameEdit, setGroupNameEdit] = useState('')

  // Edit item state
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editComment, setEditComment] = useState('')
  const [editPartial, setEditPartial] = useState('')

  useEffect(() => {
    Promise.all([templatesApi.listTemplates(), categoriesApi.listCategories()])
      .then(([t, c]) => {
        setGroups(t)
        setCategories(c)
      })
      .catch(() => {})
  }, [])

  const resetItemForm = () => {
    setItemName('')
    setItemAmount('')
    setItemCategory('')
    setItemDay('')
    setShowItemForm(null)
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return
    try {
      const created = await templatesApi.createTemplate({ name: groupName.trim() })
      setGroups((prev) => [...prev, created])
      setGroupName('')
      setShowNewGroup(false)
    } catch (error) {
      console.error('Error creating template group', error)
    }
  }

  const handleRenameGroup = async (id: string) => {
    if (!groupNameEdit.trim()) return
    try {
      const updated = await templatesApi.updateTemplate(id, { name: groupNameEdit.trim() })
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
      setEditingGroup(null)
    } catch (error) {
      console.error('Error renaming template group', error)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm(t('templates.deleteConfirm'))) return
    await templatesApi.deleteTemplate(id)
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }

  const handleAddItem = async (groupId: string) => {
    if (!itemName || !itemAmount || !itemCategory) return
    const amount = parseFloat(itemAmount)
    if (isNaN(amount) || amount <= 0) return
    try {
      const created = await templatesApi.addItem(groupId, {
        name: itemName,
        amount,
        categoryId: itemCategory,
        dayOfMonth: itemDay ? parseInt(itemDay) : undefined,
      })
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, created] } : g)),
      )
      resetItemForm()
    } catch (error) {
      console.error('Error adding template item', error)
    }
  }

  const handleDeleteItem = async (groupId: string, itemId: string) => {
    if (!window.confirm(t('templates.deleteItemConfirm'))) return
    await templatesApi.deleteItem(groupId, itemId)
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g)),
    )
  }

  const handleSaveItemStatus = async (groupId: string, item: TemplateItem) => {
    try {
      const updated = await templatesApi.updateItem(groupId, item.id, {
        status: editStatus || item.status,
        comment: editComment !== undefined ? editComment : item.comment,
        partialAmount: editStatus === 'partial' ? parseFloat(editPartial) || (item.partialAmount) : null,
      })
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, items: g.items.map((i) => (i.id === item.id ? updated : i)) } : g,
        ),
      )
      setEditingItem(null)
    } catch (error) {
      console.error('Error updating template item', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#F9FAFB]">{t('templates.title')}</h3>
        <button
          onClick={() => { setShowNewGroup(!showNewGroup); setGroupName('') }}
          className="min-h-11 shrink-0 rounded-md bg-[#3B82F6] px-4 text-sm font-medium text-white hover:bg-[#2563EB]"
        >
          {showNewGroup ? t('templates.cancel') : t('templates.new')}
        </button>
      </div>

      {showNewGroup && (
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-white/[0.08] bg-[#1B202B] p-3 sm:grid-cols-[1fr_auto]">
          <input
            className="h-11 min-w-0 rounded-md border border-white/[0.08] bg-[#14171F] px-3 text-sm text-[#F9FAFB] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t('templates.groupPlaceholder')}
          />
          <button onClick={handleCreateGroup} className="min-h-11 rounded-md bg-[#3B82F6] px-4 text-sm font-medium text-white hover:bg-[#2563EB]">
            {t('templates.create')}
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <p className="text-on-surface-variant text-center py-4">{t('templates.empty')}</p>
      ) : (
        groups.map((group) => (
          <section key={group.id} className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#14171F]">
            <div
              className="flex cursor-pointer items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 transition-colors hover:bg-white/[0.03]"
              onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
            >
              <div className="flex-1">
                {editingGroup === group.id ? (
                  <div className="flex min-w-0 flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      className="h-11 min-w-0 flex-1 rounded-md border border-white/[0.08] bg-[#1B202B] px-3 text-sm text-[#F9FAFB]"
                      value={groupNameEdit}
                      onChange={(e) => setGroupNameEdit(e.target.value)}
                       placeholder={t('templates.groupName')}
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameGroup(group.id)}
                      className="min-h-11 rounded-md bg-[#3B82F6] px-3 text-sm font-medium text-white hover:bg-[#2563EB]"
                    >
                       {t('templates.save')}
                    </button>
                    <button
                      onClick={() => setEditingGroup(null)}
                      className="min-h-11 rounded-md border border-white/[0.08] px-3 text-sm text-[#9CA3AF] hover:bg-white/[0.04]"
                    >
                       {t('templates.cancel')}
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="truncate text-sm font-medium text-[#F9FAFB]">{group.name}</h4>
                     <p className="text-sm text-on-surface-variant">{t('templates.fixedCount', { count: group.items.length })}</p>
                  </>
                )}
              </div>
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setEditingGroup(group.id); setGroupNameEdit(group.name) }}
                   title={t('templates.edit')}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-white/[0.06] hover:text-[#F9FAFB]"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                   title={t('templates.delete')}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#F87171] hover:bg-[#F87171]/[0.08]"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>

            {expandedGroup === group.id && (
              <div className="space-y-3 p-3 sm:p-4">
                {group.items.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-lg border border-white/[0.08] bg-[#1B202B] p-3">
                    {editingItem === item.id ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{item.name}</span>
                           <span className="font-mono text-sm font-semibold tabular-nums text-[#F9FAFB]">{formatCurrecy(item.amount)}</span>
                          <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded">{item.category.name}</span>
                        </div>
                        <div className="flex gap-2 items-center flex-wrap">
                          <select
                            className="h-11 rounded-md border border-white/[0.08] bg-[#14171F] px-3 text-sm text-[#F9FAFB]"
                            value={editStatus || item.status}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                             <option value="pending">{t('templates.pending')}</option>
                             <option value="paid">{t('templates.paid')}</option>
                             <option value="partial">{t('templates.partial')}</option>
                          </select>
                          {(editStatus || item.status) === 'partial' && (
                            <NumericFormat
                              className="h-11 w-28 rounded-md border border-white/[0.08] bg-[#14171F] px-3 font-mono text-sm tabular-nums text-[#F9FAFB]"
                              value={editPartial !== undefined ? editPartial : item.partialAmount || ''}
                              onChange={(e) => setEditPartial(e.target.value)}
                               placeholder={t('templates.amount')}
                            />
                          )}
                          <input
                            className="h-11 min-w-[180px] flex-1 rounded-md border border-white/[0.08] bg-[#14171F] px-3 text-sm text-[#F9FAFB]"
                            value={editComment !== undefined ? editComment : item.comment || ''}
                            onChange={(e) => setEditComment(e.target.value)}
                             placeholder={t('templates.comment')}
                          />
                          <button
                            onClick={() => handleSaveItemStatus(group.id, item)}
                            className="min-h-11 rounded-md bg-[#3B82F6] px-3 text-xs font-medium text-white"
                          >
                             {t('templates.save')}
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="min-h-11 rounded-md border border-white/[0.08] px-3 text-xs text-[#9CA3AF]"
                          >
                             {t('templates.cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-[#F9FAFB]">{item.name}</p>
                            <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded">{item.category.name}</span>
                            <PaymentStatusBadge status={item.status as 'pending' | 'paid' | 'partial'} partialAmount={item.partialAmount ?? undefined} />
                           {item.dayOfMonth && <span className="text-xs text-on-surface-variant">{t('fixedExpenses.due', { day: item.dayOfMonth })}</span>}
                          </div>
                           <p className="mt-2 font-mono text-sm font-semibold tabular-nums text-[#F9FAFB]">{formatCurrecy(item.amount)}</p>
                          {item.comment && <p className="text-xs text-on-surface-variant italic">{item.comment}</p>}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => { setEditingItem(item.id); setEditStatus(item.status); setEditComment(item.comment || ''); setEditPartial(item.partialAmount ? String(item.partialAmount) : '') }}
                            className="min-h-11 rounded-md px-2 text-xs font-medium text-[#60A5FA] hover:bg-white/[0.04]"
                          >
                             {t('templates.statusComment')}
                          </button>
                           <button onClick={() => handleDeleteItem(group.id, item.id)} title={t('templates.deleteExpense')} className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#F87171] hover:bg-[#F87171]/[0.08]">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add item form */}
                {showItemForm === group.id ? (
                  <div className="space-y-3 rounded-lg border border-white/[0.08] bg-[#1B202B] p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        className="h-11 rounded-md border border-white/[0.08] bg-[#14171F] px-3 text-sm text-[#F9FAFB]"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                         placeholder={t('templates.addName')}
                      />
                      <NumericFormat
                        className="h-11 rounded-md border border-white/[0.08] bg-[#14171F] px-3 font-mono text-sm tabular-nums text-[#F9FAFB]"
                        value={itemAmount}
                        onChange={(e) => setItemAmount(e.target.value)}
                         placeholder={t('templates.addAmount')}
                      />
                      <select
                        className="h-11 rounded-md border border-white/[0.08] bg-[#14171F] px-3 text-sm text-[#F9FAFB]"
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                      >
                         <option value="">{t('templates.addCategory')}</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <input
                        className="h-11 rounded-md border border-white/[0.08] bg-[#14171F] px-3 font-mono text-sm tabular-nums text-[#F9FAFB]"
                        type="number"
                        min="1"
                        max="31"
                        value={itemDay}
                        onChange={(e) => setItemDay(e.target.value)}
                         placeholder={t('templates.addDay')}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddItem(group.id)} className="min-h-11 rounded-md bg-[#3B82F6] px-3 text-sm font-medium text-white">{t('templates.add')}</button>
                      <button onClick={resetItemForm} className="min-h-11 rounded-md border border-white/[0.08] px-3 text-sm text-[#9CA3AF]">{t('templates.cancel')}</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { resetItemForm(); setShowItemForm(group.id) }}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                     {t('templates.addFixed')}
                  </button>
                )}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  )
}
