import { useEffect, useMemo, useRef, useState } from 'react'
import { usePersistentState } from './usePersistentState'
import { useQuizSubmission } from './useQuizSubmission'

export const IMAGE_TEXT_HYBRID_QUIZ_MODULE_NAME = '이미지/텍스트 병용 퀴즈'

type HybridTextPrompt = {
  id: string
  label: string
  placeholder: string
  answers: string[]
}

type StockImageOption = {
  id: string
  label: string
  src: string
}

export type HybridQuizRow = {
  id: string
  periodLabel: string
  summary: string
  prompts: HybridTextPrompt[]
  stockImages: StockImageOption[]
}

type ImageSelection = {
  kind: 'none' | 'upload' | 'stock' | 'url'
  src: string
  label: string
}

type ImageTextHybridQuizModuleProps = {
  storageKey: string
  rows: HybridQuizRow[]
  showAnswers: boolean
}

function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, '').replace(/[,.!?]/g, '').toLowerCase()
}

function isCorrectAnswer(inputValue: string, answers: string[]) {
  const normalizedInput = normalizeAnswer(inputValue)
  return answers.some((answer) => normalizeAnswer(answer) === normalizedInput)
}

function getRowItemIds(row: HybridQuizRow) {
  return [
    ...row.prompts.map((prompt) => `text:${prompt.id}`),
    `image:${row.id}`,
  ]
}

