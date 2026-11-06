import type { ReactNode } from 'react'

export interface ActivityItem {
  id: string
  icon?: ReactNode
  title: ReactNode
  meta?: ReactNode
  value: ReactNode
}

interface ActivityListProps {
  items: ActivityItem[]
}

export default function ActivityList({ items }: ActivityListProps) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex min-h-[56px] items-center gap-3 border-b border-ui-border py-2.5 last:border-b-0"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center">
            {item.icon ?? <span aria-hidden="true" className="block h-6 w-6 rounded-md bg-ui-elevated" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-ui-body font-medium text-ui-fg">{item.title}</p>
            {item.meta && <p className="truncate text-ui-caption text-ui-fg-muted">{item.meta}</p>}
          </div>
          <p className="shrink-0 text-ui-body font-medium tabular-nums text-ui-fg">{item.value}</p>
        </li>
      ))}
    </ul>
  )
}
