import { useEffect, useMemo, useState } from "react"
import BudgetForm from "./components/BudgetForm"
import { useBudget } from "./hooks/useBudget"
// import BudgetTracker from "./components/BudgetTracker"
import ExpenseModal from "./components/ExpendsModal"
// import ExpenseList from "./components/ExpenseList"
import ExpenseFeed from "./components/expense/ExpenseFeed"
// import FilterByCategory from "./components/FilterByCategory"
import SideBar, { type View } from './components/Commun/SideBar';
import HeaderTop from "./components/Commun/Header"
import LoginForm from "./components/LoginForm"
import Dashboard from "./components/Dashboard"
import FixedExpenses from "./components/FixedExpenses"
import Settings from "./components/settings"
import { useAuth } from "./hooks/useAuth"
import Support from "./components/Support"
import UserProfile from "./components/user/UserProfile"
import Dashboard2 from "./components/Dashboard2"
import Report from "./components/Report"

function App() {

  const { state, syncBudgetWithSalary } = useBudget()
  const { user, loading } = useAuth()
  // 'view' ahora vive aquí y se comparte entre SideBar (que la cambia)
  // y App (que decide qué renderizar según su valor).
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem('current_view');
    const validViews: View[] = ['tracker', 'dashboard', 'fixedExpenses', 'settings', 'support', 'profile', 'dashboard2', 'report'];
    return saved && validViews.includes(saved as View) ? saved as View : 'tracker';
  })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isValidBudget = useMemo(() => state.budget > 0, [state])

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(state.expenses))
    localStorage.setItem('budget', JSON.stringify(state.budget))
  })

  // Persist current view on reload
  useEffect(() => {
    localStorage.setItem('current_view', view);
  }, [view]);

  // Sync budget from salary when user logs in
  useEffect(() => {
    if (user) {
      syncBudgetWithSalary()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p className="text-2xl text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // Decide qué componente mostrar en el área de contenido principal
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <>
            <Dashboard />
            <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          </>
        )
        
      case 'fixedExpenses':
        return <FixedExpenses />
      case 'settings':
        return <Settings />
        case 'support':
          return <Support/>
        case 'profile':
          return <UserProfile/>
        case 'dashboard2':
          return <Dashboard2/>
        case 'report':
          return <Report/>
      case 'tracker':
      default:
        return (
          <>
            {/* <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-ld mt-10 p-10">
              {isValidBudget ? <BudgetTracker /> : <BudgetForm />}
            </div> */}
            <ExpenseFeed />
          </>
        )
    }
  }

  return (
    <>
      {isValidBudget ? (
        <div>
          <HeaderTop onNavigate={setView} onToggleSidebar={() => setMobileSidebarOpen(true)} />
          <SideBar
            onAddTransaction={() => setIsModalOpen(true)}
            currentView={view}
            onNavigate={setView}
            onCollapsedChange={setSidebarCollapsed}
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
          <div className={`pt-16 h-screen overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
            {renderView()}
          </div>
        </div>
      ) : (
        <BudgetForm />
      )}
      {renderView().key == ''}
      
    </>
  )
}

export default App