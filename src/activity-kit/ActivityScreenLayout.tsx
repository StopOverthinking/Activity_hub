import type { ReactNode } from 'react'
import { ActivityShell } from './ActivityShell'
import { ActivityStage } from './ActivityStage'
import type {
  ActivityManifest,
  AppMode,
  SectionActivityType,
} from '../activities/types'

type ActivityScreenLayoutProps = {
  manifest: ActivityManifest
  mode: AppMode
  sectionType: SectionActivityType
  title: string
  subtitle?: string
  progressLabel: ReactNode
  children: (state: { showAnswers: boolean }) => ReactNode
}

function getSectionTypeLabel(type: SectionActivityType) {
  return type === 'quiz' ? '퀴즈 활동' : '수행 활동'
}

export function ActivityScreenLayout({
  manifest,
  mode,
  sectionType,
  title,
  subtitle,
  progressLabel,
  children,
}: ActivityScreenLayoutProps) {
  return (
    <ActivityShell manifest={manifest} mode={mode}>
      {({ showAnswers, textScale }) => (
        <ActivityStage
          title={title}
          subtitle={subtitle}
          textScale={textScale}
          aside={
            <div className="worksheet-stage-meta">
              <span className="chip">{getSectionTypeLabel(sectionType)}</span>
              <span className="chip" data-tone={mode === 'teacher' ? 'teacher' : undefined}>
                {progressLabel}
              </span>
            </div>
          }
        >
          {children({ showAnswers })}
        </ActivityStage>
      )}
    </ActivityShell>
  )
}
