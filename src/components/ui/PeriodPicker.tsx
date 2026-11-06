import { useId } from 'react'
import Button from './Button'

interface PeriodPickerProps {
  month: number
  year: number
  years: number[]
  formatMonth: (month: number) => string
  labels: { month: string; year: string; previous: string; next: string }
  onChange: (period: { month: number; year: number }) => void
}

const SELECT_CLASSES =
  'h-8 appearance-none rounded-md border border-ui-control bg-ui-surface pl-3 pr-8 text-ui-body font-medium tabular-nums text-ui-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ui-canvas'

export default function PeriodPicker({ month, year, years, formatMonth, labels, onChange }: PeriodPickerProps) {
  const id = useId()
  const oldestYear = years[years.length - 1]
  const newestYear = years[0]
  const canGoBack = !(year === oldestYear && month === 1)
  const canGoForward = !(year === newestYear && month === 12)

  const goBack = () => (month === 1 ? onChange({ month: 12, year: year - 1 }) : onChange({ month: month - 1, year }))
  const goForward = () => (month === 12 ? onChange({ month: 1, year: year + 1 }) : onChange({ month: month + 1, year }))

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="secondary"
        icon="chevron_left"
        aria-label={labels.previous}
        title={labels.previous}
        disabled={!canGoBack}
        onClick={goBack}
      />
      <label className="sr-only" htmlFor={`${id}-month`}>
        {labels.month}
      </label>
      <div className="relative">
        <select
          id={`${id}-month`}
          className={SELECT_CLASSES}
          value={month}
          onChange={(event) => onChange({ month: Number(event.target.value), year })}
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {formatMonth(value)}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-ui-fg-muted"
        >
          expand_more
        </span>
      </div>
      <label className="sr-only" htmlFor={`${id}-year`}>
        {labels.year}
      </label>
      <div className="relative">
        <select
          id={`${id}-year`}
          className={SELECT_CLASSES}
          value={year}
          onChange={(event) => onChange({ month, year: Number(event.target.value) })}
        >
          {years.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-ui-fg-muted"
        >
          expand_more
        </span>
      </div>
      <Button
        variant="secondary"
        icon="chevron_right"
        aria-label={labels.next}
        title={labels.next}
        disabled={!canGoForward}
        onClick={goForward}
      />
    </div>
  )
}
