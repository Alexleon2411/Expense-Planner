import { useState } from 'react'
import { useCategories } from '../../context/CategoriesContext'
import { categoriesApi } from '../../api'
import IconPicker from '../IconPicker'


const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16']

export default function CategoryManager({ updateCategoryList }: { updateCategoryList: (action: string, categoryId?: string) => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [icon, setIcon] = useState('')
  const { addCategory } = useCategories()

const handleCreate = async () => {
  if (!name.trim()) return
  try {
    const newCategory = await categoriesApi.createCategory({
      name: name.trim(),
      color,
      icon: icon || undefined,
    })
    console.log('Categoria creada:', newCategory)
    updateCategoryList('add', newCategory.id)
    addCategory(newCategory)
  } catch {
    console.error('Error al crear categoria')
  }

}
  

    return (
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
            <IconPicker value={icon} onChange={setIcon} />
            <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">
                Crear
            </button>
            </div>
    )
}