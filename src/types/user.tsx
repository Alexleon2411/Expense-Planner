import type { AppLanguage } from '../i18n/types'

export type User = {
  id: string
  name: string
  email: string
  salary?: number
  city?: string
  country?: string
  street?: string
  houseNumber?: string
  language?: AppLanguage
  phoneNumber?: string
}

export type UpdateProfileData = {
  id?: string
  name?: string
  email?: string
  salary?: number 
  city?: string
  country?: string
  street?: string
  houseNumber?: string
  language?: AppLanguage
  phoneNumber?: string
  password?: string
}
