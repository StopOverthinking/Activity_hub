import { useMemo, useState } from 'react'
import { LineMatchBoard } from './LineMatchBoard'
import { usePersistentState } from './usePersistentState'
import type { AppMode } from '../activities/types'

export type LineMatchItem = {
  id: string
  marker: string
  label: string
}

export type LineMatchWorksheetModuleConfig = {
  instruction: string
  leftItems: LineMatchItem[]
  rightItems: LineMatchItem[]
  answerMap: Record<string, string>
  clearLabel?: string
  matchedCountSuffix?: string
}

type LineMatchWorksheetModuleProps = LineMatchWorksheetModuleConfig & {
  headingNumber: number | string
  mode: AppMode
  showAnswers: boolean
  storageKey: string
}

export function LineMatchWorksheetModule({
  headingNumber,
  instruction,
  leftItems,
  rightItems,
  answerMap,
  clearLabel = '모두 지우기',
  matchedCountSuffix = '개 연결',
  mode,
  showAnswers,
  storageKey,
}: LineMatchWorksheetModuleProps) {
  const [matches, setMatches] = usePersistentState<Record<string, string>>(
    `${storageKey}:matches`,
    {},
  )
  const [revealedMatchIds, setRevealedMatchIds] = useState<string[]>([])
  const matchedCount = useMemo(() => Object.keys(matches).length, [matches])

  const revealMatchAnswer = (id: string) => {
    setRevealedMatchIds((currentIds) =>
      currentIds.includes(id) ? currentIds : [...currentIds, id],
    )
  }

  const clearMatches = () => {
    setMatches({})
    setRevealedMatchIds([])
  }

  return (
    <div className="worksheet-match">
      <div className="worksheet-heading">
        <span className="worksheet-heading__index">{headingNumber}</span>
        <p>{instruction}</p>
      </div>
      <div className="worksheet-match__meta">
        <span className="chip">
          {matchedCount}
          {matchedCountSuffix}
        </span>
        {showAnswers ? (
          <span className="chip" data-tone="teacher">
            정답 전체 공개
          </span>
        ) : null}
        <button
          className="tiny-button"
          onClick={clearMatches}
          type="button"
        >
          {clearLabel}
        </button>
      </div>
      <div className="worksheet-match__board">
        <LineMatchBoard
          answerMap={answerMap}
          leftItems={leftItems}
          onChange={setMatches}
          onLeftItemClick={mode === 'teacher' ? revealMatchAnswer : undefined}
          revealAnswer={showAnswers}
          revealedAnswerIds={revealedMatchIds}
          rightItems={rightItems}
          value={matches}
        />
      </div>
    </div>
  )
}
