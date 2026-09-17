import i18n from '../i18n/config'

function getCurrency() {
  try {
    const preferences = JSON.parse(localStorage.getItem('app_preferences') ?? '{}')
    return typeof preferences.currency === 'string' ? preferences.currency : 'EUR'
  } catch {
    return 'EUR'
  }
}

export function formatCurrecy(amount: number, currency = getCurrency()) {
  return new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr: string) : string {
  const dateObj = new Date(dateStr)

  const options : Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Intl.DateTimeFormat(i18n.language, options).format(dateObj)

}

export function toDateOnly(date: Date | string | null | undefined): string {
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
    const parsed = new Date(date)
    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
    }
  }
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function parseInputDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return new Date()
  return new Date(year, month - 1, day)
}
