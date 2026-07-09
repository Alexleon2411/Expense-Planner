import { useState, useEffect } from 'react'
import { categoriesApi } from '../api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'


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
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')

  useEffect(() => {
    categoriesApi.listCategories().then(setCategories).catch(() => {})
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      const created = await categoriesApi.createCategory({ name: name.trim(), color })
      setCategories((prev) => [...prev, created])
      setName('')
      setShowForm(false)
    } catch {}
  }

  const handleDelete = async (id: string) => {
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
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : '+ Nueva'}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
          <div>
            <label className="text-sm">Nombre</label>
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
          <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">
            Crear
          </button>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || '#999' }} />
              <span className={cat.isDefault ? 'font-semibold' : ''}>{cat.name}</span>
              {cat.isDefault && <span className="text-xs text-gray-400">(defecto)</span>}
            </div>
            {!cat.isDefault && (
              <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
