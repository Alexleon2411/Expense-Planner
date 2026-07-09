import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useAuth } from '../../hooks/useAuth'
export type View = 'tracker' | 'dashboard' | 'fixedExpenses' | 'settings' | 'support' | 'profile' | 'dashboard2' | 'report';
type Props = { onNavigate: (view: View) => void }

export default function Example({ onNavigate }: Props) {
  const { logout } = useAuth()

  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white  text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50">
        <img
            alt="User Profile"
            className="w-full h-full object-cover rounded-lg"
            data-alt="A high-quality professional headshot of a person with a friendly expression. The lighting is soft and corporate, with a clean, light-colored blurred background. The individual is dressed in a smart navy blue blazer, fitting the modern financial platform's aesthetic and professional branding."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBioX94GimufCU8wekHh-c-KUSZJyuGG3vCWAhQTnuvqqrGpiM31ZBosODZonWbWcbDmhi5a-OY7EAWMnW0nSYNEbdQHCYQF8f-Tixok9a037QQp7f5Fmm6at-2LaCKg3uDA0lLm_iSrwZhUPlhCDxviippHG3dzy8LIDN7xzD4lWlAlHTSGQkPpOqn_309D6rJ9cWQ_ucCfIPVHshhE3xPe5K9iZOzBpz1jwhkq8i_n3QqMH1W_dB_j-XKbbaL9MAIt4v81dM-gcM"
        />
        <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          <MenuItem>
             <button className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidde"onClick={() => onNavigate('profile')}>
                <span className="text-body-md font-body-md">Profile</span>
            </button>
          </MenuItem>
          
          <form action="#" method="POST">
            <MenuItem>
              <button
              onClick={logout}
                type="submit"
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
              >
                Sign out
              </button>
            </MenuItem>
          </form>
        </div>
      </MenuItems>
    </Menu>
  )
}
