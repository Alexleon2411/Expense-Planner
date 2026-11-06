import { useEffect, useState, type RefObject } from 'react'
import { animate, createScope, stagger } from 'animejs'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

export function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export function useRevealMotion(rootRef: RefObject<HTMLElement | null>, revealKey: string) {
  useEffect(() => {
    const root = rootRef.current
    if (!revealKey || !root || prefersReducedMotion()) return

    const scope = createScope({ root }).add(() => {
      animate(Array.from(root.querySelectorAll<HTMLElement>('[data-reveal="card"]')), {
        opacity: [0, 1],
        translateY: [12, 0],
        rotateX: [-6, 0],
        duration: 480,
        delay: stagger(60),
        ease: 'outQuad',
      })
      animate(Array.from(root.querySelectorAll<HTMLElement>('[data-reveal="bar"]')), {
        scaleY: [0, 1],
        duration: 600,
        delay: stagger(40),
        ease: 'outCubic',
      })
      animate(Array.from(root.querySelectorAll<HTMLElement>('[data-reveal="meter"]')), {
        scaleX: [0, 1],
        duration: 600,
        delay: stagger(30, { start: 120 }),
        ease: 'outCubic',
      })
    })

    return () => {
      scope.revert()
    }
  }, [rootRef, revealKey])
}

export function useTilt(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = ref.current
    if (!enabled || !element || prefersReducedMotion() || !window.matchMedia(FINE_POINTER).matches) return

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      animate(element, { rotateX: -y * 8, rotateY: x * 8, duration: 200, ease: 'outQuad' })
    }
    const onLeave = () => {
      animate(element, { rotateX: 0, rotateY: 0, duration: 400, ease: 'outQuad' })
    }

    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, enabled])
}
