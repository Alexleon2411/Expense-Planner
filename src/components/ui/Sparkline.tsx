export interface SparklineSeries {
  values: number[]
  tone?: 'accent' | 'muted'
}

interface SparklineProps {
  series: SparklineSeries[]
  width?: number
  height?: number
  highlightIndex?: number
}

export default function Sparkline({ series, width = 96, height = 32, highlightIndex }: SparklineProps) {
  const points = Math.max(0, ...series.map((item) => item.values.length))
  if (points < 2) return null

  const allValues = series.flatMap((item) => item.values)
  const min = Math.min(0, ...allValues)
  const max = Math.max(0, ...allValues)
  const range = max - min || 1

  const x = (index: number) => (index / (points - 1)) * width
  const y = (value: number) => height - 2 - ((value - min) / range) * (height - 4)
  const pathFor = (values: number[]) =>
    values.map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(2)} ${y(value).toFixed(2)}`).join(' ')

  const highlightValue = highlightIndex !== undefined ? series[0]?.values[highlightIndex] : undefined

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      {series.map((item, index) => (
        <path
          key={index}
          d={pathFor(item.values)}
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={item.tone === 'muted' ? 'stroke-ui-control' : 'stroke-ui-accent'}
        />
      ))}
      {highlightIndex !== undefined && highlightValue !== undefined && (
        <circle cx={x(highlightIndex)} cy={y(highlightValue)} r={2.5} className="fill-ui-accent" />
      )}
    </svg>
  )
}
