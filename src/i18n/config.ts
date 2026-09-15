import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { normalizeLanguage } from './types'
import { resources } from './resources'

const cachedUser = localStorage.getItem('auth_user')
let cachedLanguage: string | undefined

try {
  cachedLanguage = cachedUser ? JSON.parse(cachedUser).language : undefined
} catch {
  cachedLanguage = undefined
}

const storedPreferences = localStorage.getItem('app_preferences')
let storedLanguage: string | undefined

try {
  storedLanguage = storedPreferences ? JSON.parse(storedPreferences).language : undefined
} catch {
  storedLanguage = undefined
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: normalizeLanguage(cachedLanguage ?? storedLanguage ?? navigator.language),
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'it', 'nl'],
    interpolation: { escapeValue: false },
  })

export default i18n
