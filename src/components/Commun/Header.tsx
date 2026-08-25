import { useState } from 'react'
import DropDownProfile from "../user/DropDownProfile"
import type { PaymentReminder } from '../../hooks/usePaymentReminders'

export type View = 'tracker' | 'dashboard' | 'fixedExpenses' | 'settings' | 'support' | 'profile' | 'dashboard2' | 'report';

type HeaderProps = {
  onNavigate: (view: View) => void
  onToggleSidebar?: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  reminders: PaymentReminder[]
  notificationPermission: NotificationPermission | 'unsupported'
  onRequestNotificationPermission: () => void
}

export default function Header({ onNavigate, onToggleSidebar, searchTerm, onSearchChange, reminders, notificationPermission, onRequestNotificationPermission }: HeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false)

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
              <div className="relative">
              <button onClick={() => setShowNotifications((visible) => !visible)} className="p-xs text-on-surface-variant hover:text-primary transition-colors relative" aria-label="Ver recordatorios de pago" aria-expanded={showNotifications}>
                <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                {reminders.length > 0 && <span className="absolute top-1 right-1 min-w-2 h-2 px-1 bg-error rounded-full text-[9px] text-white leading-3">{reminders.length > 1 ? reminders.length : ''}</span>}
              </button>
              {showNotifications && <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-xl">
                <div className="flex items-center justify-between gap-sm">
                  <h2 className="font-bold text-on-surface">Recordatorios</h2>
                  <button onClick={() => setShowNotifications(false)} className="text-on-surface-variant" aria-label="Cerrar recordatorios"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
                {reminders.length > 0 ? <div className="mt-sm space-y-xs">{reminders.map((reminder) => <div key={reminder.id} className="rounded-lg bg-error/10 p-sm"><p className="text-body-sm font-bold">{reminder.name}</p><p className="text-body-xs text-on-surface-variant">Vence hoy · {reminder.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p></div>)}</div> : <p className="mt-sm text-body-sm text-on-surface-variant">No tienes pagos fijos pendientes para hoy.</p>}
                {notificationPermission === 'default' && <button onClick={onRequestNotificationPermission} className="mt-md w-full rounded-lg bg-primary px-sm py-xs text-body-sm font-bold text-on-primary">Activar notificaciones</button>}
                {notificationPermission === 'denied' && <p className="mt-sm text-body-xs text-on-surface-variant">Las notificaciones están bloqueadas en el navegador.</p>}
              </div>}
              </div>
             <div className="h-10 w-10">
                 <DropDownProfile onNavigate={onNavigate}/>
             </div>
           </div>
        </header>
    )
  }
