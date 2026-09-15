import { useCallback, useEffect, useState } from 'react'
import { templatesApi } from '../api'
import { useAuth } from './useAuth'
import i18n from '../i18n/config'
import { formatCurrecy } from '../helpers'

export type PaymentReminder = {
  id: string
  name: string
  amount: number
  dueDay: number
  status: 'pending' | 'partial'
}

function getTodayKey() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function getReminderStorageKey(userId: string) {
  return `fixedExpenses_reminders_${userId}_${getTodayKey()}`
}

export function usePaymentReminders() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<PaymentReminder[]>([])
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    'Notification' in window ? Notification.permission : 'unsupported',
  )

  const checkReminders = useCallback(async (notify = true) => {
    if (!user) return

    try {
      const today = new Date().getDate()
      const templates = await templatesApi.listTemplates()
      const dueToday = templates.flatMap((template) =>
        template.items
          .filter((item) => item.dayOfMonth === today && (item.status === 'pending' || item.status === 'partial'))
          .map((item) => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            dueDay: item.dayOfMonth as number,
            status: item.status as PaymentReminder['status'],
          })),
      )

      setReminders(dueToday)

      if (!notify || permission !== 'granted' || dueToday.length === 0) return
      const storageKey = getReminderStorageKey(user.id)
      if (localStorage.getItem(storageKey)) return

      const amount = dueToday.reduce((total, reminder) => total + reminder.amount, 0)
       new Notification(i18n.t('expense.paymentReminder'), {
        body: dueToday.length === 1
          ? `${i18n.t('expense.dueToday')}: ${dueToday[0].name} · ${formatCurrecy(amount)}`
          : `${i18n.t('expense.dueToday')}: ${dueToday.length} · ${formatCurrecy(amount)}`,
        icon: '/icon-192x192.png',
        tag: storageKey,
      })
      localStorage.setItem(storageKey, 'sent')
    } catch (error) {
      console.error('Error loading payment reminders:', error)
    }
  }, [permission, user])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') await checkReminders(false)
  }, [checkReminders])

  useEffect(() => {
    checkReminders()
    const interval = window.setInterval(() => checkReminders(), 60 * 60 * 1000)
    return () => window.clearInterval(interval)
  }, [checkReminders])

  return { reminders, permission, requestPermission }
}
