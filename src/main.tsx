import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BudgetProvider } from './context/BudgetContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { CategoriesProvider } from './context/CategoriesContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BudgetProvider>
        <CategoriesProvider>
          <App />
        </CategoriesProvider>
      </BudgetProvider>
    </AuthProvider>
  </StrictMode>,
)
