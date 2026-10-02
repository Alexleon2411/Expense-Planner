import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import '../../i18n/profileResources'
export type View = 'tracker' | 'dashboard' | 'fixedExpenses' | 'settings' | 'support' | 'profile' | 'dashboard2' | 'report';
type Props = { onNavigate: (view: View) => void }

export default function Example({ onNavigate }: Props) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') ?? '?'

  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-surface-container-lowest text-sm font-semibold text-on-surface shadow-xs inset-ring-1 inset-ring-outline-variant hover:bg-surface-container-low items-center px-1 py-1">
        <div className="w-8 h-8 rounded-md bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        <ChevronDownIcon aria-hidden="true" className="size-5 text-outline" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-surface-container-lowest shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          <MenuItem>
             <button className="block px-4 py-2 text-sm text-on-surface data-focus:bg-surface-container-low data-focus:text-on-surface data-focus:outline-hidde"onClick={() => onNavigate('profile')}>
                 <span className="text-body-md font-body-md">{t('navigation.profile')}</span>
            </button>
          </MenuItem>
          
          <form action="#" method="POST">
            <MenuItem>
              <button
              onClick={logout}
                type="submit"
                className="block w-full px-4 py-2 text-left text-sm text-on-surface data-focus:bg-surface-container-low data-focus:text-on-surface data-focus:outline-hidden"
              >
                {t('navigation.signOut')}
              </button>
            </MenuItem>
          </form>
        </div>
      </MenuItems>
    </Menu>
  )
}
