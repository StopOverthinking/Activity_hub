import { IndustryDevelopmentBingoActivity } from './IndustryDevelopmentBingoActivity'
import { IndustryKeywordTimelineQuizActivity } from './IndustryKeywordTimelineQuizActivity'
import { JuneDemocracyWorksheetActivity } from './JuneDemocracyWorksheetActivity'
import type { ActivityManifest } from './types'

export const activityRegistry: ActivityManifest[] = [
  {
    id: 'industry-development-bingo',
    title: '우리나라 산업 발달 빙고',
    shortLabel: '산업 빙고',
    icon: 'BG',
    color: '#9b674c',
    softColor: '#f2dfd3',
    preview: 'bingo-worksheet',
    Component: IndustryDevelopmentBingoActivity,
  },
  {
    id: 'june-democracy-worksheet',
    title: '6월 민주 항쟁 워크시트',
    shortLabel: '민주 항쟁',
    icon: 'JD',
    color: '#b65f4b',
    softColor: '#f3ddd6',
    preview: 'line-match-history',
    Component: JuneDemocracyWorksheetActivity,
  },
  {
    id: 'industry-keyword-timeline-quiz',
    title: '산업 발달 키워드 연표',
    shortLabel: '산업 연표',
    icon: 'IT',
    color: '#2f7f73',
    softColor: '#d4ebe6',
    preview: 'image-text-hybrid-quiz',
    Component: IndustryKeywordTimelineQuizActivity,
  },
]

export function getActivityById(id: string) {
  return activityRegistry.find((activity) => activity.id === id)
}
