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
