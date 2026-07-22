import { useState, useEffect, useCallback } from 'react'
import { templatesApi, categoriesApi } from '../api'
import { useBudget } from './useBudget'
import { useAuth } from './useAuth'
import { FixedExpense } from '../types'

const CATEGORY_ICONS: Record<string, string> = {
  '1': 'savings',
  '2': 'restaurant',
  '3': 'home',
  '4': 'receipt_long',
  '5': 'sports_esports',
  '6': 'favorite',
  '7': 'subscriptions',
}

function getIconForCategory(categoryId: string, categoryName: string): string {
  if (CATEGORY_ICONS[categoryId]) return CATEGORY_ICONS[categoryId]
  const name = categoryName.toLowerCase()
  if (name.includes('rent') || name.includes('alquiler')) return 'home_work'
  if (name.includes('internet') || name.includes('wifi')) return 'wifi'
  if (name.includes('salary') || name.includes('salario')) return 'group'
  if (name.includes('insurance') || name.includes('seguro')) return 'health_and_safety'
  if (name.includes('loan') || name.includes('prestamo')) return 'account_balance'
  return 'receipt_long'
}

// cada mes los fixed expenses que estén en estado "paid" o "partial" deben renovarse a "pending" 
// para el nuevo mes. Esto se hace una vez al mes, y se guarda la fecha de la última renovación en 
// localStorage para no repetir la operación.

// en el futuro debo cambiar esta logica para 
function getLastRenewalMonth(): string | null {
  return localStorage.getItem('fixedExpenses_lastRenewal')
}

function setLastRenewalMonth(month: string) {
  localStorage.setItem('fixedExpenses_lastRenewal', month)
}

function getCurrentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

async function renewPaidItemsIfNeeded(templates: { id: string; items: { id: string; status: string }[] }[]) {
  const currentMonth = getCurrentMonthKey()
  const lastRenewal = getLastRenewalMonth()

  if (lastRenewal === currentMonth) return

  const paidItems = templates.flatMap((group) =>
    group.items
      .filter((item) => item.status === 'paid' || item.status === 'partial')
      .map((item) => ({ templateId: group.id, itemId: item.id }))
  )

  if (paidItems.length > 0) {
    await Promise.all(
      paidItems.map(({ templateId, itemId }) =>
        templatesApi.updateItem(templateId, itemId, { status: 'pending', partialAmount: null })
      )
    )
  }

  setLastRenewalMonth(currentMonth)
}

