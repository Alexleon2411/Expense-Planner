import { useState, useEffect, useCallback } from 'react'
import { templatesApi, categoriesApi, expensesApi } from '../api'
import type { ExpenseResponse } from '../api/expenses'
import type { TemplateGroup } from '../api/templates'
import { useAuth } from './useAuth'
import { FixedExpense, PaymentRecord } from '../types'

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

async function renewPaidItemsIfNeeded(templates: { id: string; items: { id: string; status: string }[] }[]): Promise<boolean> {
  const currentMonth = getCurrentMonthKey()
  const lastRenewal = getLastRenewalMonth()

  if (lastRenewal === currentMonth) return false

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
  return paidItems.length > 0
}

function matchesTemplateItem(expense: ExpenseResponse, templateId: string, itemName: string, categoryName: string, amount: number) {
  if (expense.templateId === templateId && expense.name === itemName) return true
  if (!expense.templateId && expense.name === itemName && expense.category === categoryName && expense.amount === amount) return true
  return false
}

function buildHistory(paymentExpenses: ExpenseResponse[], templateId: string, item: { id: string; name: string; amount: number; category: { name: string } }, currentMonth: string): PaymentRecord[] {
  const historicalPayments = paymentExpenses
    .filter((expense) => matchesTemplateItem(expense, templateId, item.name, item.category.name, item.amount))
    .reduce<PaymentRecord[]>((history, expense) => {
      const month = expense.date.slice(0, 7)
      if (!month || month === currentMonth || history.some((record) => record.month === month)) return history
      history.push({
        month,
        paid: expense.status === 'paid' || expense.status === 'partial',
        paidDate: expense.status === 'paid' || expense.status === 'partial' ? expense.date : undefined,
        templateItemId: item.id,
      })
      return history
    }, [])
    .sort((a, b) => a.month.localeCompare(b.month))

  return historicalPayments
}

function mapTemplatesToFixedExpenses(
  templates: TemplateGroup[],
  categories: { id: string; icon: string | null; color: string | null }[],
  paymentExpenses: ExpenseResponse[],
): FixedExpense[] {
  const categoryMap = new Map<string, { icon: string | null; color: string | null }>()
  categories.forEach((c) => categoryMap.set(c.id, { icon: c.icon, color: c.color }))
  const currentMonth = getCurrentMonthKey()

  return templates.flatMap((group) =>
    group.items.map((item) => {
      const isPaid = item.status === 'paid'
      const isPartial = item.status === 'partial'
      const catInfo = categoryMap.get(item.categoryId)

      return {
        id: item.id,
        templateId: group.id,
        templateGroupName: group.name,
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
          ...buildHistory(paymentExpenses, group.id, item, currentMonth),
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
  )
}

function markExpenseAsPaid(expense: FixedExpense): FixedExpense {
  const currentMonth = getCurrentMonthKey()
  const hasCurrentMonth = expense.history.some((record) => record.month === currentMonth)

  return {
    ...expense,
    status: 'paid',
    lastPaidDate: currentMonth,
    partialAmount: undefined,
    history: hasCurrentMonth
      ? expense.history.map((record) =>
          record.month === currentMonth
            ? { ...record, paid: true, paidDate: currentMonth }
            : record
        )
      : [
          ...expense.history,
          { month: currentMonth, paid: true, paidDate: currentMonth, templateItemId: expense.id },
        ],
  }
}

export function useFixedExpenses() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

      const renewed = await renewPaidItemsIfNeeded(templates)

      const [sourceTemplates, paymentExpensesResult] = await Promise.all([
        renewed ? templatesApi.listTemplates() : Promise.resolve(templates),
        expensesApi.listExpenses({ page: 1, limit: 500 }),
      ])

      setFixedExpenses(mapTemplatesToFixedExpenses(sourceTemplates, categories, paymentExpensesResult.expenses))
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
    } catch (err) {
      setError('Error al marcar como pagado')
      console.error('Error marking as paid:', err)
    } finally {
      setLoading(false)
    }
  }, [user, loadFixedExpenses])

  const markItemAsPaid = useCallback(async (templateId: string, itemId: string) => {
    if (!user) return
    let snapshot: FixedExpense[] = []
    setFixedExpenses((prev) => {
      snapshot = prev
      return prev.map((expense) => (expense.id === itemId ? markExpenseAsPaid(expense) : expense))
    })
    try {
      setError(null)
      await templatesApi.updateItem(templateId, itemId, { status: 'paid' })
    } catch (err) {
      setFixedExpenses(snapshot)
      setError('Error al marcar como pagado')
      console.error('Error marking item as paid:', err)
    }
  }, [user])

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

  const updateItem = useCallback(async (templateId: string, itemId: string, data: { name?: string; amount?: number; categoryId?: string; dayOfMonth?: number }) => {
    if (!user) return
    try {
      setLoading(true)
      await templatesApi.updateItem(templateId, itemId, data)
      await loadFixedExpenses()
    } catch (err) {
      setError('Error al actualizar el gasto fijo')
      console.error('Error updating item:', err)
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
    updateItem,
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
