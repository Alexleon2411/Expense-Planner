// import { useAuth } from "../../hooks/useAuth"
import DropDownProfile from "../user/DropDownProfile"

export type View = 'tracker' | 'dashboard' | 'fixedExpenses' | 'settings' | 'support' | 'profile' | 'dashboard2' | 'report';
type HeaderProps = { onNavigate: (view: View) => void }
export default function Header({ onNavigate }: HeaderProps) {
    // const { logout } = useAuth()
    return (
        <header className="fixed w-full top-0  bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-lg py-sm z-[100]">
           <div className="flex items-center gap-xs">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[20px]" data-icon="account_balance">account_balance</span>
                  </div>
                  <h1 className="text-headline-md font-headline-md font-bold text-on-surface">AccounterFlow</h1>
              </div>
          <div className="flex items-center gap-lg">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline" data-icon="search">search</span>
              </span>
              <input className="pl-10 pr-md py-xs bg-surface-container border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64 transition-all" placeholder="Search transactions..." type="text" />
            </div>
            
          </div>
          <div className="flex items-center gap-md">
            <button className="p-xs text-on-surface-variant hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            {/* <button className="p-xs text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined" data-icon="account_balance_wallet">account_balance_wallet</span>
            </button> */}
            {/* Avatar Secction  */}
            <div className="h-10 w-10">
                <DropDownProfile onNavigate={onNavigate}/>
            </div>
          </div>
        </header>
    )
  }