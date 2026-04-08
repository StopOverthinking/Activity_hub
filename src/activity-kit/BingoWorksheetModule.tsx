import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { usePersistentState } from './usePersistentState'
import { useQuizSubmission } from './useQuizSubmission'
import type { AppMode } from '../activities/types'

export type BingoWorksheetClue = {
  id: string
  prompt: string
  initials: string
  answer: string
}

export type BingoWorksheetHeader = {
  subject: string
  unitTitle: string
  pageLabel: string
  lessonTitle: string
}

export type BingoWorksheetModuleConfig = {
  clues: BingoWorksheetClue[]
  boardTitle: string
  boardDescription: string
  boardSize?: number
  header?: BingoWorksheetHeader
  showHeader?: boolean
}

type BingoWorksheetModuleProps = BingoWorksheetModuleConfig & {
  storageKey: string
  mode: AppMode
  showAnswers: boolean
}

type RelativePoint = {
  x: number
  y: number
}

type DraftLine = {
  pointerId: number
  start: RelativePoint
  end: RelativePoint
  startCellIndex: number
}

const CARD_DRAG_TYPE = 'application/x-bingo-card'

function createEmptyAnswerMap(clues: BingoWorksheetClue[]) {
  return clues.reduce<Record<string, string>>((accumulator, clue) => {
    accumulator[clue.id] = ''
    return accumulator
  }, {})
}

function createEmptyBoard(cellCount: number) {
  return Array.from({ length: cellCount }, () => '')
}

function getCellCount(clues: BingoWorksheetClue[], boardSize: number) {
  return Math.max(boardSize * boardSize, clues.length)
}

function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, '').replace(/[,.!?]/g, '').toLowerCase()
}

