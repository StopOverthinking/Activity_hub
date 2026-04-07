import { useMemo, useState } from 'react'

export type QuizCheckMap = Record<string, boolean>

type UseQuizSubmissionOptions = {
  itemIds: string[]
  grade: () => QuizCheckMap
}

export function useQuizSubmission({
  itemIds,
  grade,
}: UseQuizSubmissionOptions) {
  const [submitted, setSubmitted] = useState(false)
  const [resultMap, setResultMap] = useState<QuizCheckMap>({})

  const correctCount = useMemo(
    () => Object.values(resultMap).filter(Boolean).length,
    [resultMap],
  )

  const submit = () => {
    const nextResultMap = grade()
    setResultMap(nextResultMap)
    setSubmitted(true)
  }

  const reset = () => {
    setSubmitted(false)
    setResultMap({})
  }

  return {
    submitted,
    submit,
    reset,
    resultMap,
    correctCount,
    totalCount: itemIds.length,
  }
}
