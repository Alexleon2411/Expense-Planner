interface Props {
  icon?: string | null
  color?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

const ICON_SIZES = {
  sm: 'text-[14px]',
  md: 'text-[24px]',
  lg: 'text-[36px]',
}

const PADDING_CLASSES = {
  sm: 'p-[5px]',
  md: 'p-2',
  lg: 'p-3',
}

const LEGACY_ICONS = new Set(['ahorro', 'casa', 'comida', 'gastos', 'ocio', 'salud', 'suscripciones'])

export default function CategoryIcon({ icon, color, name, size = 'lg', className = '' }: Props) {
  const sizeClass = SIZE_CLASSES[size]
  const iconSize = ICON_SIZES[size]
  const padding = PADDING_CLASSES[size]

  if (icon) {
    if (LEGACY_ICONS.has(icon)) {
      return (
        <img
          src={`/icono_${icon}.svg`}
          alt={name}
          className={`${sizeClass} rounded-xl object-cover ${className}`}
        />
      )
    }

    return (
      <span
        className={`material-symbols-outlined ${iconSize} ${padding} rounded-xl flex items-center justify-center ${className}`}
        style={{ color: '#ffffff', backgroundColor: color || '#3b82f6' }}
      >
        {icon}
      </span>
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center text-white font-bold ${className}`}
      style={{ backgroundColor: color || '#3b82f6' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
