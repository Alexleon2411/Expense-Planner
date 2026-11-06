import type { ReactNode } from 'react'

interface CardProps {
  eyebrow?: ReactNode
  title?: ReactNode
  titleId?: string
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export default function Card({ eyebrow, title, titleId, actions, className = '', children }: CardProps) {
  return (
    <section
      aria-labelledby={titleId}
      data-reveal="card"
      className={`flex min-w-0 flex-col rounded-lg border border-ui-border bg-ui-surface p-5 ${className}`}
    >
      {(eyebrow || title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <p className="text-ui-label uppercase text-ui-fg-muted">{eyebrow}</p>}
            {title && (
              <h3 id={titleId} className="mt-1 text-ui-title font-semibold text-ui-fg">
                {title}
              </h3>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
