import { ActivityScreenLayout } from './ActivityScreenLayout'
import {
  WorksheetMazeModule,
  type WorksheetMazeModuleConfig,
  type WorksheetMazeSentenceGroup,
} from './WorksheetMazeModule'
import type {
  ActivityComponentProps,
  ActivityManifest,
  SectionActivityType,
} from '../activities/types'

export type WorksheetMazeActivityDefinition = {
  manifest: Omit<ActivityManifest, 'Component'> & {
    preview?: ActivityManifest['preview']
  }
  sectionType?: SectionActivityType
  stage: {
    title: string
    subtitle?: string
    progressLabel?: string
  }
  worksheet: WorksheetMazeModuleConfig & {
    storageKeyPrefix?: string
  }
}

export type WorksheetMazeActivityBundle = {
  definition: WorksheetMazeActivityDefinition
  manifest: ActivityManifest
  Component: (props: ActivityComponentProps) => ReturnType<ActivityManifest['Component']>
}

export type {
  WorksheetMazeModuleConfig,
  WorksheetMazeSentenceGroup,
}

export function createWorksheetMazeActivity(
  definition: WorksheetMazeActivityDefinition,
): WorksheetMazeActivityBundle {
  function WorksheetMazeActivity({ mode }: ActivityComponentProps) {
    const {
      manifest,
      sectionType = 'quiz',
      stage,
      worksheet: { storageKeyPrefix, ...worksheetConfig },
    } = definition

    const resolvedStorageKeyPrefix = storageKeyPrefix ?? `activity:${manifest.id}`

    return (
      <ActivityScreenLayout
        manifest={manifestRecord}
        mode={mode}
        progressLabel={stage.progressLabel ?? '1 / 1'}
        sectionType={sectionType}
        subtitle={stage.subtitle}
        title={stage.title}
      >
        {({ showAnswers }) => (
          <WorksheetMazeModule
            {...worksheetConfig}
            mode={mode}
            showAnswers={showAnswers}
            storageKey={`${resolvedStorageKeyPrefix}:${mode}`}
          />
        )}
      </ActivityScreenLayout>
    )
  }

  const manifestRecord: ActivityManifest = {
    ...definition.manifest,
    preview: definition.manifest.preview ?? 'line-match-history',
    Component: WorksheetMazeActivity,
  }

  return {
    definition,
    manifest: manifestRecord,
    Component: WorksheetMazeActivity,
  }
}
