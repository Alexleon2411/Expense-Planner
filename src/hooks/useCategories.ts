import { useState, useEffect } from 'react'
import { categoriesApi } from '../api'
import { categories as hardcodedCategories } from '../data/categories'
import { useAuth } from './useAuth'

interface CategoryItem {
  id: string
  name: string
  icon: string | null
  color?: string | null
  isDefault?: boolean
}

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<CategoryItem[]>(
    user ? [] : hardcodedCategories as CategoryItem[]
  )

  const [loading, setLoading] = useState(false)

  const refreshCategories = async () => {
    if (!user) {
      setCategories(hardcodedCategories)
      return
    }

    try {
      setLoading(true)

      const apiCategories = await categoriesApi.listCategories()

      if (apiCategories.length > 0) {
        setCategories(apiCategories as CategoryItem[])
      } else {
        setCategories(hardcodedCategories as CategoryItem[])
      }
    } catch {
      setCategories(hardcodedCategories as CategoryItem[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCategories()
  }, [user])

  return {
    categories,
    loading,
    refreshCategories
  }
}