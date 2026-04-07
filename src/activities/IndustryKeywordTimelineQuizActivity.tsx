import { ActivityShell } from '../activity-kit/ActivityShell'
import { ActivityStage } from '../activity-kit/ActivityStage'
import { IndustryKeywordTimelineWorksheet } from './IndustryKeywordTimelineWorksheet'
import type {
  ActivityComponentProps,
  ActivityManifest,
  SectionActivityType,
} from './types'

const sectionType: SectionActivityType = 'quiz'

const industryKeywordTimelineQuizManifest: ActivityManifest = {
  id: 'industry-keyword-timeline-quiz',
  title: '산업 발달 키워드 연표',
  shortLabel: '산업 연표',
  icon: 'IT',
  color: '#2f7f73',
  softColor: '#d4ebe6',
  preview: 'image-text-hybrid-quiz',
  Component: IndustryKeywordTimelineQuizActivity,
}

function getSectionTypeLabel(type: SectionActivityType) {
  return type === 'quiz' ? '활동지 재구성' : '수행 활동'
}

export function IndustryKeywordTimelineQuizActivity({ mode }: ActivityComponentProps) {
  return (
    <ActivityShell manifest={industryKeywordTimelineQuizManifest} mode={mode}>
      {({ showAnswers }) => (
        <ActivityStage
          title="키워드 연표"
          subtitle="원본 활동지 기반 디지털 워크시트"
          aside={
            <div className="worksheet-stage-meta">
              <span className="chip">{getSectionTypeLabel(sectionType)}</span>
              <span className="chip" data-tone={mode === 'teacher' ? 'teacher' : undefined}>
                1 / 1
              </span>
            </div>
          }
        >
          <IndustryKeywordTimelineWorksheet mode={mode} showAnswers={showAnswers} />
        </ActivityStage>
      )}
    </ActivityShell>
  )
}