function areStringArraysEqual(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function normalizeStoredBoardEntries(
  entries: string[],
  cellCount: number,
  clueIds: Set<string>,
  answerIdByNormalizedAnswer: Map<string, string>,
) {
  const nextEntries = createEmptyBoard(cellCount)
  const usedIds = new Set<string>()

  for (let index = 0; index < cellCount; index += 1) {
    const rawValue = (entries[index] ?? '').trim()

    if (!rawValue) {
      continue
    }

    const clueId =
      clueIds.has(rawValue)
        ? rawValue
        : answerIdByNormalizedAnswer.get(normalizeAnswer(rawValue)) ?? ''

    if (!clueId || usedIds.has(clueId)) {
      continue
    }

    usedIds.add(clueId)
    nextEntries[index] = clueId
  }

  return nextEntries
}

function isValidLineKey(lineKey: string, boardSize: number) {
  if (lineKey === 'diag:main' || lineKey === 'diag:anti') {
    return true
  }

  const [axis, rawIndex] = lineKey.split(':')
  const index = Number(rawIndex)

  return (
    (axis === 'row' || axis === 'col') &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < boardSize
  )
}

function normalizeStoredLineKeys(lineKeys: string[], boardSize: number) {
  const seenKeys = new Set<string>()

  return lineKeys.filter((lineKey) => {
    if (!isValidLineKey(lineKey, boardSize) || seenKeys.has(lineKey)) {
      return false
    }

    seenKeys.add(lineKey)
    return true
  })
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getCellIndexFromPoint(point: RelativePoint, boardSize: number) {
  const column = clamp(Math.floor(point.x * boardSize), 0, boardSize - 1)
  const row = clamp(Math.floor(point.y * boardSize), 0, boardSize - 1)
  return row * boardSize + column
}

function getRelativePoint(
  clientX: number,
  clientY: number,
  boardRect: DOMRect,
): RelativePoint {
  return {
    x: clamp((clientX - boardRect.left) / boardRect.width, 0, 1),
    y: clamp((clientY - boardRect.top) / boardRect.height, 0, 1),
  }
}

function getBingoLineKeyFromCells(
  startCellIndex: number,
  endCellIndex: number,
  boardSize: number,
) {
  if (startCellIndex === endCellIndex) {
    return null
  }

  const startRow = Math.floor(startCellIndex / boardSize)
  const startColumn = startCellIndex % boardSize
  const endRow = Math.floor(endCellIndex / boardSize)
  const endColumn = endCellIndex % boardSize

  if (startRow === endRow) return `row:${startRow}`
  if (startColumn === endColumn) return `col:${startColumn}`
  if (startRow === startColumn && endRow === endColumn) return 'diag:main'
  if (startRow + startColumn === boardSize - 1 && endRow + endColumn === boardSize - 1) {
    return 'diag:anti'
  }

  return null
}

function getLineCoordinates(lineKey: string, boardSize: number) {
  const edgeOffset = 0.5 / boardSize
  const farEdgeOffset = 1 - edgeOffset

  if (lineKey === 'diag:main') {
    return { x1: edgeOffset, y1: edgeOffset, x2: farEdgeOffset, y2: farEdgeOffset }
  }

  if (lineKey === 'diag:anti') {
    return { x1: farEdgeOffset, y1: edgeOffset, x2: edgeOffset, y2: farEdgeOffset }
  }

  const [axis, rawIndex] = lineKey.split(':')
  const index = Number(rawIndex)
  const centerOffset = (index + 0.5) / boardSize

  return axis === 'row'
    ? { x1: edgeOffset, y1: centerOffset, x2: farEdgeOffset, y2: centerOffset }
    : { x1: centerOffset, y1: edgeOffset, x2: centerOffset, y2: farEdgeOffset }
}

function renderPrompt(prompt: string, initials: string) {
  const [before, after] = prompt.split('{{blank}}')

  if (typeof after !== 'string') {
    return <span>{prompt}</span>
  }

  return (
    <>
      <span>{before}</span>{' '}
      <span className="bingo-sheet__initials">( {initials} )</span>
      <span>{after}</span>
    </>
  )
}

export function BingoWorksheetModule({
  storageKey,
  mode,
  showAnswers,
  clues,
  boardTitle,
  boardSize = 4,
  header,
  showHeader = false,
}: BingoWorksheetModuleProps) {
  const isTeacherMode = mode === 'teacher'
  const cellCount = getCellCount(clues, boardSize)
  const emptyAnswers = useMemo(() => createEmptyAnswerMap(clues), [clues])
  const emptyBoard = useMemo(() => createEmptyBoard(cellCount), [cellCount])
  const clueById = useMemo(() => new Map(clues.map((clue) => [clue.id, clue])), [clues])
  const clueIds = useMemo(() => new Set(clues.map((clue) => clue.id)), [clues])
  const answerIdByNormalizedAnswer = useMemo(
    () => new Map(clues.map((clue) => [normalizeAnswer(clue.answer), clue.id])),
    [clues],
  )
  const [answers, setAnswers] = usePersistentState<Record<string, string>>(
    `${storageKey}:answers`,
    emptyAnswers,
  )
  const [boardEntries, setBoardEntries] = usePersistentState<string[]>(
    `${storageKey}:board`,
    emptyBoard,
  )
  const [boardConfirmed, setBoardConfirmed] = usePersistentState<boolean>(
    `${storageKey}:confirmed`,
    false,
  )
  const [markedLineKeys, setMarkedLineKeys] = usePersistentState<string[]>(
    `${storageKey}:lines`,
    [],
  )
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const [draftLine, setDraftLine] = useState<DraftLine | null>(null)
  const [revealedClueIds, setRevealedClueIds] = useState<string[]>([])
  const [teacherDrawnIds, setTeacherDrawnIds] = useState<string[]>([])
  const [teacherCurrentCardId, setTeacherCurrentCardId] = useState<string | null>(null)
  const [teacherRouletteCardId, setTeacherRouletteCardId] = useState<string | null>(null)
  const [teacherRouletteActive, setTeacherRouletteActive] = useState(false)
  const [teacherDrawPopupOpen, setTeacherDrawPopupOpen] = useState(false)
  const boardRef = useRef<HTMLDivElement | null>(null)
  const teacherRouletteIntervalRef = useRef<number | null>(null)
  const teacherRouletteTimeoutRef = useRef<number | null>(null)

  const normalizedBoardEntries = useMemo(
    () =>
      normalizeStoredBoardEntries(
        boardEntries,
        cellCount,
        clueIds,
        answerIdByNormalizedAnswer,
      ),
    [answerIdByNormalizedAnswer, boardEntries, cellCount, clueIds],
  )
  const normalizedLineKeys = useMemo(
    () => normalizeStoredLineKeys(markedLineKeys, boardSize),
    [boardSize, markedLineKeys],
  )

  useEffect(() => {
    if (!areStringArraysEqual(boardEntries, normalizedBoardEntries)) {
      setBoardEntries(normalizedBoardEntries)
    }
  }, [boardEntries, normalizedBoardEntries, setBoardEntries])

  useEffect(() => {
    if (!areStringArraysEqual(markedLineKeys, normalizedLineKeys)) {
      setMarkedLineKeys(normalizedLineKeys)
    }
  }, [markedLineKeys, normalizedLineKeys, setMarkedLineKeys])

  useEffect(() => {
    return () => {
      if (teacherRouletteIntervalRef.current !== null) {
        window.clearInterval(teacherRouletteIntervalRef.current)
      }

      if (teacherRouletteTimeoutRef.current !== null) {
        window.clearTimeout(teacherRouletteTimeoutRef.current)
      }
    }
  }, [])

  const quiz = useQuizSubmission({
    itemIds: clues.map((clue) => clue.id),
    grade: () =>
      clues.reduce<Record<string, boolean>>((accumulator, clue) => {
        accumulator[clue.id] =
          normalizeAnswer(answers[clue.id] ?? '') === normalizeAnswer(clue.answer)
        return accumulator
      }, {}),
  })

  const allAnswersCorrect =
    quiz.submitted && quiz.correctCount === quiz.totalCount
  const visibleBoardEntries = allAnswersCorrect ? normalizedBoardEntries : emptyBoard
  const filledBoardCells = visibleBoardEntries.filter(Boolean).length
  const boardReadyToConfirm = allAnswersCorrect && filledBoardCells === cellCount
  const boardIsConfirmed = boardReadyToConfirm && boardConfirmed
  const boardPlacementLocked = !allAnswersCorrect || boardIsConfirmed
  const placedCardIds = useMemo(
    () => new Set(visibleBoardEntries.filter(Boolean)),
    [visibleBoardEntries],
  )
  const availableCards = useMemo(
    () =>
      allAnswersCorrect
        ? clues.filter((clue) => !placedCardIds.has(clue.id))
        : [],
    [allAnswersCorrect, clues, placedCardIds],
  )
  const selectedCardBoardIndex = selectedCardId
    ? visibleBoardEntries.indexOf(selectedCardId)
    : -1
  const renderedLineKeys = boardIsConfirmed ? normalizedLineKeys : []
  const remainingTeacherCards = useMemo(
    () => clues.filter((clue) => !teacherDrawnIds.includes(clue.id)),
    [clues, teacherDrawnIds],
  )
  const visibleTeacherCardId = teacherRouletteCardId ?? teacherCurrentCardId
  const visibleTeacherCard = visibleTeacherCardId
    ? clueById.get(visibleTeacherCardId)
    : undefined

  const clearInteractionState = () => {
    setSelectedCardId(null)
    setDraggingCardId(null)
    setDropTargetIndex(null)
    setDraftLine(null)
  }

  const clearBoardMarkings = () => {
    setBoardConfirmed(false)
    setMarkedLineKeys([])
    setDraftLine(null)
  }

  const updateAnswer = (clueId: string, value: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [clueId]: value,
    }))
  }

  const toggleClueReveal = (clueId: string) => {
    setRevealedClueIds((currentIds) =>
      currentIds.includes(clueId)
        ? currentIds.filter((currentId) => currentId !== clueId)
        : [...currentIds, clueId],
    )
  }

  const placeCardOnBoard = (clueId: string, index: number) => {
    if (boardPlacementLocked || !clueById.has(clueId)) {
      return
    }

    setBoardEntries((currentEntries) => {
      const nextEntries = normalizeStoredBoardEntries(
        currentEntries,
        cellCount,
        clueIds,
        answerIdByNormalizedAnswer,
      )
      const sourceIndex = nextEntries.indexOf(clueId)

      if (sourceIndex === index) {
        return nextEntries
      }

      const displacedCardId = nextEntries[index] ?? ''

      if (sourceIndex >= 0) {
        nextEntries[sourceIndex] =
          displacedCardId && sourceIndex !== index ? displacedCardId : ''
      }

      nextEntries[index] = clueId
      return nextEntries
    })

    clearBoardMarkings()
    clearInteractionState()
  }

  const returnCardToTray = (clueId: string) => {
    if (boardPlacementLocked) {
      return
    }

    setBoardEntries((currentEntries) => {
      const nextEntries = normalizeStoredBoardEntries(
        currentEntries,
        cellCount,
        clueIds,
        answerIdByNormalizedAnswer,
      )
      const sourceIndex = nextEntries.indexOf(clueId)

      if (sourceIndex === -1) {
        return nextEntries
      }

      nextEntries[sourceIndex] = ''
      return nextEntries
    })

    clearBoardMarkings()
    clearInteractionState()
  }

  const handleBoardCellClick = (index: number) => {
    if (boardPlacementLocked) {
      return
    }

    const occupantId = visibleBoardEntries[index] ?? ''

    if (!selectedCardId) {
      if (occupantId) {
        setSelectedCardId(occupantId)
      }

      return
    }

    if (occupantId === selectedCardId) {
      if (selectedCardBoardIndex >= 0) {
        returnCardToTray(selectedCardId)
        return
      }

      setSelectedCardId(null)
      return
    }

    placeCardOnBoard(selectedCardId, index)
  }

  const handleTrayClick = () => {
    if (boardPlacementLocked || !selectedCardId) {
      return
    }

    if (selectedCardBoardIndex >= 0) {
      returnCardToTray(selectedCardId)
      return
    }

    setSelectedCardId(null)
  }

  const beginCardDrag = (event: DragEvent<HTMLElement>, clueId: string) => {
    if (boardPlacementLocked) {
      return
    }

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(CARD_DRAG_TYPE, clueId)
    event.dataTransfer.setData('text/plain', clueId)
    setDraggingCardId(clueId)
    setSelectedCardId(clueId)
  }

  const resolveDraggedCardId = (event: DragEvent<HTMLElement>) => {
    const dragId =
      event.dataTransfer.getData(CARD_DRAG_TYPE) ||
      event.dataTransfer.getData('text/plain')

    return clueById.has(dragId) ? dragId : ''
  }

  const allowCardDrop = (event: DragEvent<HTMLElement>, index: number) => {
    if (boardPlacementLocked) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTargetIndex(index)
  }

  const handleCardDrop = (event: DragEvent<HTMLElement>, index: number) => {
    const clueId = resolveDraggedCardId(event)

    if (!clueId) {
      return
    }

    event.preventDefault()
    placeCardOnBoard(clueId, index)
  }

  const handleTrayDrop = (event: DragEvent<HTMLElement>) => {
    const clueId = resolveDraggedCardId(event)

    if (!clueId) {
      return
    }

    event.preventDefault()
    returnCardToTray(clueId)
  }

  const handleBoardPointerDown = (
    event: ReactPointerEvent<SVGSVGElement>,
  ) => {
    if (!boardIsConfirmed || !boardRef.current) {
      return
    }

    const nextPoint = getRelativePoint(
      event.clientX,
      event.clientY,
      boardRef.current.getBoundingClientRect(),
    )

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraftLine({
      pointerId: event.pointerId,
      start: nextPoint,
      end: nextPoint,
      startCellIndex: getCellIndexFromPoint(nextPoint, boardSize),
    })
  }

  const handleBoardPointerMove = (
    event: ReactPointerEvent<SVGSVGElement>,
  ) => {
    if (!draftLine || draftLine.pointerId !== event.pointerId || !boardRef.current) {
      return
    }

    const nextPoint = getRelativePoint(
      event.clientX,
      event.clientY,
      boardRef.current.getBoundingClientRect(),
    )

    setDraftLine((currentDraftLine) =>
      currentDraftLine && currentDraftLine.pointerId === event.pointerId
        ? { ...currentDraftLine, end: nextPoint }
        : currentDraftLine,
    )
  }

  const finishBoardLine = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!draftLine || draftLine.pointerId !== event.pointerId || !boardRef.current) {
      return
    }

    const nextPoint = getRelativePoint(
      event.clientX,
      event.clientY,
      boardRef.current.getBoundingClientRect(),
    )
    const lineKey = getBingoLineKeyFromCells(
      draftLine.startCellIndex,
      getCellIndexFromPoint(nextPoint, boardSize),
      boardSize,
    )

    if (
      lineKey &&
      isValidLineKey(lineKey, boardSize) &&
      !normalizedLineKeys.includes(lineKey)
    ) {
      setMarkedLineKeys((currentLineKeys) => [...currentLineKeys, lineKey])
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    setDraftLine(null)
  }

  const cancelBoardLine = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    setDraftLine(null)
  }

  const confirmBoard = () => {
    if (!boardReadyToConfirm) {
      return
    }

    clearInteractionState()
    setBoardConfirmed(true)
  }

  const undoLastMarkedLine = () => {
    setMarkedLineKeys((currentLineKeys) => currentLineKeys.slice(0, -1))
    setDraftLine(null)
  }

  const resetQuizAnswers = () => {
    setAnswers(emptyAnswers)
    setRevealedClueIds([])
    clearBoardMarkings()
    clearInteractionState()
    quiz.reset()
  }

  const resetAll = () => {
    if (teacherRouletteIntervalRef.current !== null) {
      window.clearInterval(teacherRouletteIntervalRef.current)
      teacherRouletteIntervalRef.current = null
    }

    if (teacherRouletteTimeoutRef.current !== null) {
      window.clearTimeout(teacherRouletteTimeoutRef.current)
      teacherRouletteTimeoutRef.current = null
    }

    setAnswers(emptyAnswers)
    setBoardEntries(emptyBoard)
    setRevealedClueIds([])
    setTeacherDrawnIds([])
    setTeacherCurrentCardId(null)
    setTeacherRouletteCardId(null)
    setTeacherRouletteActive(false)
    setTeacherDrawPopupOpen(false)
    clearBoardMarkings()
    clearInteractionState()
    quiz.reset()
  }

  const submitQuiz = () => {
    clearInteractionState()
    quiz.submit()
  }

  const drawTeacherCard = () => {
    if (teacherRouletteActive || remainingTeacherCards.length === 0) {
      return
    }

    setTeacherRouletteActive(true)
    const pool = remainingTeacherCards

    if (teacherRouletteIntervalRef.current !== null) {
      window.clearInterval(teacherRouletteIntervalRef.current)
    }

    if (teacherRouletteTimeoutRef.current !== null) {
      window.clearTimeout(teacherRouletteTimeoutRef.current)
    }

    teacherRouletteIntervalRef.current = window.setInterval(() => {
      const nextCard = pool[Math.floor(Math.random() * pool.length)]
      setTeacherRouletteCardId(nextCard?.id ?? null)
    }, 90)

    teacherRouletteTimeoutRef.current = window.setTimeout(() => {
      if (teacherRouletteIntervalRef.current !== null) {
        window.clearInterval(teacherRouletteIntervalRef.current)
        teacherRouletteIntervalRef.current = null
      }

      const chosenCard = pool[Math.floor(Math.random() * pool.length)]

      if (!chosenCard) {
        setTeacherRouletteCardId(null)
        setTeacherRouletteActive(false)
        return
      }

      setTeacherCurrentCardId(chosenCard.id)
      setTeacherDrawnIds((currentIds) => [...currentIds, chosenCard.id])
      setTeacherRouletteCardId(null)
      setTeacherRouletteActive(false)
      teacherRouletteTimeoutRef.current = null
    }, 1400)
  }

  const reshuffleTeacherCards = () => {
    if (teacherRouletteActive) {
      return
    }

    setTeacherDrawnIds([])
    setTeacherCurrentCardId(null)
    setTeacherRouletteCardId(null)
  }

  return (
    <section className="bingo-worksheet activity-module">
      <div className="bingo-worksheet__toolbar activity-module__toolbar">
        <button
          className="tiny-button"
          data-tone={isTeacherMode ? 'teacher' : undefined}
          onClick={resetAll}
          type="button"
        >
          전체 지우기
        </button>
      </div>

      <section className="bingo-sheet panel">
        {showHeader && header ? (
          <header className="bingo-sheet__hero">
            <div className="bingo-sheet__subject-row">
              <span className="bingo-sheet__subject">{header.subject}</span>
              <span className="bingo-sheet__unit">{header.unitTitle}</span>
              <span className="bingo-sheet__pages">{header.pageLabel}</span>
            </div>

            <div className="bingo-sheet__lesson-row">
              <div className="bingo-sheet__lesson-mark" aria-hidden="true">
                {header.subject}
              </div>
              <h3>{header.lessonTitle}</h3>
            </div>
          </header>
        ) : null}

        <section className="bingo-sheet__section">
          <div className="bingo-sheet__section-title">
            <span>1.</span>
            <p>초성 힌트를 보고 정답을 적어 보세요.</p>
          </div>

          <div className="bingo-sheet__table" data-complete={allAnswersCorrect}>
            {clues.map((clue, index) => {
              const answerVisible =
                isTeacherMode && (showAnswers || revealedClueIds.includes(clue.id))
              const inputState = quiz.submitted
                ? quiz.resultMap[clue.id]
                  ? 'correct'
                  : 'wrong'
                : undefined

              return (
                <div className="bingo-sheet__row" key={clue.id}>
                  <div className="bingo-sheet__number">{index + 1}</div>

                  <div className="bingo-sheet__prompt-cell">
                    <p className="bingo-sheet__prompt">
                      {renderPrompt(clue.prompt, clue.initials)}
                    </p>
                  </div>

                  <div className="bingo-sheet__input-cell">
                    <label className="bingo-sheet__sr-only" htmlFor={`clue-${clue.id}`}>
                      {index + 1}번 정답
                    </label>
                    <input
                      autoComplete="off"
                      className="bingo-sheet__answer-input"
                      data-state={inputState}
                      id={`clue-${clue.id}`}
                      onChange={(event) => updateAnswer(clue.id, event.target.value)}
                      placeholder={clue.initials}
                      spellCheck={false}
                      type="text"
                      value={answers[clue.id] ?? ''}
                    />
                    {isTeacherMode ? (
                      <button
                        className="tiny-button bingo-sheet__answer-toggle"
                        data-tone="teacher"
                        onClick={() => toggleClueReveal(clue.id)}
                        type="button"
                      >
                        {answerVisible ? '정답 숨김' : '정답 보기'}
                      </button>
                    ) : null}
                    {answerVisible ? (
                      <div className="bingo-sheet__teacher-answer bingo-sheet__teacher-answer--inline">
                        {clue.answer}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bingo-sheet__quiz-actions activity-module__footer">
            <button className="pill-button" onClick={submitQuiz} type="button">
              정답 제출
            </button>
            <button
              className="pill-button"
              data-tone="secondary"
              onClick={resetQuizAnswers}
              type="button"
            >
              다시 하기
            </button>
          </div>
        </section>

        <section className="bingo-sheet__section">
          <div className="bingo-sheet__section-title">
            <span>2.</span>
            <p>{boardTitle}</p>
          </div>

          {isTeacherMode ? (
            <>
              <div className="bingo-sheet__board-actions">
                <button
                  className="pill-button bingo-sheet__teacher-open-button"
                  disabled={teacherRouletteActive || remainingTeacherCards.length === 0}
                  onClick={() => setTeacherDrawPopupOpen(true)}
                  type="button"
                >
                  {teacherRouletteActive ? '카드 추첨 중' : '정답 카드 뽑기'}
                </button>
                <button
                  className="pill-button"
                  data-tone="secondary"
                  disabled={teacherRouletteActive}
                  hidden
                  onClick={reshuffleTeacherCards}
                  type="button"
                >
                  다시 섞기
                </button>
                <span className="bingo-sheet__board-status">
                  남은 카드 {remainingTeacherCards.length}장
                </span>
              </div>

              <div
                className="bingo-sheet__teacher-draw"
                data-open={teacherDrawPopupOpen}
                data-rolling={teacherRouletteActive}
                onClick={() => {
                  if (!teacherRouletteActive) {
                    setTeacherDrawPopupOpen(false)
                  }
                }}
                role="presentation"
              >
                <div
                  className="bingo-sheet__teacher-draw-stage"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="bingo-sheet__teacher-draw-label">현재 카드</span>
                  <div className="bingo-sheet__teacher-draw-card">
                    {visibleTeacherCard ? (
                      <strong>{visibleTeacherCard.answer}</strong>
                    ) : (
                      <span>카드를 뽑아 주세요.</span>
                    )}
                  </div>
                </div>

                <div
                  className="bingo-sheet__teacher-draw-history"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="bingo-sheet__card-tray-header">
                    <strong>뽑은 카드</strong>
                  </div>
                  <div className="bingo-sheet__teacher-popup-actions">
                    <button
                      className="pill-button"
                      disabled={teacherRouletteActive || remainingTeacherCards.length === 0}
                      onClick={drawTeacherCard}
                      type="button"
                    >
                      {teacherRouletteActive ? '카드 추첨 중' : '정답 카드 뽑기'}
                    </button>
                    <button
                      className="pill-button"
                      data-tone="secondary"
                      disabled={teacherRouletteActive}
                      onClick={reshuffleTeacherCards}
                      type="button"
                    >
                      다시 섞기
                    </button>
                    <button
                      className="tiny-button"
                      data-tone="secondary"
                      disabled={teacherRouletteActive}
                      onClick={() => setTeacherDrawPopupOpen(false)}
                      type="button"
                    >
                      닫기
                    </button>
                  </div>
                  <div className="bingo-sheet__card-bank">
                    {teacherDrawnIds.length > 0 ? (
                      teacherDrawnIds
                        .slice()
                        .reverse()
                        .map((clueId) => clueById.get(clueId))
                        .filter((clue): clue is BingoWorksheetClue => Boolean(clue))
                        .map((clue) => (
                          <div className="bingo-sheet__answer-card" key={clue.id}>
                            {clue.answer}
                          </div>
                        ))
                    ) : (
                      <p className="bingo-sheet__card-empty">
                        카드를 뽑으면 기록이 이곳에 쌓입니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bingo-sheet__board-actions">
                {boardReadyToConfirm && !boardIsConfirmed ? (
                  <button className="pill-button" onClick={confirmBoard} type="button">
                    빙고판 확정
                  </button>
                ) : null}
                {boardIsConfirmed ? (
                  <button
                    className="pill-button"
                    data-tone="secondary"
                    disabled={renderedLineKeys.length === 0}
                    onClick={undoLastMarkedLine}
                    type="button"
                  >
                    선 지우기
                  </button>
                ) : null}
                {boardIsConfirmed ? (
                  <span className="bingo-sheet__board-status">
                    완성한 줄을 표시하며 빙고를 확인해 보세요.
                  </span>
                ) : null}
              </div>

              <div
                className="bingo-sheet__board"
                data-confirmed={boardIsConfirmed}
                ref={boardRef}
                style={{ ['--bingo-size' as string]: String(boardSize) }}
              >
                {Array.from({ length: cellCount }, (_, index) => {
                  const clueId = visibleBoardEntries[index] ?? ''
                  const clue = clueId ? clueById.get(clueId) : undefined
                  const isSelected = clueId && selectedCardId === clueId

                  return (
                    <button
                      aria-label={`빙고 ${index + 1}칸`}
                      className="bingo-sheet__board-cell"
                      data-filled={Boolean(clue)}
                      data-locked={boardPlacementLocked}
                      data-selected={Boolean(isSelected)}
                      data-target={dropTargetIndex === index}
                      key={`board-${index}`}
                      onClick={() => handleBoardCellClick(index)}
                      onDragEnd={() => {
                        setDraggingCardId(null)
                        setDropTargetIndex(null)
                      }}
                      onDragEnter={(event) => allowCardDrop(event, index)}
                      onDragLeave={() => {
                        setDropTargetIndex((currentIndex) =>
                          currentIndex === index ? null : currentIndex,
                        )
                      }}
                      onDragOver={(event) => allowCardDrop(event, index)}
                      onDragStart={
                        clue
                          ? (event) => beginCardDrag(event, clue.id)
                          : undefined
                      }
                      onDrop={(event) => handleCardDrop(event, index)}
                      style={{
                        borderRight:
                          (index + 1) % boardSize === 0
                            ? '0'
                            : '1px solid rgba(63, 57, 53, 0.54)',
                        borderBottom:
                          index >= cellCount - boardSize
                            ? '0'
                            : '1px solid rgba(63, 57, 53, 0.54)',
                      }}
                      type="button"
                      draggable={Boolean(clue) && !boardPlacementLocked}
                    >
                      <span className="bingo-sheet__sr-only">빙고 {index + 1}칸</span>
                      {clue ? (
                        <span className="bingo-sheet__board-card-label">{clue.answer}</span>
                      ) : (
                        <span className="bingo-sheet__board-placeholder">
                          {boardIsConfirmed
                            ? '확정됨'
                            : allAnswersCorrect
                              ? selectedCardId
                                ? '여기에 놓기'
                                : '빈 칸'
                              : '카드 대기 중'}
                        </span>
                      )}
                    </button>
                  )
                })}

                <svg
                  aria-hidden="true"
                  className="bingo-sheet__board-overlay"
                  data-active={boardIsConfirmed || Boolean(draftLine)}
                  onPointerCancel={cancelBoardLine}
                  onPointerDown={handleBoardPointerDown}
                  onPointerMove={handleBoardPointerMove}
                  onPointerUp={finishBoardLine}
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  {renderedLineKeys.map((lineKey) => {
                    const line = getLineCoordinates(lineKey, boardSize)

                    return (
                      <line
                        className="bingo-sheet__board-line"
                        key={lineKey}
                        x1={line.x1 * 100}
                        x2={line.x2 * 100}
                        y1={line.y1 * 100}
                        y2={line.y2 * 100}
                      />
                    )
                  })}

                  {draftLine ? (
                    <line
                      className="bingo-sheet__board-line bingo-sheet__board-line--draft"
                      x1={draftLine.start.x * 100}
                      x2={draftLine.end.x * 100}
                      y1={draftLine.start.y * 100}
                      y2={draftLine.end.y * 100}
                    />
                  ) : null}
                </svg>
              </div>

              {boardIsConfirmed ? (
                <div className="bingo-sheet__card-tray bingo-sheet__card-tray--confirmed">
                  <div className="bingo-sheet__card-tray-header">
                    <strong>줄 표시 모드</strong>
                    <span>빙고판이 고정되었어요. 완성한 줄을 표시하며 확인해 보세요.</span>
                  </div>
                </div>
              ) : allAnswersCorrect ? (
                <div
                  className="bingo-sheet__card-tray"
                  data-active={selectedCardBoardIndex >= 0 || Boolean(draggingCardId)}
                  data-locked={boardPlacementLocked}
                  onClick={handleTrayClick}
                  onDragLeave={() => {
                    setDropTargetIndex(null)
                  }}
                  onDragOver={(event) => {
                    if (boardPlacementLocked) {
                      return
                    }

                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    setDropTargetIndex(null)
                  }}
                  onDrop={handleTrayDrop}
                  role="presentation"
                >
                  <div className="bingo-sheet__card-tray-header">
                    <strong>배치 카드</strong>
                    <span>
                      {availableCards.length > 0
                        ? '카드를 골라 빙고판에 배치해 보세요.'
                        : '모든 카드를 배치했어요. 빙고판 확정 버튼으로 보드를 고정할 수 있어요.'}
                    </span>
                  </div>

                  <div className="bingo-sheet__card-bank">
                    {availableCards.length > 0 ? (
                      availableCards.map((clue) => (
                        <button
                          className="bingo-sheet__answer-card"
                          data-selected={selectedCardId === clue.id}
                          key={clue.id}
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedCardId((currentId) =>
                              currentId === clue.id ? null : clue.id,
                            )
                          }}
                          onDragEnd={() => {
                            setDraggingCardId(null)
                            setDropTargetIndex(null)
                          }}
                          onDragStart={(event) => beginCardDrag(event, clue.id)}
                          type="button"
                          draggable={!boardPlacementLocked}
                        >
                          {clue.answer}
                        </button>
                      ))
                    ) : (
                      <p className="bingo-sheet__card-empty">
                        현재 남아 있는 카드가 없어요.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </section>
    </section>
  )
}
