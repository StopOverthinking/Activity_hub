import { useLayoutEffect, useMemo, useRef, useState } from 'react'

type MatchItem = {
  id: string
  marker: string
  label: string
}

type ConnectionMap = Record<string, string>

type Segment = {
  leftId: string
  rightId: string
  path: string
}

type LineMatchBoardProps = {
  leftItems: MatchItem[]
  rightItems: MatchItem[]
  value: ConnectionMap
  answerMap: ConnectionMap
  onChange: (nextValue: ConnectionMap) => void
  revealAnswer?: boolean
}

export function LineMatchBoard({
  leftItems,
  rightItems,
  value,
  answerMap,
  onChange,
  revealAnswer = false,
}: LineMatchBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [activeLeftId, setActiveLeftId] = useState<string | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])

  const visibleConnections = revealAnswer ? answerMap : value
  const selectedLeftId = revealAnswer ? null : activeLeftId

  const assignedRightIds = useMemo(() => new Set(Object.values(value)), [value])

  useLayoutEffect(() => {
    const board = boardRef.current

    if (!board) {
      return
    }

    const computeSegments = () => {
      const boardRect = board.getBoundingClientRect()
      const nextSegments = Object.entries(visibleConnections).flatMap(
        ([leftId, rightId]) => {
          const leftElement = leftRefs.current[leftId]
          const rightElement = rightRefs.current[rightId]

          if (!leftElement || !rightElement) {
            return []
          }

          const leftRect = leftElement.getBoundingClientRect()
          const rightRect = rightElement.getBoundingClientRect()
          const startX = leftRect.right - boardRect.left - 10
          const startY = leftRect.top - boardRect.top + leftRect.height / 2
          const endX = rightRect.left - boardRect.left + 10
          const endY = rightRect.top - boardRect.top + rightRect.height / 2
          const controlOffset = Math.max(56, Math.abs(endX - startX) * 0.3)
          const path = [
            `M ${startX} ${startY}`,
            `C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`,
          ].join(' ')

          return [{ leftId, rightId, path }]
        },
      )

      setSegments(nextSegments)
    }

    computeSegments()

    const resizeObserver = new ResizeObserver(computeSegments)
    resizeObserver.observe(board)

    Object.values(leftRefs.current).forEach((element) => {
      if (element) {
        resizeObserver.observe(element)
      }
    })

    Object.values(rightRefs.current).forEach((element) => {
      if (element) {
        resizeObserver.observe(element)
      }
    })

    window.addEventListener('resize', computeSegments)
    window.addEventListener('orientationchange', computeSegments)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', computeSegments)
      window.removeEventListener('orientationchange', computeSegments)
    }
  }, [leftItems, rightItems, visibleConnections])

  const handleLeftSelect = (leftId: string) => {
    setActiveLeftId((current) => (current === leftId ? null : leftId))
  }

  const handleRightSelect = (rightId: string) => {
    if (!selectedLeftId) {
      return
    }

    const nextValue: ConnectionMap = { ...value }

    Object.entries(nextValue).forEach(([leftId, assignedRightId]) => {
      if (assignedRightId === rightId && leftId !== selectedLeftId) {
        delete nextValue[leftId]
      }
    })

    if (nextValue[selectedLeftId] === rightId) {
      delete nextValue[selectedLeftId]
    } else {
      nextValue[selectedLeftId] = rightId
    }

    onChange(nextValue)
    setActiveLeftId(null)
  }

  return (
    <div className="line-match-board" ref={boardRef}>
      <svg
        aria-hidden="true"
        className="line-match-board__svg"
        preserveAspectRatio="none"
      >
        {segments.map((segment) => (
          <path
            key={`${segment.leftId}-${segment.rightId}`}
            className="line-match-board__path"
            d={segment.path}
            data-reveal={revealAnswer}
          />
        ))}
      </svg>

      <div className="line-match-board__column">
        {leftItems.map((item) => {
          const isLinked = Boolean(value[item.id])

          return (
            <button
              key={item.id}
              className="line-match-card"
              data-active={selectedLeftId === item.id}
              data-linked={isLinked}
              onClick={() => handleLeftSelect(item.id)}
              ref={(element) => {
                leftRefs.current[item.id] = element
              }}
              type="button"
            >
              <span className="line-match-card__marker">{item.marker}</span>
              <span className="line-match-card__label">{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="line-match-board__column line-match-board__column--right">
        {rightItems.map((item) => {
          const isAssigned = assignedRightIds.has(item.id)
          const isCorrectAnswer = Object.values(answerMap).includes(item.id)

          return (
            <button
              key={item.id}
              className="line-match-card line-match-card--right"
              data-answer={revealAnswer && isCorrectAnswer}
              data-assigned={isAssigned}
              onClick={() => handleRightSelect(item.id)}
              ref={(element) => {
                rightRefs.current[item.id] = element
              }}
              type="button"
            >
              <span className="line-match-card__marker">{item.marker}</span>
              <span className="line-match-card__label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
