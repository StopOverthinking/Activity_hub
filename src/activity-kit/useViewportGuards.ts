import { useEffect } from 'react'

export function useViewportGuards() {
  useEffect(() => {
    const root = document.documentElement

    const syncViewportHeight = () => {
      const nextHeight = window.visualViewport?.height ?? window.innerHeight
      root.style.setProperty('--app-height', `${nextHeight}px`)
    }

    const preventGesture = (event: Event) => {
      event.preventDefault()
    }

    syncViewportHeight()

    window.addEventListener('resize', syncViewportHeight)
    window.visualViewport?.addEventListener('resize', syncViewportHeight)
    document.addEventListener('gesturestart', preventGesture, { passive: false })
    document.addEventListener('gesturechange', preventGesture, { passive: false })
    document.addEventListener('gestureend', preventGesture, { passive: false })
    document.addEventListener('dblclick', preventGesture, { passive: false })

    return () => {
      window.removeEventListener('resize', syncViewportHeight)
      window.visualViewport?.removeEventListener('resize', syncViewportHeight)
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
      document.removeEventListener('gestureend', preventGesture)
      document.removeEventListener('dblclick', preventGesture)
    }
  }, [])
}
