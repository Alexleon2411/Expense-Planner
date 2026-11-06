import { useLayoutEffect, useRef } from 'react'
import { animate, createScope } from 'animejs'
import { prefersReducedMotion } from '../../hooks/useMotion'

interface AnimatedValueProps {
  value: number
  format: (value: number) => string
  reveal: string
  className?: string
}

export default function AnimatedValue({ value, format, reveal, className }: AnimatedValueProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const formatRef = useRef(format)

  useLayoutEffect(() => {
    formatRef.current = format
  })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    if (!reveal || prefersReducedMotion()) {
      element.textContent = formatRef.current(value)
      return
    }

    const counter = { current: 0 }
    const scope = createScope({ root: element }).add(() => {
      animate(counter, {
        current: [0, value],
        duration: 700,
        ease: 'outExpo',
        onUpdate: () => {
          element.textContent = formatRef.current(counter.current)
        },
      })
    })

    return () => {
      scope.revert()
    }
  }, [value, reveal])

  return <span ref={ref} className={className} />
}
