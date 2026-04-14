import { useEffect, useMemo, useRef, useState } from 'react'
import { usePersistentState } from './usePersistentState'
import type { AppMode } from '../activities/types'

export type WorksheetMazeBlank = {
  id: string
  answer: string
  placeholder?: string
  widthCh?: number
}

export type WorksheetMazeSentenceGroup = {
  id: string
  title: string
  template: string[]
  blanks: WorksheetMazeBlank[]
  accentColor?: string
  softColor?: string
}

export type WorksheetMazeCoordinate = readonly [number, number]

export type WorksheetMazeModuleConfig = {
  sentenceGroups: WorksheetMazeSentenceGroup[]
  mazeRows: string[][]
  answerPath: WorksheetMazeCoordinate[]
  startCell?: WorksheetMazeCoordinate
  endCell?: WorksheetMazeCoordinate
  quizGuide?: string
  quizInitialMessage?: string
  quizSuccessMessage?: string
  retryMessage?: string
  mazeLockedGuide?: string
  mazeUnlockedGuide?: string
  mazeLockedMessage?: string
  mazeCompletedMessage?: string
  celebrationTitle?: string
  celebrationMessage?: string
  gradeButtonLabel?: string
  retryButtonLabel?: string
  resetMazeButtonLabel?: string
  restartAllButtonLabel?: string
  startLabel?: string
  endLabel?: string
}

type WorksheetMazeModuleProps = WorksheetMazeModuleConfig & {
  mode: AppMode
  showAnswers: boolean
  storageKey: string
}

type GroupVisualState = 'correct' | 'wrong' | 'active'

const CHOSEONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, '').trim().toLowerCase()
}

function isCorrectAnswer(inputValue: string, answer: string) {
  return normalizeAnswer(inputValue) === normalizeAnswer(answer)
}

function getChoseongHint(text: string) {
  return [...text]
    .map((character) => {
      if (character === ' ') {
        return ' '
      }

      const code = character.charCodeAt(0)

      if (code >= 0xac00 && code <= 0xd7a3) {
        return CHOSEONG[Math.floor((code - 0xac00) / 588)]
      }

      return character
    })
    .join('')
}

function getFirstLetterHint(text: string) {
  const characters = [...text]
  const firstVisibleIndex = characters.findIndex((character) => character.trim())

  if (firstVisibleIndex < 0) {
    return ''
  }

  const firstCharacter = characters[firstVisibleIndex]
  const tailHint = getChoseongHint(characters.slice(firstVisibleIndex + 1).join('')).replace(
    /\s+/g,
    '',
  )

  return `${firstCharacter}${tailHint}`
}

function createEmptyAnswers(groups: WorksheetMazeSentenceGroup[]) {
  return groups.reduce<Record<string, string>>((accumulator, group) => {
    group.blanks.forEach((blank) => {
      accumulator[blank.id] = ''
    })
    return accumulator
  }, {})
}

function getFullSentence(group: WorksheetMazeSentenceGroup) {
  return group.template.reduce((sentence, chunk, index) => {
    const blank = group.blanks[index]
    return `${sentence}${chunk}${blank?.answer ?? ''}`
  }, '')
}

function getCoordinateKey([row, col]: WorksheetMazeCoordinate) {
  return `${row}:${col}`
}

