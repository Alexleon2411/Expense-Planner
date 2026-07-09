export type User = {
  id: string
  name: string
  email: string
  salary?: number
  city?: string
  country?: string
  street?: string
  houseNumber?: string
  language?: string
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
  language?: string
  phoneNumber?: string
  password?: string
}