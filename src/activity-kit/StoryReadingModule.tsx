import { useMemo } from 'react'
import { usePersistentState } from './usePersistentState'
import type { AppMode } from '../activities/types'

export type StoryReadingSentenceInput =
  | string
  | {
      id?: string
      text: string
    }

export type StoryReadingParagraphInput =
  | string
  | {
      id?: string
      sentences: StoryReadingSentenceInput[]
    }

export type StoryReadingModuleConfig = {
  instruction: string
  paragraphs: StoryReadingParagraphInput[]
  hint?: string
  clearLabel?: string
}

type StoryReadingModuleProps = StoryReadingModuleConfig & {
  headingNumber: number | string
  mode: AppMode
  storageKey: string
}

type NormalizedStoryParagraph = {
  id: string
  sentences: Array<{
    id: string
    text: string
  }>
}

function normalizeStoryParagraphs(
  paragraphs: StoryReadingParagraphInput[],
): NormalizedStoryParagraph[] {
  return paragraphs.map((paragraph, paragraphIndex) => {
    if (typeof paragraph === 'string') {
      return {
        id: `paragraph-${paragraphIndex + 1}`,
        sentences: [
          {
            id: `paragraph-${paragraphIndex + 1}-sentence-1`,
            text: paragraph,
          },
        ],
      }
    }

    return {
      id: paragraph.id ?? `paragraph-${paragraphIndex + 1}`,
      sentences: paragraph.sentences.map((sentence, sentenceIndex) =>
        typeof sentence === 'string'
          ? {
              id: `paragraph-${paragraphIndex + 1}-sentence-${sentenceIndex + 1}`,
              text: sentence,
            }
          : {
              id:
                sentence.id ??
                `paragraph-${paragraphIndex + 1}-sentence-${sentenceIndex + 1}`,
              text: sentence.text,
            },
      ),
    }
  })
}

export function StoryReadingModule({
  headingNumber,
  instruction,
  paragraphs,
  hint = '중요한 문장을 누르면 형광펜 표시가 됩니다.',
  clearLabel = '형광펜 지우기',
  mode,
  storageKey,
}: StoryReadingModuleProps) {
  const normalizedParagraphs = useMemo(
    () => normalizeStoryParagraphs(paragraphs),
    [paragraphs],
  )
  const [highlightedSentenceIds, setHighlightedSentenceIds] = usePersistentState<string[]>(
    `${storageKey}:highlights`,
    [],
  )

  const toggleHighlightedSentence = (id: string) => {
    setHighlightedSentenceIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    )
  }

  const clearStoryHighlights = () => {
    setHighlightedSentenceIds([])
  }

  return (
    <div className="story-sheet">
      <div className="worksheet-heading">
        <span className="worksheet-heading__index">{headingNumber}</span>
        <p>{instruction}</p>
      </div>
      <div className="story-sheet__tools">
        <p className="story-sheet__hint">{hint}</p>
        <button
          className="tiny-button"
          data-tone={mode === 'teacher' ? 'teacher' : undefined}
          disabled={highlightedSentenceIds.length === 0}
          onClick={clearStoryHighlights}
          type="button"
        >
          {clearLabel}
        </button>
      </div>
      <div className="story-sheet__body">
        {normalizedParagraphs.map((paragraph) => (
          <div className="story-sheet__paragraph" key={paragraph.id}>
            {paragraph.sentences.map((sentence) => (
              <button
                key={sentence.id}
                className="story-highlight-toggle"
                data-highlighted={highlightedSentenceIds.includes(sentence.id)}
                onClick={() => toggleHighlightedSentence(sentence.id)}
                type="button"
              >
                {sentence.text}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
