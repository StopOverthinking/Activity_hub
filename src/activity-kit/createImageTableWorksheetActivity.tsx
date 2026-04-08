import { ActivityScreenLayout } from './ActivityScreenLayout'
import {
  ImageTableWorksheetModule,
  type ImageTableWorksheetField,
  type ImageTableWorksheetModuleConfig,
  type ImageTableWorksheetRow,
} from './ImageTableWorksheetModule'
import type {
  ActivityComponentProps,
  ActivityManifest,
  SectionActivityType,
} from '../activities/types'

export type ImageTableWorksheetActivityDefinition = {
  manifest: Omit<ActivityManifest, 'Component'> & {
    preview?: ActivityManifest['preview']
  }
  sectionType?: SectionActivityType
  stage: {
    title: string
    subtitle?: string
    progressLabel?: string
  }
  worksheet: ImageTableWorksheetModuleConfig & {
    storageKeyPrefix?: string
  }
}

export type ImageTableWorksheetActivityBundle = {
  definition: ImageTableWorksheetActivityDefinition
  manifest: ActivityManifest
  Component: (props: ActivityComponentProps) => ReturnType<ActivityManifest['Component']>
}

export type {
  ImageTableWorksheetField,
  ImageTableWorksheetModuleConfig,
  ImageTableWorksheetRow,
}

export function createImageTableWorksheetActivity(
  definition: ImageTableWorksheetActivityDefinition,
): ImageTableWorksheetActivityBundle {
  function ImageTableWorksheetActivity({ mode }: ActivityComponentProps) {
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
          <ImageTableWorksheetModule
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
    preview: definition.manifest.preview ?? 'image-text-hybrid-quiz',
    Component: ImageTableWorksheetActivity,
  }

  return {
    definition,
    manifest: manifestRecord,
    Component: ImageTableWorksheetActivity,
  }
}
