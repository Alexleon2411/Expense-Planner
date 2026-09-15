export const supportedLanguages = ['en', 'es', 'fr', 'it', 'nl'] as const

export type AppLanguage = (typeof supportedLanguages)[number]

export function normalizeLanguage(value: string | null | undefined): AppLanguage {
  const legacyValues: Record<string, AppLanguage> = {
    'spanish (español)': 'es',
    'english (uk)': 'en',
    'english (us)': 'en',
    'french (français)': 'fr',
    deutsch: 'en',
  }
  const normalized = value?.trim().toLowerCase()
  if (normalized && legacyValues[normalized]) return legacyValues[normalized]
  const language = normalized?.split('-')[0]
  return supportedLanguages.includes(language as AppLanguage)
    ? language as AppLanguage
    : 'en'
}
