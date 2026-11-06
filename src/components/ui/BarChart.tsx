export interface BarChartItem {
  id: string
  label: string
  srLabel: string
  value: number
  displayValue?: string
  disabled?: boolean
  highlighted?: boolean
}

interface BarChartProps {
  items: BarChartItem[]
  max: number
  ariaLabel: string
  formatAxis: (value: number) => string
  className?: string
}

const AXIS_LABEL = 'absolute right-2 whitespace-nowrap text-right text-ui-caption tabular-nums text-ui-fg-muted'

export default function BarChart({ items, max, ariaLabel, formatAxis, className = '' }: BarChartProps) {
  const scale = max > 0 ? max : 1

  return (
    <div className={`flex h-[200px] w-full ${className}`}>
      <div aria-hidden="true" className="relative w-16 shrink-0 sm:w-20">
        <div className="absolute inset-x-0 bottom-6 top-5">
          <span className={`${AXIS_LABEL} top-0 -translate-y-1/2`}>{formatAxis(max)}</span>
          <span className={`${AXIS_LABEL} top-1/2 -translate-y-1/2`}>{formatAxis(max / 2)}</span>
          <span className={`${AXIS_LABEL} bottom-0 translate-y-1/2`}>{formatAxis(0)}</span>
        </div>
      </div>
      <div className="relative min-w-0 flex-1">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-6 top-5">
          <span className="absolute inset-x-0 top-0 border-t border-ui-border" />
          <span className="absolute inset-x-0 top-1/2 border-t border-ui-border" />
          <span className="absolute inset-x-0 bottom-0 border-t border-ui-control" />
        </div>
        <ol aria-label={ariaLabel} className="relative flex h-full items-stretch gap-1 sm:gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex min-w-0 flex-1 flex-col">
              <span
                aria-hidden="true"
                className="invisible flex h-5 items-end justify-center whitespace-nowrap text-ui-caption tabular-nums text-ui-fg sm:visible"
              >
                {item.displayValue}
              </span>
              <span className="relative flex min-h-0 flex-1 items-end justify-center">
                {!item.disabled && item.value > 0 && (
                  <span
                    data-reveal="bar"
                    className={`block w-full max-w-[40px] origin-bottom rounded-t ${item.highlighted ? 'bg-ui-accent' : 'bg-ui-accent/[.6]'}`}
                    style={{ height: `${(item.value / scale) * 100}%` }}
                  />
                )}
                {!item.disabled && item.value === 0 && (
                  <span aria-hidden="true" className="block h-0.5 w-full max-w-[40px] rounded-full bg-ui-control" />
                )}
              </span>
              <span
                aria-hidden="true"
                className={`flex h-6 items-center justify-center whitespace-nowrap text-ui-caption ${item.highlighted ? 'font-semibold text-ui-fg' : 'text-ui-fg-muted'}`}
              >
                {item.label}
              </span>
              <span className="sr-only">{item.srLabel}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
