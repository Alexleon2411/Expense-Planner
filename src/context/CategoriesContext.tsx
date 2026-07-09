import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

import { categoriesApi } from '../api'
import { categories as hardcodedCategories } from '../data/categories'
import { useAuth } from '../hooks/useAuth'

interface CategoryItem {
  id: string
  name: string
  icon: string | null
  color?: string | null
  isDefault?: boolean
}

interface CategoriesContextType {
  categories: CategoryItem[]
  loading: boolean
  refreshCategories: () => Promise<void>
  addCategory: (category: CategoryItem) => void
}

const CategoriesContext = createContext<CategoriesContextType | null>(null)

export function CategoriesProvider({
  children,
}: {
  children: ReactNode
}) {
  const { user } = useAuth()

  const [categories, setCategories] = useState<CategoryItem[]>(
    user ? [] : hardcodedCategories
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
        setCategories(apiCategories)
      } else {
        setCategories(hardcodedCategories)
      }
    } catch {
      setCategories(hardcodedCategories)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = (category: CategoryItem) => {
    setCategories((prev) => [...prev, category])
  }

  useEffect(() => {
    refreshCategories()
  }, [user])

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        refreshCategories,
        addCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)

  if (!context) {
    throw new Error(
      'useCategories must be used inside CategoriesProvider'
    )
  }

  return context
}