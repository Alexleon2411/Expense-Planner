import { useState, useEffect } from 'react'
import { categoriesApi } from '../api'
import IconPicker from './IconPicker'
import CategoryIcon from './CategoryIcon'
import { useTranslation } from 'react-i18next'

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  monthlyLimit: number | null
  isDefault: boolean
}

export default function CategoryManager() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#34506D')
  const [icon, setIcon] = useState('')
  const [monthlyLimit, setMonthlyLimit] = useState('')

  useEffect(() => {
    categoriesApi.listCategories().then(setCategories).catch(() => {})
  }, [])

  const resetForm = () => {
    setName('')
    setColor('#34506D')
    setIcon('')
    setEditingId(null)
    setMonthlyLimit('')
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    const parsedLimit = monthlyLimit.trim() === '' ? null : Number(monthlyLimit)
    try {
      if (editingId) {
        const updated = await categoriesApi.updateCategory(editingId, {
          name: name.trim(),
          color,
          icon: icon || undefined,
          monthlyLimit: parsedLimit,
        })
        setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)))
      } else {
        const created = await categoriesApi.createCategory({ name: name.trim(), color, icon: icon || undefined, monthlyLimit: parsedLimit })
        setCategories((prev) => [...prev, created])
      }
      resetForm()
    } catch (error) {
      console.error('Error saving category', error)
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setColor(cat.color || '#34506D')
    setIcon(cat.icon || '')
    setMonthlyLimit(cat.monthlyLimit != null ? String(cat.monthlyLimit) : '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('categories.confirmDelete'))) return
    try {
      await categoriesApi.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      console.error('Error deleting category', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{t('categories.title')}</h3>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="min-h-11 rounded-md bg-[#3B82F6] px-4 text-sm font-medium text-white hover:bg-[#2563EB]"
        >
          {showForm ? t('common.cancel') : t('categories.new')}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 rounded-lg border border-white/[0.08] bg-[#1B202B] p-4">
          <div>
            <label className="text-sm">{editingId ? t('categories.edit') : t('categories.name')}</label>
            <input
              className="mt-2 h-11 w-full rounded-md border border-white/[0.08] bg-[#14171F] px-3 text-sm text-[#F9FAFB] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('categories.placeholder')}
            />
          </div>
          <div>
            <label className="text-sm">{t('categories.color')}</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {/* {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-outline' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))} */}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-[200px] h-10 p-0  cursor-pointer rounded-lg"
              />
            </div>
          </div>
          <IconPicker value={icon} onChange={setIcon} />
          <div>
            <label className="text-sm">{t('categories.monthlyLimit')}</label>
            <input
              type="number"
              min={0}
              className="mt-2 h-11 w-full rounded-md border border-white/[0.08] bg-[#14171F] px-3 font-mono text-sm tabular-nums text-[#F9FAFB] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              placeholder={t('categories.monthlyLimitPlaceholder')}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="min-h-11 rounded-md bg-[#3B82F6] px-4 text-sm font-medium text-white hover:bg-[#2563EB]">
              {editingId ? t('common.save') : t('categories.create')}
            </button>
            <button onClick={resetForm} className="min-h-11 rounded-md border border-white/[0.08] px-4 text-sm font-medium text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F9FAFB]">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-on-surface-variant text-center py-4">{t('categories.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col items-center gap-2 rounded-lg border border-white/[0.08] bg-[#1B202B] p-4 transition-colors hover:bg-white/[0.03]"
            >
              <CategoryIcon icon={cat.icon} color={cat.color} name={cat.name} size="lg" />
              <span className={`text-sm text-center ${cat.isDefault ? 'font-semibold' : ''}`}>{cat.name}</span>
              {cat.monthlyLimit != null && (
                <span className="font-mono text-xs tabular-nums text-[#9CA3AF]">{t('categories.monthlyLimit')}: ${cat.monthlyLimit}</span>
              )}
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => startEdit(cat)}
                  title={t('categories.editAction')}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-white/[0.06] hover:text-[#F9FAFB]"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    title={t('categories.deleteAction')}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[#F87171] hover:bg-[#F87171]/[0.08]"
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
