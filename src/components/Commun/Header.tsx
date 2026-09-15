import { useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import DropDownProfile from "../user/DropDownProfile"
import type { PaymentReminder } from '../../hooks/usePaymentReminders'
import { useTranslation } from 'react-i18next'
import { formatCurrecy } from '../../helpers'
import '../../i18n/profileResources'
import { supportedLanguages, type AppLanguage } from '../../i18n/types'
import { useAuth } from '../../hooks/useAuth'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

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
    const [changingLanguage, setChangingLanguage] = useState(false)
    const { t, i18n } = useTranslation()
    const { user, updateLanguage } = useAuth()
    const currentLanguage = (user?.language ?? i18n.language).split('-')[0] as AppLanguage

    const handleLanguageChange = async (language: AppLanguage) => {
      if (language === currentLanguage || changingLanguage) return
      setChangingLanguage(true)
      try {
        await updateLanguage(language)
      } finally {
        setChangingLanguage(false)
      }
    }

    return (
         <header className="fixed w-full top-0 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-sm md:px-lg py-sm z-[100]">
           {/* Left: Logo (hidden on sm) + Hamburger (visible on sm only) */}
           <div className="flex items-center gap-xs">
              <button
                className="md:hidden p-xs text-on-surface-variant hover:text-primary transition-colors"
                onClick={onToggleSidebar}
                 aria-label={t('navigation.openMenu')}
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
            <div className="min-w-0 flex-1 flex justify-center px-sm md:px-0">
              <div className="relative w-full max-w-md min-w-0">
               <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <span className="material-symbols-outlined text-outline" data-icon="search">search</span>
               </span>
                <input
                   className="w-full min-w-0 pl-10 pr-md py-xs bg-surface-container border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                   placeholder={t('navigation.search')}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                   aria-label={t('navigation.search')}
                />
             </div>
           </div>

           {/* Right: Notifications + User */}
            <div className="flex shrink-0 items-center gap-xs md:gap-md">
              <Menu as="div" className="relative shrink-0">
                <MenuButton disabled={changingLanguage} className="inline-flex h-10 items-center gap-1 rounded-lg px-1.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors disabled:opacity-60" aria-label={t('profile.language')}>
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">language</span>
                  <span className="hidden sm:inline uppercase">{currentLanguage}</span>
                  <ChevronDownIcon aria-hidden="true" className="size-4" />
                </MenuButton>
                <MenuItems className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-xl border border-outline-variant bg-surface-container-lowest p-1 shadow-xl focus:outline-none">
                  {supportedLanguages.map((language) => (
                    <MenuItem key={language}>
                      <button type="button" onClick={() => void handleLanguageChange(language)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-on-surface data-focus:bg-surface-container" aria-current={language === currentLanguage ? 'true' : undefined}>
                        <span>{t(`languageNames.${language}`)}</span>
                        {language === currentLanguage && <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">check</span>}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
              <div className="relative shrink-0">
                <button onClick={() => setShowNotifications((visible) => !visible)} className="flex h-10 w-10 items-center justify-center rounded-lg p-xs text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors relative" aria-label={t('navigation.notifications')} aria-expanded={showNotifications}>
                 <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                 {reminders.length > 0 && <span className="absolute top-1 right-1 min-w-2 h-2 px-1 bg-error rounded-full text-[9px] text-white leading-3">{reminders.length > 1 ? reminders.length : ''}</span>}
               </button>
              {showNotifications && <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-xl">
                <div className="flex items-center justify-between gap-sm">
                   <h2 className="font-bold text-on-surface">{t('notifications.title')}</h2>
                   <button onClick={() => setShowNotifications(false)} className="text-on-surface-variant" aria-label={t('navigation.closeNotifications')}><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
               {reminders.length > 0 ? <div className="mt-sm space-y-xs">{reminders.map((reminder) => <div key={reminder.id} className="rounded-lg bg-error/10 p-sm"><p className="text-body-sm font-bold">{reminder.name}</p><p className="text-body-xs text-on-surface-variant">{t('notifications.dueToday')} · {formatCurrecy(reminder.amount)}</p></div>)}</div> : <p className="mt-sm text-body-sm text-on-surface-variant">{t('notifications.noneToday')}</p>}
                 {notificationPermission === 'default' && <button onClick={onRequestNotificationPermission} className="mt-md w-full rounded-lg bg-primary px-sm py-xs text-body-sm font-bold text-on-primary">{t('navigation.enableNotifications')}</button>}
                 {notificationPermission === 'denied' && <p className="mt-sm text-body-xs text-on-surface-variant">{t('navigation.notificationsBlocked')}</p>}
              </div>}
              </div>
              <div className="h-10 w-10">
                 <DropDownProfile onNavigate={onNavigate}/>
             </div>
           </div>
        </header>
    )
  }
