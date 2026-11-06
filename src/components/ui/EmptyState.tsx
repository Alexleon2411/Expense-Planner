import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 px-4 py-8 text-center ${className}`}>
      <span
        aria-hidden="true"
        className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-lg bg-ui-elevated text-[22px] text-ui-fg-muted"
      >
        {icon}
      </span>
      <p className="text-ui-title font-semibold text-ui-fg">{title}</p>
      {description && <p className="max-w-sm text-ui-body text-ui-fg-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
