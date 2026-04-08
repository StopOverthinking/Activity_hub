import { useState } from 'react'
import { ActivityScreenLayout } from './ActivityScreenLayout'
import {
  LineMatchWorksheetModule,
  type LineMatchWorksheetModuleConfig,
} from './LineMatchWorksheetModule'
import {
  ReflectionWritingModule,
  type ReflectionWritingModuleConfig,
} from './ReflectionWritingModule'
import {
  StoryReadingModule,
  type StoryReadingModuleConfig,
} from './StoryReadingModule'
import type {
  ActivityComponentProps,
  ActivityManifest,
  SectionActivityType,
} from '../activities/types'

type WorksheetSectionId = 'story' | 'think' | 'match'

export type StoryThinkMatchWorksheetDefinition = {
  manifest: Omit<ActivityManifest, 'Component'> & {
    preview?: ActivityManifest['preview']
  }
  sectionType?: SectionActivityType
  stage: {
    title: string
    subtitle?: string
    sectionLabels?: Partial<Record<WorksheetSectionId, string>>
  }
  worksheet: {
    story: StoryReadingModuleConfig
    think: ReflectionWritingModuleConfig
    match: LineMatchWorksheetModuleConfig
    storageKeyPrefix?: string
  }
}

export type StoryThinkMatchWorksheetActivityBundle = {
  definition: StoryThinkMatchWorksheetDefinition
  manifest: ActivityManifest
  Component: (props: ActivityComponentProps) => ReturnType<ActivityManifest['Component']>
}

export type {
  LineMatchWorksheetModuleConfig,
  ReflectionWritingModuleConfig,
  StoryReadingModuleConfig,
}

export function createStoryThinkMatchWorksheetActivity(
  definition: StoryThinkMatchWorksheetDefinition,
): StoryThinkMatchWorksheetActivityBundle {
  function StoryThinkMatchWorksheetActivity({ mode }: ActivityComponentProps) {
    const {
      manifest,
      sectionType = 'performance',
      stage,
      worksheet: { story, think, match, storageKeyPrefix },
    } = definition
    const [sectionId, setSectionId] = useState<WorksheetSectionId>('story')

    const resolvedStorageKeyPrefix = storageKeyPrefix ?? `activity:${manifest.id}`
    const sections = [
      {
        id: 'story',
        label: stage.sectionLabels?.story ?? '?댁빞湲?',
      },
      {
        id: 'think',
        label: stage.sectionLabels?.think ?? '?앷컖',
      },
      {
        id: 'match',
        label: stage.sectionLabels?.match ?? '?곌껐',
      },
    ] as const
    const sectionIndex = sections.findIndex((section) => section.id === sectionId)
    const currentSection = sections[sectionIndex]

    const goToSection = (nextSectionId: WorksheetSectionId) => {
      setSectionId(nextSectionId)
    }

    const goToAdjacentSection = (direction: -1 | 1) => {
      const nextIndex = Math.min(
        sections.length - 1,
        Math.max(0, sectionIndex + direction),
      )

      setSectionId(sections[nextIndex].id)
    }

    return (
      <ActivityScreenLayout
        manifest={manifestRecord}
        mode={mode}
        progressLabel={`${sectionIndex + 1} / ${sections.length}`}
        sectionType={sectionType}
        subtitle={stage.subtitle}
        title={stage.title}
      >
        {({ showAnswers }) => (
          <div className="worksheet-shell activity-module">
            <nav className="worksheet-tabs" aria-label="worksheet sections">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className="worksheet-tab"
                  data-active={section.id === sectionId}
                  onClick={() => goToSection(section.id)}
                  type="button"
                >
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="worksheet-section">
              {sectionId === 'story' ? (
                <StoryReadingModule
                  {...story}
                  headingNumber={1}
                  mode={mode}
                  storageKey={`${resolvedStorageKeyPrefix}:${mode}:story`}
                />
              ) : null}

              {sectionId === 'think' ? (
                <ReflectionWritingModule
                  {...think}
                  headingNumber={2}
                  mode={mode}
                  showAnswers={showAnswers}
                  storageKey={`${resolvedStorageKeyPrefix}:${mode}:think`}
                />
              ) : null}

              {sectionId === 'match' ? (
                <LineMatchWorksheetModule
                  {...match}
                  headingNumber={3}
                  mode={mode}
                  showAnswers={showAnswers}
                  storageKey={`${resolvedStorageKeyPrefix}:${mode}:match`}
                />
              ) : null}

              <div className="worksheet-actions">
                <button
                  className="pill-button"
                  data-tone="secondary"
                  disabled={sectionIndex === 0}
                  onClick={() => goToAdjacentSection(-1)}
                  type="button"
                >
                  ?댁쟾
                </button>
                <span className="worksheet-actions__label">{currentSection.label}</span>
                <button
                  className="pill-button"
                  disabled={sectionIndex === sections.length - 1}
                  onClick={() => goToAdjacentSection(1)}
                  type="button"
                >
                  ?ㅼ쓬
                </button>
              </div>
            </div>
          </div>
        )}
      </ActivityScreenLayout>
    )
  }

  const manifestRecord: ActivityManifest = {
    ...definition.manifest,
    preview: definition.manifest.preview ?? 'line-match-history',
    Component: StoryThinkMatchWorksheetActivity,
  }

  return {
    definition,
    manifest: manifestRecord,
    Component: StoryThinkMatchWorksheetActivity,
  }
}
