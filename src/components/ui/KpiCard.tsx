import { useRef, type ReactNode } from 'react'
import { useTilt } from '../../hooks/useMotion'

interface KpiCardProps {
  label: ReactNode
  value: ReactNode
  badge?: ReactNode
  meter?: ReactNode
  footer?: ReactNode
  tilt?: boolean
  className?: string
}

export default function KpiCard({ label, value, badge, meter, footer, tilt = false, className = '' }: KpiCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  useTilt(ref, tilt)

  return (
    <div
      ref={ref}
      data-reveal="card"
      className={`flex h-full min-w-0 flex-col gap-3 rounded-lg border border-ui-border bg-ui-surface p-5 ${className}`}
    >
      <p className="text-ui-label uppercase text-ui-fg-muted">{label}</p>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <p className="text-ui-metric font-semibold tabular-nums text-ui-fg">{value}</p>
        {badge}
      </div>
      {meter}
      {footer && <p className="mt-auto text-ui-caption text-ui-fg-muted">{footer}</p>}
    </div>
  )
}
