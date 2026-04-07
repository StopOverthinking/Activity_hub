import { useMemo } from 'react'
import { usePersistentState } from './usePersistentState'
import { useQuizSubmission } from './useQuizSubmission'
import type { AppMode } from '../activities/types'

export type BingoWorksheetClue = {
  id: string
  prompt: string
  initials: string
  answer: string
}

type BingoWorksheetHeader = {
  subject: string
  unitTitle: string
  pageLabel: string
  lessonTitle: string
}

type BingoWorksheetModuleProps = {
  storageKey: string
  mode: AppMode
  showAnswers: boolean
  clues: BingoWorksheetClue[]
  boardTitle: string
  boardDescription: string
  boardSize?: number
  header?: BingoWorksheetHeader
  showHeader?: boolean
}

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
  boardDescription,
  boardSize = 4,
  header,
  showHeader = false,
}: BingoWorksheetModuleProps) {
  const cellCount = getCellCount(clues, boardSize)
  const emptyAnswers = useMemo(() => createEmptyAnswerMap(clues), [clues])
  const emptyBoard = useMemo(() => createEmptyBoard(cellCount), [cellCount])
  const [answers, setAnswers] = usePersistentState<Record<string, string>>(
    `${storageKey}:answers`,
    emptyAnswers,
  )
  const [boardEntries, setBoardEntries] = usePersistentState<string[]>(
    `${storageKey}:board`,
    emptyBoard,
  )

  const quiz = useQuizSubmission({
    itemIds: clues.map((clue) => clue.id),
    grade: () =>
      clues.reduce<Record<string, boolean>>((accumulator, clue) => {
        accumulator[clue.id] =
          normalizeAnswer(answers[clue.id] ?? '') === normalizeAnswer(clue.answer)
        return accumulator
      }, {}),
  })

  const answeredClues = clues.filter((clue) => (answers[clue.id] ?? '').trim()).length
  const filledBoardCells = boardEntries.filter((value) => value.trim()).length

  const updateAnswer = (clueId: string, value: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [clueId]: value,
    }))
  }

  const updateBoardEntry = (index: number, value: string) => {
    setBoardEntries((currentEntries) =>
      currentEntries.map((entry, entryIndex) =>
        entryIndex === index ? value : entry,
      ),
    )
  }

  const resetQuizAnswers = () => {
    setAnswers(emptyAnswers)
    quiz.reset()
  }

  const resetAll = () => {
    setAnswers(emptyAnswers)
    setBoardEntries(emptyBoard)
    quiz.reset()
  }

  return (
    <section className="bingo-worksheet">
      <div className="bingo-worksheet__toolbar">
        <div className="bingo-worksheet__toolbar-meta">
          <span className="chip">{answeredClues} / {clues.length} 문제 입력</span>
          {quiz.submitted ? (
            <span
              className="chip"
              data-tone={quiz.correctCount === quiz.totalCount ? 'success' : 'danger'}
            >
              {quiz.correctCount} / {quiz.totalCount}
            </span>
          ) : null}
          <span className="chip">{filledBoardCells} / {cellCount} 빙고칸 입력</span>
          {mode === 'teacher' && showAnswers ? (
            <span className="chip" data-tone="teacher">
              정답 표시
            </span>
          ) : null}
        </div>

        <button
          className="tiny-button"
          data-tone={mode === 'teacher' ? 'teacher' : undefined}
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
            <p>배운 내용을 생각하며 초성에 알맞은 답을 써 보세요.</p>
          </div>

          <div
            className="bingo-sheet__table"
            data-answer-column={mode === 'teacher' && showAnswers}
          >
            {clues.map((clue, index) => {
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
                  </div>

                  {mode === 'teacher' && showAnswers ? (
                    <div className="bingo-sheet__teacher-answer">{clue.answer}</div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="bingo-sheet__quiz-actions">
            <button className="pill-button" onClick={quiz.submit} type="button">
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

          <p className="bingo-sheet__section-note">{boardDescription}</p>

          <div
            className="bingo-sheet__board"
            style={{ ['--bingo-size' as string]: String(boardSize) }}
          >
            {Array.from({ length: cellCount }, (_, index) => (
              <label
                className="bingo-sheet__board-cell"
                key={`board-${index}`}
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
              >
                <span className="bingo-sheet__sr-only">빙고 {index + 1}칸</span>
                <input
                  autoComplete="off"
                  className="bingo-sheet__board-input"
                  onChange={(event) => updateBoardEntry(index, event.target.value)}
                  spellCheck={false}
                  type="text"
                  value={boardEntries[index] ?? ''}
                />
              </label>
            ))}
          </div>

          {mode === 'teacher' && showAnswers ? (
            <div className="bingo-sheet__answer-bank">
              {clues.map((clue) => (
                <span className="chip" data-tone="teacher" key={clue.id}>
                  {clue.answer}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </section>
  )
}
