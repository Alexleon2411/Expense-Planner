import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const BASE =
  'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-ui-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ui-canvas disabled:pointer-events-none disabled:opacity-50'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-ui-accent text-ui-on-accent hover:opacity-90',
  secondary: 'border border-ui-control bg-ui-surface text-ui-fg hover:bg-ui-elevated',
  ghost: 'text-ui-fg-muted hover:bg-ui-elevated hover:text-ui-fg',
}

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: Variant
  icon?: string
} & (
  | { children: ReactNode; 'aria-label'?: string }
  | { children?: undefined; 'aria-label': string }
)

export default function Button({
  variant = 'secondary',
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconOnly = children === undefined
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${iconOnly ? 'w-8 px-0' : ''} ${className}`}
      {...rest}
    >
      {icon && (
        <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
          {icon}
        </span>
      )}
      {children}
    </button>
  )
}
