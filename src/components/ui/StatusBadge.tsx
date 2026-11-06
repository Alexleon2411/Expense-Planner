import type { ReactNode } from 'react'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral'

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'bg-ui-success/[.12] text-ui-success',
  warning: 'bg-ui-warning/[.12] text-ui-warning',
  danger: 'bg-ui-danger/[.12] text-ui-danger',
  neutral: 'bg-ui-elevated text-ui-fg-muted',
}

interface StatusBadgeProps {
  tone?: StatusTone
  icon?: string
  children: ReactNode
}

export default function StatusBadge({ tone = 'neutral', icon, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 text-ui-caption font-medium tabular-nums ${TONE_CLASSES[tone]}`}
    >
      {icon && (
        <span aria-hidden="true" className="material-symbols-outlined text-[16px] leading-none">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}
