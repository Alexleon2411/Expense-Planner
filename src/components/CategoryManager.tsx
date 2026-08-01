import { useState, useEffect } from 'react'
import { categoriesApi } from '../api'
import IconPicker from './IconPicker'
import CategoryIcon from './CategoryIcon'

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  isDefault: boolean
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16']

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [icon, setIcon] = useState('')

  useEffect(() => {
    categoriesApi.listCategories().then(setCategories).catch(() => {})
  }, [])

  const resetForm = () => {
    setName('')
    setColor('#3b82f6')
    setIcon('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      if (editingId) {
        const updated = await categoriesApi.updateCategory(editingId, {
          name: name.trim(),
          color,
          icon: icon || undefined,
        })
        setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)))
      } else {
        const created = await categoriesApi.createCategory({ name: name.trim(), color, icon: icon || undefined })
        setCategories((prev) => [...prev, created])
      }
      resetForm()
    } catch {}
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setColor(cat.color || '#3b82f6')
    setIcon(cat.icon || '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return
    try {
      await categoriesApi.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch {}
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Categorías</h3>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : '+ Nueva'}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
          <div>
            <label className="text-sm">{editingId ? 'Editar categoría' : 'Nombre'}</label>
            <input
              className="w-full bg-white p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Transporte"
            />
          </div>
          <div>
            <label className="text-sm">Color</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-800' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <IconPicker value={icon} onChange={setIcon} />
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">
              {editingId ? 'Guardar' : 'Crear'}
            </button>
            <button onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded-lg font-bold">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Sin categorías. Crea una para organizar tus gastos.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-50 rounded-lg p-4 flex flex-col items-center gap-2 border border-transparent hover:border-gray-300"
            >
              <CategoryIcon icon={cat.icon} color={cat.color} name={cat.name} size="lg" />
              <span className={`text-sm text-center ${cat.isDefault ? 'font-semibold' : ''}`}>{cat.name}</span>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => startEdit(cat)}
                  title="Editar categoría"
                  className="p-1.5 rounded text-gray-600 hover:bg-gray-200"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    title="Eliminar categoría"
                    className="p-1.5 rounded text-red-600 hover:bg-red-100"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
