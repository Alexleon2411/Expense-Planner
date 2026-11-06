export type MeterTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral'

const FILL_CLASSES: Record<MeterTone, string> = {
  accent: 'bg-ui-accent',
  success: 'bg-ui-success',
  warning: 'bg-ui-warning',
  danger: 'bg-ui-danger',
  neutral: 'bg-ui-fg-muted',
}

interface MeterBarProps {
  value: number
  max?: number
  tone?: MeterTone
  label?: string
  className?: string
}

export default function MeterBar({ value, max = 100, tone = 'accent', label, className = '' }: MeterBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const track = `relative h-1 w-full overflow-hidden rounded-full bg-ui-elevated ${className}`
  const fill = (
    <span
      data-reveal="meter"
      className={`block h-full origin-left rounded-full ${FILL_CLASSES[tone]}`}
      style={{ width: `${percent}%` }}
    />
  )

  if (label) {
    return (
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        className={track}
      >
        {fill}
      </div>
    )
  }

  return (
    <div aria-hidden="true" className={track}>
      {fill}
    </div>
  )
}
