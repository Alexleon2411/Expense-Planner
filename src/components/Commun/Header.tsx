import DropDownProfile from "../user/DropDownProfile"

export type View = 'tracker' | 'dashboard' | 'fixedExpenses' | 'settings' | 'support' | 'profile' | 'dashboard2' | 'report';

type HeaderProps = {
  onNavigate: (view: View) => void
  onToggleSidebar?: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
}

export default function Header({ onNavigate, onToggleSidebar, searchTerm, onSearchChange }: HeaderProps) {
    return (
        <header className="fixed w-full top-0 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-lg py-sm z-[100]">
           {/* Left: Logo (hidden on sm) + Hamburger (visible on sm only) */}
           <div className="flex items-center gap-xs">
              <button
                className="md:hidden p-xs text-on-surface-variant hover:text-primary transition-colors"
                onClick={onToggleSidebar}
                aria-label="Abrir menú"
              >
                <span className="material-symbols-outlined" data-icon="menu">menu</span>
              </button>
              <button onClick={() => onNavigate('tracker')} className="hidden md:flex items-center gap-xs cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-[20px]" data-icon="account_balance">account_balance</span>
                </div>
                <h1 className="text-headline-md font-headline-md font-bold text-on-surface">AccounterFlow</h1>
              </button>
           </div>

           {/* Center: Search bar */}
           <div className="flex-1 flex justify-center px-sm md:px-0">
             <div className="relative w-full max-w-md">
               <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <span className="material-symbols-outlined text-outline" data-icon="search">search</span>
               </span>
                <input
                  className="w-full pl-10 pr-md py-xs bg-surface-container border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Search expenses..."
                  type="search"
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  aria-label="Search expenses"
                />
             </div>
           </div>

           {/* Right: Notifications + User */}
           <div className="flex items-center gap-md">
             <button className="p-xs text-on-surface-variant hover:text-primary transition-colors relative">
               <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
               <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
             </button>
             <div className="h-10 w-10">
                 <DropDownProfile onNavigate={onNavigate}/>
             </div>
           </div>
        </header>
    )
  }