export function useFixedExpenses() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { dispatch } = useBudget()
  const { user } = useAuth()

  const loadFixedExpenses = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const [templates, categories] = await Promise.all([
        templatesApi.listTemplates(),
        categoriesApi.listCategories(),
      ])

      const categoryMap = new Map<string, { icon: string | null; color: string | null }>()
      categories.forEach((c) => categoryMap.set(c.id, { icon: c.icon, color: c.color }))

      await renewPaidItemsIfNeeded(templates)

      const refreshedTemplates = await templatesApi.listTemplates()
      const allItems = refreshedTemplates.flatMap((group) =>
        group.items.map((item) => ({
          id: item.id,
          templateId: group.id,
          templateGroupName: group.name,
          ...item,
        }))
      )

      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const fixedExpenses: FixedExpense[] = allItems.map((item) => {
        const isPaid = item.status === 'paid'
        const isPartial = item.status === 'partial'
        const catInfo = categoryMap.get(item.categoryId)

        return {
          id: item.id,
          templateId: item.templateId,
          name: item.name,
          amount: item.amount,
          category: item.category.name,
          categoryId: item.categoryId,
          categoryIcon: catInfo?.icon ?? null,
          categoryColor: catInfo?.color ?? null,
          dueDay: item.dayOfMonth,
          icon: getIconForCategory(item.categoryId, item.category.name),
          status: isPaid ? 'paid' : isPartial ? 'partial' : 'pending',
          lastPaidDate: isPaid ? currentMonth : undefined,
          history: [
            {
              month: currentMonth,
              paid: isPaid,
              paidDate: isPaid ? currentMonth : undefined,
              templateItemId: item.id,
            },
          ],
          comment: item.comment || undefined,
          partialAmount: item.partialAmount || undefined,
        }
      })

      setFixedExpenses(fixedExpenses)
    } catch (err) {
      setError('Error al cargar los gastos fijos')
      console.error('Error loading fixed expenses:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadFixedExpenses()
  }, [loadFixedExpenses])

  const markAsPaid = useCallback(async (templateId: string) => {
    if (!user) return
    try {
      setLoading(true)
      await templatesApi.applyTemplate(templateId)
      await loadFixedExpenses()
      dispatch({ type: 'get-expenses', payload: { expenses: [] } })
    } catch (err) {
      setError('Error al marcar como pagado')
      console.error('Error marking as paid:', err)
    } finally {
      setLoading(false)
    }
  }, [user, loadFixedExpenses, dispatch])

  const markItemAsPaid = useCallback(async (templateId: string, itemId: string) => {
    if (!user) return
    try {
      setLoading(true)
      await templatesApi.updateItem(templateId, itemId, { status: 'paid' })
      await loadFixedExpenses()
    } catch (err) {
      setError('Error al marcar como pagado')
      console.error('Error marking item as paid:', err)
    } finally {
      setLoading(false)
    }
  }, [user, loadFixedExpenses])

  const getExpensesForDay = useCallback((day: number): FixedExpense[] => {
    return fixedExpenses.filter((expense) => expense.dueDay === day)
  }, [fixedExpenses])

  const getPendingExpenses = useCallback((): FixedExpense[] => {
    return fixedExpenses.filter((expense) => expense.status === 'pending')
  }, [fixedExpenses])

  const getPaidExpenses = useCallback((): FixedExpense[] => {
    return fixedExpenses.filter((expense) => expense.status === 'paid')
  }, [fixedExpenses])

  const getTotalFixedExpenses = useCallback((): number => {
    return fixedExpenses.reduce((total, expense) => total + expense.amount, 0)
  }, [fixedExpenses])

  const createTemplate = useCallback(async (name: string) => {
    if (!user) return
    try {
      setLoading(true)
      const created = await templatesApi.createTemplate({ name })
      await loadFixedExpenses()
      return created
    } catch (err) {
      setError('Error al crear la plantilla')
      console.error('Error creating template:', err)
    } finally {
      setLoading(false)
    }
  }, [user, loadFixedExpenses])

  const createItem = useCallback(async (templateId: string, data: { name: string; amount: number; categoryId: string; dayOfMonth?: number }) => {
    if (!user) return
    try {
      setLoading(true)
      const created = await templatesApi.addItem(templateId, data)
      await loadFixedExpenses()
      return created
    } catch (err) {
      setError('Error al crear el gasto fijo')
      console.error('Error creating item:', err)
    } finally {
      setLoading(false)
    }
  }, [user, loadFixedExpenses])

  const deleteItem = useCallback(async (templateId: string, itemId: string) => {
    if (!user) return
    try {
      setLoading(true)
      await templatesApi.deleteItem(templateId, itemId)
      await loadFixedExpenses()
    } catch (err) {
      setError('Error al eliminar el gasto fijo')
      console.error('Error deleting item:', err)
    } finally {
      setLoading(false)
    }
  }, [user, loadFixedExpenses])

  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!user) return
    try {
      setLoading(true)
      await templatesApi.deleteTemplate(templateId)
      await loadFixedExpenses()
    } catch (err) {
      setError('Error al eliminar la plantilla')
      console.error('Error deleting template:', err)
    } finally {
      setLoading(false)
    }
  }, [user, loadFixedExpenses])

  return {
    fixedExpenses,
    loading,
    error,
    loadFixedExpenses,
    createTemplate,
    createItem,
    deleteItem,
    deleteTemplate,
    markAsPaid,
    markItemAsPaid,
    getExpensesForDay,
    getPendingExpenses,
    getPaidExpenses,
    getTotalFixedExpenses,
  }
}
