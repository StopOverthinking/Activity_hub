import { ActivityScreenLayout } from './ActivityScreenLayout'
import {
  BingoWorksheetModule,
  type BingoWorksheetClue,
  type BingoWorksheetHeader,
  type BingoWorksheetModuleConfig,
} from './BingoWorksheetModule'
import type {
  ActivityComponentProps,
  ActivityManifest,
  SectionActivityType,
} from '../activities/types'

export type BingoWorksheetActivityDefinition = {
  manifest: Omit<ActivityManifest, 'Component'> & {
    preview?: ActivityManifest['preview']
  }
  sectionType?: SectionActivityType
  stage: {
    title: string
    subtitle?: string
    progressLabel?: string
  }
  worksheet: BingoWorksheetModuleConfig & {
    storageKeyPrefix?: string
  }
}

export type BingoWorksheetActivityBundle = {
  definition: BingoWorksheetActivityDefinition
  manifest: ActivityManifest
  Component: (props: ActivityComponentProps) => ReturnType<ActivityManifest['Component']>
}

export type {
  BingoWorksheetClue,
  BingoWorksheetHeader,
  BingoWorksheetModuleConfig,
}

export function createBingoWorksheetActivity(
  definition: BingoWorksheetActivityDefinition,
): BingoWorksheetActivityBundle {
  function BingoActivityComponent({ mode }: ActivityComponentProps) {
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
          <BingoWorksheetModule
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
    preview: definition.manifest.preview ?? 'bingo-worksheet',
    Component: BingoActivityComponent,
  }

  return {
    definition,
    manifest: manifestRecord,
    Component: BingoActivityComponent,
  }
}
