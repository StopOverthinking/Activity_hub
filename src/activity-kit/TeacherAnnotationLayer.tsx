import { useEffect, useRef } from 'react'

type Point = {
  x: number
  y: number
}

type TeacherAnnotationLayerProps = {
  enabled: boolean
  resetSignal: number
}

export function TeacherAnnotationLayer({
  enabled,
  resetSignal,
}: TeacherAnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<Point | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = frameRef.current

    if (!canvas || !frame) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const resize = () => {
      const rect = frame.getBoundingClientRect()
      const scale = window.devicePixelRatio || 1

      canvas.width = rect.width * scale
      canvas.height = rect.height * scale
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      context.setTransform(scale, 0, 0, scale, 0, 0)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.lineWidth = 4
      context.strokeStyle = '#5169b2'
    }

    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(frame)
    window.addEventListener('orientationchange', resize)

    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', resize)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
  }, [resetSignal])

  const toLocalPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()

    if (!rect) {
      return { x: 0, y: 0 }
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!enabled) {
      return
    }

    const point = toLocalPoint(event)

    drawingRef.current = true
    lastPointRef.current = point
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const continueDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!enabled || !drawingRef.current || !lastPointRef.current) {
      return
    }

    const point = toLocalPoint(event)
    const context = canvasRef.current?.getContext('2d')

    if (!context) {
      return
    }

    context.beginPath()
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    context.lineTo(point.x, point.y)
    context.stroke()

    lastPointRef.current = point
  }

  const stopDrawing = () => {
    drawingRef.current = false
    lastPointRef.current = null
  }

  return (
    <div
      ref={frameRef}
      className="annotation-frame"
      data-enabled={enabled}
      aria-hidden={!enabled}
    >
      <canvas
        ref={canvasRef}
        className="annotation-canvas"
        onPointerDown={startDrawing}
        onPointerMove={continueDrawing}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onPointerLeave={stopDrawing}
      />
    </div>
  )
}
