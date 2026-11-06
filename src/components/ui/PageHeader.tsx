import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  meta?: ReactNode
  controls?: ReactNode
  actions?: ReactNode
}

export default function PageHeader({ title, meta, controls, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-ui-border pb-3 md:min-h-[56px] md:flex-row md:items-center md:justify-between md:gap-4 md:pb-0">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-ui-heading font-semibold text-ui-fg">{title}</h2>
        {meta && <p className="text-ui-caption text-ui-fg-muted">{meta}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {controls}
        {actions}
      </div>
    </header>
  )
}
