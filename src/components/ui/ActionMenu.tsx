import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

export interface ActionMenuItem {
  key: string
  label: string
  icon?: string
  onSelect: () => void
}

interface ActionMenuProps {
  label: string
  items: ActionMenuItem[]
}

export default function ActionMenu({ label, items }: ActionMenuProps) {
  return (
    <Menu as="div" className="relative">
      <MenuButton
        aria-label={label}
        title={label}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-ui-control bg-ui-surface text-ui-fg hover:bg-ui-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ui-canvas"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
          more_horiz
        </span>
      </MenuButton>
      <MenuItems className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg border border-ui-border bg-ui-elevated p-1 focus:outline-none">
        {items.map((item) => (
          <MenuItem key={item.key}>
            {({ focus }) => (
              <button
                type="button"
                onClick={item.onSelect}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-ui-body text-ui-fg ${focus ? 'bg-ui-surface' : ''}`}
              >
                {item.icon && (
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none text-ui-fg-muted">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}