export function ImageTextHybridQuizModule({
  storageKey,
  rows,
  showAnswers,
}: ImageTextHybridQuizModuleProps) {
  const [textAnswers, setTextAnswers] = usePersistentState<Record<string, string>>(
    `${storageKey}:text`,
    {},
  )
  const [imageSelections, setImageSelections] = useState<
    Record<string, ImageSelection | undefined>
  >({})
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({})
  const latestImageSelectionsRef = useRef(imageSelections)
  
  useEffect(() => {
    latestImageSelectionsRef.current = imageSelections
  }, [imageSelections])

  useEffect(() => {
    return () => {
      Object.values(latestImageSelectionsRef.current).forEach((selection) => {
        if (selection?.kind === 'upload') {
          URL.revokeObjectURL(selection.src)
        }
      })
    }
  }, [])

  const itemIds = useMemo(
    () => rows.flatMap((row) => getRowItemIds(row)),
    [rows],
  )

  const quiz = useQuizSubmission({
    itemIds,
    grade: () => {
      const resultMap: Record<string, boolean> = {}

      rows.forEach((row) => {
        row.prompts.forEach((prompt) => {
          resultMap[`text:${prompt.id}`] = isCorrectAnswer(
            textAnswers[prompt.id] ?? '',
            prompt.answers,
          )
        })

        const imageSelection = imageSelections[row.id]
        resultMap[`image:${row.id}`] = Boolean(imageSelection?.src)
      })

      return resultMap
    },
  })

  const setImageSelection = (rowId: string, nextSelection: ImageSelection) => {
    setImageSelections((currentSelections) => {
      const previousSelection = currentSelections[rowId]

      if (
        previousSelection?.kind === 'upload' &&
        previousSelection.src !== nextSelection.src
      ) {
        URL.revokeObjectURL(previousSelection.src)
      }

      return {
        ...currentSelections,
        [rowId]: nextSelection,
      }
    })
  }

  const clearImageSelection = (rowId: string) => {
    setImageSelections((currentSelections) => {
      const previousSelection = currentSelections[rowId]

      if (previousSelection?.kind === 'upload') {
        URL.revokeObjectURL(previousSelection.src)
      }

      return {
        ...currentSelections,
        [rowId]: undefined,
      }
    })
  }

  const updateTextAnswer = (promptId: string, value: string) => {
    setTextAnswers((currentAnswers) => ({
      ...currentAnswers,
      [promptId]: value,
    }))
  }

  const updateUrlInput = (rowId: string, value: string) => {
    setUrlInputs((currentInputs) => ({
      ...currentInputs,
      [rowId]: value,
    }))
  }

  const applyCustomUrl = (rowId: string) => {
    const nextUrl = (urlInputs[rowId] ?? '').trim()
    if (!nextUrl) {
      return
    }

    setImageSelection(rowId, {
      kind: 'url',
      src: nextUrl,
      label: '직접 입력',
    })
  }

  const handleUpload = (rowId: string, file: File | null) => {
    if (!file) {
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setImageSelection(rowId, {
      kind: 'upload',
      src: objectUrl,
      label: file.name,
    })
  }

  const resetAll = () => {
    Object.values(latestImageSelectionsRef.current).forEach((selection) => {
      if (selection?.kind === 'upload') {
        URL.revokeObjectURL(selection.src)
      }
    })

    setTextAnswers({})
    setImageSelections({})
    setUrlInputs({})
    quiz.reset()
  }

  return (
    <section className="hybrid-quiz">
      <header className="hybrid-quiz__header">
        <span className="chip">{IMAGE_TEXT_HYBRID_QUIZ_MODULE_NAME}</span>
        <p>
          각 시기의 핵심 키워드를 입력하고, 그림 칸은 사진 업로드 또는 스톡
          이미지 삽입으로 채워 보세요.
        </p>
      </header>

      <div className="hybrid-quiz__score-row">
        <span className="chip">
          {quiz.correctCount} / {quiz.totalCount}
        </span>
        {quiz.submitted ? (
          <span
            className="chip"
            data-tone={quiz.correctCount === quiz.totalCount ? 'success' : 'danger'}
          >
            {quiz.correctCount === quiz.totalCount ? '모두 정답' : '다시 확인'}
          </span>
        ) : null}
      </div>

      <div className="hybrid-quiz__rows">
        {rows.map((row) => {
          const rowItemIds = getRowItemIds(row)
          const rowCorrect =
            quiz.submitted &&
            rowItemIds.every((itemId) => quiz.resultMap[itemId] === true)
          const selectedImage = imageSelections[row.id]

          return (
            <article className="hybrid-quiz-row panel" key={row.id}>
              <div className="hybrid-quiz-row__head">
                <h3>{row.periodLabel}</h3>
                {quiz.submitted ? (
                  <span
                    className="chip"
                    data-tone={rowCorrect ? 'success' : 'danger'}
                  >
                    {rowCorrect ? '정답' : '수정 필요'}
                  </span>
                ) : null}
              </div>

              <p className="hybrid-quiz-row__summary">{row.summary}</p>

              <div className="hybrid-quiz-row__text-grid">
                {row.prompts.map((prompt) => {
                  const textResultState = quiz.submitted
                    ? quiz.resultMap[`text:${prompt.id}`]
                      ? 'correct'
                      : 'wrong'
                    : undefined

                  return (
                    <label className="hybrid-quiz-row__text-field" key={prompt.id}>
                      <span>{prompt.label}</span>
                      <input
                        className="hybrid-quiz-row__text-input"
                        data-state={textResultState}
                        onChange={(event) =>
                          updateTextAnswer(prompt.id, event.target.value)
                        }
                        placeholder={prompt.placeholder}
                        type="text"
                        value={textAnswers[prompt.id] ?? ''}
                      />
                      {showAnswers ? (
                        <p className="hybrid-quiz-row__answer">
                          정답: {prompt.answers[0]}
                        </p>
                      ) : null}
                    </label>
                  )
                })}
              </div>

              <div className="hybrid-quiz-row__image-block">
                <div
                  className="hybrid-quiz-row__preview"
                  data-state={
                    quiz.submitted
                      ? quiz.resultMap[`image:${row.id}`]
                        ? 'correct'
                        : 'wrong'
                      : undefined
                  }
                >
                  {selectedImage?.src ? (
                    <img
                      alt={`${row.periodLabel} 이미지`}
                      src={selectedImage.src}
                    />
                  ) : (
                    <p>이미지를 추가해 주세요.</p>
                  )}
                </div>

                <div className="hybrid-quiz-row__image-actions">
                  <label className="tiny-button" htmlFor={`upload-${row.id}`}>
                    사진 업로드
                  </label>
                  <input
                    accept="image/*"
                    className="hybrid-quiz__hidden-input"
                    id={`upload-${row.id}`}
                    onChange={(event) => {
                      handleUpload(row.id, event.target.files?.[0] ?? null)
                      event.target.value = ''
                    }}
                    type="file"
                  />

                  <button
                    className="tiny-button"
                    data-tone="secondary"
                    onClick={() => clearImageSelection(row.id)}
                    type="button"
                  >
                    이미지 지우기
                  </button>
                </div>

                <div className="hybrid-quiz-row__stock-list">
                  {row.stockImages.map((stockImage) => (
                    <button
                      className="tiny-button"
                      key={stockImage.id}
                      onClick={() =>
                        setImageSelection(row.id, {
                          kind: 'stock',
                          src: stockImage.src,
                          label: stockImage.label,
                        })
                      }
                      type="button"
                    >
                      {stockImage.label}
                    </button>
                  ))}
                </div>

                <div className="hybrid-quiz-row__url-row">
                  <input
                    className="hybrid-quiz-row__url-input"
                    onChange={(event) => updateUrlInput(row.id, event.target.value)}
                    placeholder="스톡 이미지 URL 붙여넣기"
                    type="url"
                    value={urlInputs[row.id] ?? ''}
                  />
                  <button
                    className="tiny-button"
                    onClick={() => applyCustomUrl(row.id)}
                    type="button"
                  >
                    URL 삽입
                  </button>
                </div>

                {selectedImage?.src ? (
                  <p className="hybrid-quiz-row__image-meta">
                    선택됨: {selectedImage.label || selectedImage.kind}
                  </p>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>

      <footer className="hybrid-quiz__footer">
        <button className="pill-button" onClick={quiz.submit} type="button">
          정답 제출
        </button>
        <button
          className="pill-button"
          data-tone="secondary"
          onClick={resetAll}
          type="button"
        >
          다시 하기
        </button>
      </footer>
    </section>
  )
}
