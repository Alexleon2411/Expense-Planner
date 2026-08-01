import { useState, useEffect } from 'react'
import { templatesApi, categoriesApi } from '../api'
import { NumericFormat } from 'react-number-format'
import PaymentStatusBadge from './PaymentStatusBadge'

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
    } catch {}
  }

  const handleRenameGroup = async (id: string) => {
    if (!groupNameEdit.trim()) return
    try {
      const updated = await templatesApi.updateTemplate(id, { name: groupNameEdit.trim() })
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
      setEditingGroup(null)
    } catch {}
  }

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta plantilla?')) return
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
    } catch {}
  }

  const handleDeleteItem = async (groupId: string, itemId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este gasto fijo?')) return
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
    } catch {}
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Plantillas de Gastos Fijos</h3>
        <button
          onClick={() => { setShowNewGroup(!showNewGroup); setGroupName('') }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
        >
          {showNewGroup ? 'Cancelar' : '+ Nueva Plantilla'}
        </button>
      </div>

      {showNewGroup && (
        <div className="bg-slate-50 p-4 rounded-lg flex gap-3">
          <input
            className="flex-1 bg-white p-2 border rounded"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nombre del grupo (Ej. Gastos Fijos Mensuales)"
          />
          <button onClick={handleCreateGroup} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">
            Crear
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Sin plantillas. Crea una para gestionar gastos recurrentes.</p>
      ) : (
        groups.map((group) => (
          <div key={group.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between bg-slate-100 p-4 cursor-pointer"
              onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
            >
              <div className="flex-1">
                {editingGroup === group.id ? (
                  <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      className="flex-1 bg-white p-2 border rounded text-sm"
                      value={groupNameEdit}
                      onChange={(e) => setGroupNameEdit(e.target.value)}
                      placeholder="Nombre de la plantilla"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameGroup(group.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingGroup(null)}
                      className="bg-gray-300 px-3 py-1 rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold text-lg">{group.name}</h4>
                    <p className="text-sm text-gray-500">{group.items.length} gastos fijos</p>
                  </>
                )}
              </div>
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setEditingGroup(group.id); setGroupNameEdit(group.name) }}
                  title="Editar plantilla"
                  className="p-2 rounded text-gray-600 hover:bg-gray-200"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  title="Eliminar plantilla"
                  className="p-2 rounded text-red-600 hover:bg-red-100"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>

            {expandedGroup === group.id && (
              <div className="p-4 space-y-3">
                {group.items.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-lg space-y-2">
                    {editingItem === item.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-lg font-black text-blue-600">${item.amount.toLocaleString('es-MX')}</span>
                          <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">{item.category.name}</span>
                        </div>
                        <div className="flex gap-2 items-center flex-wrap">
                          <select
                            className="bg-white p-1 text-sm border rounded"
                            value={editStatus || item.status}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="paid">Pagado</option>
                            <option value="partial">Pago Parcial</option>
                          </select>
                          {(editStatus || item.status) === 'partial' && (
                            <NumericFormat
                              className="bg-white p-1 text-sm border rounded w-24"
                              value={editPartial !== undefined ? editPartial : item.partialAmount || ''}
                              onChange={(e) => setEditPartial(e.target.value)}
                              placeholder="Monto"
                            />
                          )}
                          <input
                            className="bg-white p-1 text-sm border rounded flex-1"
                            value={editComment !== undefined ? editComment : item.comment || ''}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="Comentario..."
                          />
                          <button
                            onClick={() => handleSaveItemStatus(group.id, item)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="bg-gray-300 px-2 py-1 rounded text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{item.name}</p>
                            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">{item.category.name}</span>
                            <PaymentStatusBadge status={item.status as 'pending' | 'paid' | 'partial'} partialAmount={item.partialAmount ?? undefined} expense={item as any} />
                            {item.dayOfMonth && <span className="text-xs text-gray-500">Día {item.dayOfMonth}</span>}
                          </div>
                          <p className="text-lg font-black text-blue-600">${item.amount.toLocaleString('es-MX')}</p>
                          {item.comment && <p className="text-xs text-gray-500 italic">{item.comment}</p>}
                        </div>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => { setEditingItem(item.id); setEditStatus(item.status); setEditComment(item.comment || ''); setEditPartial(item.partialAmount ? String(item.partialAmount) : '') }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Estado / Comentario
                          </button>
                          <button onClick={() => handleDeleteItem(group.id, item.id)} title="Eliminar gasto fijo" className="text-red-600 hover:text-red-800">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add item form */}
                {showItemForm === group.id ? (
                  <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="bg-white p-2 border rounded text-sm"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Nombre"
                      />
                      <NumericFormat
                        className="bg-white p-2 border rounded text-sm"
                        value={itemAmount}
                        onChange={(e) => setItemAmount(e.target.value)}
                        placeholder="Monto"
                      />
                      <select
                        className="bg-white p-2 border rounded text-sm"
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                      >
                        <option value="">Categoría</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <input
                        className="bg-white p-2 border rounded text-sm"
                        type="number"
                        min="1"
                        max="31"
                        value={itemDay}
                        onChange={(e) => setItemDay(e.target.value)}
                        placeholder="Día del mes"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddItem(group.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Agregar</button>
                      <button onClick={resetItemForm} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { resetItemForm(); setShowItemForm(group.id) }}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    + Agregar gasto fijo
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
