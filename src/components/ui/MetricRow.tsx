import type { ReactNode } from 'react'

interface MetricRowProps {
  label: ReactNode
  value: ReactNode
  badge?: ReactNode
  note?: ReactNode
  visual?: ReactNode
}

export default function MetricRow({ label, value, badge, note, visual }: MetricRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ui-border py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-ui-caption text-ui-fg-muted">{label}</p>
        <p className="mt-1 text-ui-title font-semibold tabular-nums text-ui-fg">{value}</p>
        {note && <p className="mt-1 text-ui-caption text-ui-fg-muted">{note}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {badge}
        {visual}
      </div>
    </div>
  )
}
