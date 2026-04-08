import { useMemo, useState } from 'react'
import { usePersistentState } from './usePersistentState'
import type { AppMode } from '../activities/types'

export type ReflectionPromptInput = {
  id?: string
  prompt: string
  teacherAnswer: string
}

export type ReflectionWritingModuleConfig = {
  instruction: string
  prompts: ReflectionPromptInput[]
  answerPrefix?: string
}

type ReflectionWritingModuleProps = ReflectionWritingModuleConfig & {
  headingNumber: number | string
  mode: AppMode
  showAnswers: boolean
  storageKey: string
}

type NormalizedReflectionPrompt = {
  id: string
  prompt: string
  teacherAnswer: string
}

function normalizeReflectionPrompts(
  prompts: ReflectionPromptInput[],
): NormalizedReflectionPrompt[] {
  return prompts.map((prompt, index) => ({
    id: prompt.id ?? `prompt-${index + 1}`,
    prompt: prompt.prompt,
    teacherAnswer: prompt.teacherAnswer,
  }))
}

function createEmptyThoughts(prompts: NormalizedReflectionPrompt[]) {
  return prompts.reduce<Record<string, string>>((accumulator, prompt) => {
    accumulator[prompt.id] = ''
    return accumulator
  }, {})
}

export function ReflectionWritingModule({
  headingNumber,
  instruction,
  prompts,
  answerPrefix = '예) ',
  mode,
  showAnswers,
  storageKey,
}: ReflectionWritingModuleProps) {
  const normalizedPrompts = useMemo(
    () => normalizeReflectionPrompts(prompts),
    [prompts],
  )
  const emptyThoughts = useMemo(
    () => createEmptyThoughts(normalizedPrompts),
    [normalizedPrompts],
  )
  const [thoughts, setThoughts] = usePersistentState<Record<string, string>>(
    `${storageKey}:thoughts`,
    emptyThoughts,
  )
  const [revealedPromptIds, setRevealedPromptIds] = useState<string[]>([])

  const updateThought = (id: string, value: string) => {
    setThoughts((currentThoughts) => ({
      ...currentThoughts,
      [id]: value,
    }))
  }

  const toggleRevealedPrompt = (id: string) => {
    setRevealedPromptIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    )
  }

  return (
    <div className="reflection-list">
      <div className="worksheet-heading">
        <span className="worksheet-heading__index">{headingNumber}</span>
        <p>{instruction}</p>
      </div>
      {normalizedPrompts.map((prompt) => {
        const answerVisible =
          mode === 'teacher' &&
          (showAnswers || revealedPromptIds.includes(prompt.id))

        return (
          <section className="reflection-card" key={prompt.id}>
            <div className="reflection-card__toolbar">
              <p className="reflection-card__prompt">{prompt.prompt}</p>
              {mode === 'teacher' ? (
                <button
                  className="tiny-button"
                  data-tone="teacher"
                  onClick={() => toggleRevealedPrompt(prompt.id)}
                  type="button"
                >
                  {answerVisible ? '정답 숨김' : '정답 보기'}
                </button>
              ) : null}
            </div>
            <textarea
              className="reflection-card__input"
              onChange={(event) => updateThought(prompt.id, event.target.value)}
              rows={2}
              value={thoughts[prompt.id] ?? ''}
            />
            {answerVisible ? (
              <p className="reflection-card__answer">
                {answerPrefix}
                {prompt.teacherAnswer}
              </p>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