export function WorksheetMazeModule({
  sentenceGroups,
  mazeRows,
  answerPath,
  startCell = [0, 0],
  endCell = [mazeRows.length - 1, mazeRows[0]?.length ? mazeRows[0].length - 1 : 0],
  quizGuide = '1회 오답은 초성, 2회 오답은 첫 글자가 보입니다.',
  quizInitialMessage = '문장을 모두 완성하면 아래 미로가 열립니다.',
  quizSuccessMessage = '문장을 모두 완성했어요. 이제 미로에서 순서를 직접 찾아 보세요.',
  retryMessage = '완성되지 않은 칸만 비웠어요.',
  mazeLockedGuide = '퀴즈를 모두 맞히면 출발부터 도착까지 정답 순서대로 칸을 눌러 길을 만들 수 있어요.',
  mazeUnlockedGuide = '다음 칸은 표시되지 않습니다. 정답 순서를 떠올리며 눌러 보세요.',
  mazeLockedMessage = '아직 미로가 잠겨 있습니다.',
  mazeCompletedMessage = '미로를 모두 완성했어요.',
  celebrationTitle = '미로 탈출 성공',
  celebrationMessage = '모든 정답을 찾아 미로를 완성했습니다.',
  gradeButtonLabel = '채점',
  retryButtonLabel = '오답 비우기',
  resetMazeButtonLabel = '미로 처음부터',
  restartAllButtonLabel = '처음부터 다시 하기',
  startLabel = '출발',
  endLabel = '도착',
  mode,
  showAnswers,
  storageKey,
}: WorksheetMazeModuleProps) {
  const blankList = useMemo(
    () => sentenceGroups.flatMap((group) => group.blanks),
    [sentenceGroups],
  )
  const emptyAnswers = useMemo(() => createEmptyAnswers(sentenceGroups), [sentenceGroups])
  const [answers, setAnswers] = usePersistentState<Record<string, string>>(
    `${storageKey}:answers`,
    emptyAnswers,
  )
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({})
  const [groupStates, setGroupStates] = useState<Partial<Record<string, GroupVisualState>>>({})
  const [revealedGroupIds, setRevealedGroupIds] = useState<string[]>([])
  const [quizPassed, setQuizPassed] = useState(false)
  const [quizMessage, setQuizMessage] = useState(quizInitialMessage)
  const [currentPathIndex, setCurrentPathIndex] = useState(0)
  const [mazeNotice, setMazeNotice] = useState<string | null>(null)
  const [mazeErrorKey, setMazeErrorKey] = useState<string | null>(null)
  const mazeGridRef = useRef<HTMLDivElement | null>(null)
  const mazePathRef = useRef<SVGSVGElement | null>(null)

  const pathSequence = useMemo(
    () => [startCell, ...answerPath, endCell],
    [answerPath, endCell, startCell],
  )
  const mazeStages = useMemo(
    () => [
      { label: startLabel, length: 1 },
      ...blankList.map((blank) => ({
        label: blank.answer,
        length: Math.max(normalizeAnswer(blank.answer).length, 1),
      })),
      { label: endLabel, length: 1 },
    ],
    [blankList, endLabel, startLabel],
  )
  const correctGroupCount = useMemo(
    () =>
      sentenceGroups.filter((group) =>
        group.blanks.every((blank) => isCorrectAnswer(answers[blank.id] ?? '', blank.answer)),
      ).length,
    [answers, sentenceGroups],
  )
  const isTeacherAnswerMode = mode === 'teacher' && showAnswers
  const isMazeUnlocked = quizPassed || isTeacherAnswerMode
  const mazeCompleted = currentPathIndex >= pathSequence.length
  const visitedKeys = useMemo(
    () =>
      new Set(
        pathSequence.slice(0, Math.min(currentPathIndex, pathSequence.length)).map(getCoordinateKey),
      ),
    [currentPathIndex, pathSequence],
  )
  const pathTotal = Math.max(pathSequence.length - 1, 0)

  useEffect(() => {
    if (isMazeUnlocked) {
      setMazeNotice(null)
      return
    }

    setCurrentPathIndex(0)
    setMazeErrorKey(null)
    setMazeNotice(null)
  }, [isMazeUnlocked])

  useEffect(() => {
    const drawPath = () => {
      const mazeGridElement = mazeGridRef.current
      const mazePathElement = mazePathRef.current

      if (!mazeGridElement || !mazePathElement) {
        return
      }

      mazePathElement.innerHTML = ''

      if (currentPathIndex <= 1) {
        return
      }

      const points = pathSequence
        .slice(0, currentPathIndex)
        .map(([row, col]) => {
          const cell = mazeGridElement.querySelector<HTMLButtonElement>(
            `[data-row="${row}"][data-col="${col}"]`,
          )

          if (!cell) {
            return null
          }

          const wrapperRect = mazeGridElement.getBoundingClientRect()
          const cellRect = cell.getBoundingClientRect()

          return `${cellRect.left - wrapperRect.left + cellRect.width / 2},${
            cellRect.top - wrapperRect.top + cellRect.height / 2
          }`
        })
        .filter((point): point is string => point !== null)
        .join(' ')

      if (!points) {
        return
      }

      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
      polyline.setAttribute('points', points)
      mazePathElement.append(polyline)
    }

    drawPath()
    window.addEventListener('resize', drawPath)

    return () => {
      window.removeEventListener('resize', drawPath)
    }
  }, [currentPathIndex, pathSequence])

  const getGroupFeedback = (group: WorksheetMazeSentenceGroup) => {
    const hasValue = group.blanks.some((blank) => (answers[blank.id] ?? '').trim())
    const isCorrect = group.blanks.every((blank) =>
      isCorrectAnswer(answers[blank.id] ?? '', blank.answer),
    )

    return {
      hasValue,
      isCorrect,
    }
  }

  const getHintMessage = (blank: WorksheetMazeBlank) => {
    if (isCorrectAnswer(answers[blank.id] ?? '', blank.answer)) {
      return ''
    }

    const attempts = wrongAttempts[blank.id] ?? 0

    if (attempts <= 0) {
      return ''
    }

    if (attempts === 1) {
      return getChoseongHint(blank.answer)
    }

    return getFirstLetterHint(blank.answer)
  }

  const getStageForIndex = (pathIndex: number) => {
    let totalLength = 0

    for (const stage of mazeStages) {
      totalLength += stage.length

      if (pathIndex < totalLength) {
        return stage.label
      }
    }

    return endLabel
  }

  const resetMazeState = () => {
    setCurrentPathIndex(0)
    setMazeErrorKey(null)
    setMazeNotice(null)
  }

  const updateAnswer = (group: WorksheetMazeSentenceGroup, blankId: string, value: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [blankId]: value,
    }))

    const nextAnswers = {
      ...answers,
      [blankId]: value,
    }
    const hasValue = group.blanks.some((blank) => (nextAnswers[blank.id] ?? '').trim())
    const isCorrect = group.blanks.every((blank) =>
      isCorrectAnswer(nextAnswers[blank.id] ?? '', blank.answer),
    )

    setGroupStates((currentStates) => ({
      ...currentStates,
      [group.id]: isCorrect ? 'correct' : hasValue ? 'active' : undefined,
    }))
  }

  const toggleRevealGroup = (groupId: string) => {
    setRevealedGroupIds((currentIds) =>
      currentIds.includes(groupId)
        ? currentIds.filter((currentId) => currentId !== groupId)
        : [...currentIds, groupId],
    )
  }

  const gradeQuiz = () => {
    const nextWrongAttempts = { ...wrongAttempts }
    const nextGroupStates: Partial<Record<string, GroupVisualState>> = {}
    let nextCorrectGroupCount = 0

    sentenceGroups.forEach((group) => {
      const { hasValue, isCorrect } = getGroupFeedback(group)

      group.blanks.forEach((blank) => {
        if (!isCorrectAnswer(answers[blank.id] ?? '', blank.answer)) {
          nextWrongAttempts[blank.id] = (nextWrongAttempts[blank.id] ?? 0) + 1
        }
      })

      if (isCorrect) {
        nextCorrectGroupCount += 1
        nextGroupStates[group.id] = 'correct'
      } else if (hasValue) {
        nextGroupStates[group.id] = 'wrong'
      }
    })

    const completed = nextCorrectGroupCount === sentenceGroups.length

    setWrongAttempts(nextWrongAttempts)
    setGroupStates(nextGroupStates)
    setQuizPassed(completed)
    setQuizMessage(
      completed
        ? quizSuccessMessage
        : `${sentenceGroups.length - nextCorrectGroupCount}개 문장이 남았어요. ${quizGuide}`,
    )

    if (!completed) {
      resetMazeState()
    }
  }

  const retryWrongAnswers = () => {
    const nextAnswers = { ...answers }
    const nextGroupStates: Partial<Record<string, GroupVisualState>> = {}

    sentenceGroups.forEach((group) => {
      const isCorrect = group.blanks.every((blank) =>
        isCorrectAnswer(answers[blank.id] ?? '', blank.answer),
      )

      if (isCorrect) {
        nextGroupStates[group.id] = 'correct'
        return
      }

      group.blanks.forEach((blank) => {
        if (!isCorrectAnswer(answers[blank.id] ?? '', blank.answer)) {
          nextAnswers[blank.id] = ''
        }
      })
    })

    setAnswers(nextAnswers)
    setGroupStates(nextGroupStates)
    setQuizPassed(false)
    setQuizMessage(retryMessage)
    resetMazeState()
  }

  const restartAll = () => {
    setAnswers(emptyAnswers)
    setWrongAttempts({})
    setGroupStates({})
    setRevealedGroupIds([])
    setQuizPassed(false)
    setQuizMessage(quizInitialMessage)
    resetMazeState()
  }

  const handleMazeClick = (row: number, col: number) => {
    if (!isMazeUnlocked || mazeCompleted) {
      return
    }

    const expectedCoordinate = pathSequence[currentPathIndex]

    if (!expectedCoordinate) {
      return
    }

    const [expectedRow, expectedCol] = expectedCoordinate

    if (row === expectedRow && col === expectedCol) {
      const nextPathIndex = currentPathIndex + 1
      setCurrentPathIndex(nextPathIndex)
      setMazeErrorKey(null)
      setMazeNotice(
        nextPathIndex >= pathSequence.length
          ? mazeCompletedMessage
          : `${getStageForIndex(nextPathIndex)} 순서로 이어 가세요.`,
      )
      return
    }

    setMazeErrorKey(`${row}:${col}`)
    setMazeNotice('지금 차례의 칸이 아니에요.')
    window.setTimeout(() => {
      setMazeErrorKey((currentKey) => (currentKey === `${row}:${col}` ? null : currentKey))
    }, 320)
  }

  const mazeGuide = isMazeUnlocked ? mazeUnlockedGuide : mazeLockedGuide
  const mazeMessage = mazeNotice ?? (isMazeUnlocked ? '출발부터 시작하세요.' : mazeLockedMessage)
  const targetLabel = isMazeUnlocked
    ? mazeCompleted
      ? endLabel
      : getStageForIndex(currentPathIndex)
    : '퀴즈를 먼저 끝내 주세요'

  return (
    <div className="worksheet-maze activity-module">
      <section className="worksheet-maze__panel panel">
        <header className="worksheet-maze__panel-head">
          <div>
            <p className="worksheet-maze__step-label">1단계</p>
            <h3>문장을 완성해 보세요</h3>
          </div>
          <div className="worksheet-maze__score" aria-live="polite">
            <span>완성 문장</span>
            <strong>
              {correctGroupCount} / {sentenceGroups.length}
            </strong>
          </div>
        </header>

        <div className="worksheet-maze__progress" aria-hidden="true">
          <div
            className="worksheet-maze__progress-bar"
            style={{ width: `${(correctGroupCount / sentenceGroups.length) * 100}%` }}
          />
        </div>

        <p className="worksheet-maze__guide">{quizGuide}</p>

        <div className="worksheet-maze__group-list">
          {sentenceGroups.map((group) => {
            const visualState = groupStates[group.id]
            const answerVisible = mode === 'teacher' && (showAnswers || revealedGroupIds.includes(group.id))

            return (
              <article
                key={group.id}
                className="worksheet-maze__group"
                data-state={visualState}
                style={{
                  ['--worksheet-maze-accent' as string]: group.accentColor ?? '#ca6b42',
                  ['--worksheet-maze-soft' as string]:
                    group.softColor ?? 'rgba(202, 107, 66, 0.11)',
                }}
              >
                <div className="worksheet-maze__group-top">
                  <div className="worksheet-maze__group-tag">
                    <span className="worksheet-maze__group-dot" aria-hidden="true" />
                    <strong>{group.title}</strong>
                  </div>
                  <div className="worksheet-maze__group-tools">
                    <span className="worksheet-maze__group-status">
                      {visualState === 'correct'
                        ? '완성'
                        : visualState === 'wrong'
                          ? '다시'
                          : visualState === 'active'
                            ? '입력 중'
                            : '미완성'}
                    </span>
                    {mode === 'teacher' ? (
                      <button
                        className="tiny-button"
                        data-tone="teacher"
                        onClick={() => toggleRevealGroup(group.id)}
                        type="button"
                      >
                        {answerVisible ? '정답 숨기기' : '정답 보기'}
                      </button>
                    ) : null}
                  </div>
                </div>

                <p className="worksheet-maze__sentence">
                  {group.template.map((chunk, index) => {
                    const blank = group.blanks[index]

                    if (!blank) {
                      return <span key={`${group.id}-chunk-${index}`}>{chunk}</span>
                    }

                    const hintMessage = getHintMessage(blank)
                    const widthCh =
                      blank.widthCh ?? Math.max(normalizeAnswer(blank.answer).length, 2) + 1

                    return (
                      <span key={blank.id}>
                        <span>{chunk}</span>
                        <span className="worksheet-maze__blank-slot">
                          <span className="worksheet-maze__blank-hint" aria-live="polite">
                            {hintMessage}
                          </span>
                          <input
                            aria-label={`${group.title} 빈칸 ${index + 1}`}
                            autoComplete="off"
                            className="worksheet-maze__input"
                            onChange={(event) => updateAnswer(group, blank.id, event.target.value)}
                            placeholder={blank.placeholder}
                            spellCheck={false}
                            style={{ ['--blank-ch' as string]: String(widthCh) }}
                            type="text"
                            value={answers[blank.id] ?? ''}
                          />
                        </span>
                      </span>
                    )
                  })}
                </p>

                {answerVisible ? (
                  <p className="worksheet-maze__teacher-answer">정답: {getFullSentence(group)}</p>
                ) : null}
              </article>
            )
          })}
        </div>

        <div className="worksheet-maze__actions">
          <button className="pill-button" onClick={gradeQuiz} type="button">
            {gradeButtonLabel}
          </button>
          <button className="pill-button" data-tone="secondary" onClick={retryWrongAnswers} type="button">
            {retryButtonLabel}
          </button>
        </div>

        <p className="worksheet-maze__message" aria-live="polite">
          {quizMessage}
        </p>
      </section>

      <section className="worksheet-maze__panel panel" data-locked={!isMazeUnlocked}>
        <header className="worksheet-maze__panel-head">
          <div>
            <p className="worksheet-maze__step-label">2단계</p>
            <h3>정답 순서로 미로를 풀어요</h3>
          </div>
          <div className="worksheet-maze__badge" data-open={isMazeUnlocked}>
            {isMazeUnlocked ? '열림' : '잠금'}
          </div>
        </header>

        <div className="worksheet-maze__mission">
          <p className="worksheet-maze__guide">{mazeGuide}</p>
          <div className="worksheet-maze__mission-cards">
            <div className="worksheet-maze__mission-card">
              <span>지금 찾을 말</span>
              <strong>{targetLabel}</strong>
            </div>
            <div className="worksheet-maze__mission-card">
              <span>진행</span>
              <strong>
                {Math.min(currentPathIndex, pathTotal)} / {pathTotal}칸
              </strong>
            </div>
          </div>
        </div>

        <div className="worksheet-maze__maze-wrap">
          <svg className="worksheet-maze__path" ref={mazePathRef} aria-hidden="true" />
          <div
            ref={mazeGridRef}
            className="worksheet-maze__grid"
            role="grid"
            aria-label="정답 순서 미로"
            style={{ gridTemplateColumns: `repeat(${mazeRows[0]?.length ?? 1}, minmax(0, 1fr))` }}
          >
            {mazeRows.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const coordinateKey = getCoordinateKey([rowIndex, colIndex])
                const isStartCell = rowIndex === startCell[0] && colIndex === startCell[1]
                const isEndCell = rowIndex === endCell[0] && colIndex === endCell[1]

                return (
                  <button
                    key={coordinateKey}
                    type="button"
                    className="worksheet-maze__cell"
                    data-row={rowIndex}
                    data-col={colIndex}
                    data-visited={visitedKeys.has(coordinateKey)}
                    data-wrong={mazeErrorKey === coordinateKey}
                    data-end={isEndCell}
                    data-start={isStartCell}
                    disabled={!isMazeUnlocked}
                    onClick={() => handleMazeClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </button>
                )
              }),
            )}
          </div>
        </div>

        <div className="worksheet-maze__actions">
          <button
            className="pill-button"
            onClick={() => {
              if (!isMazeUnlocked) {
                setMazeNotice('먼저 문장을 모두 완성해 주세요.')
                return
              }

              resetMazeState()
            }}
            type="button"
          >
            {resetMazeButtonLabel}
          </button>
        </div>

        <p className="worksheet-maze__message" aria-live="polite">
          {mazeMessage}
        </p>
      </section>

      {mazeCompleted ? (
        <section className="worksheet-maze__panel worksheet-maze__panel--celebration panel">
          <p className="worksheet-maze__step-label">완료</p>
          <h3>{celebrationTitle}</h3>
          <p className="worksheet-maze__message">{celebrationMessage}</p>
          <div className="worksheet-maze__actions">
            <button className="pill-button" onClick={restartAll} type="button">
              {restartAllButtonLabel}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
