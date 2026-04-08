import { industryDevelopmentBingoManifest } from './IndustryDevelopmentBingoActivity'
import { industryKeywordTimelineQuizManifest } from './IndustryKeywordTimelineQuizActivity'
import { juneDemocracyWorksheetManifest } from './JuneDemocracyWorksheetActivity'
import type { ActivityManifest } from './types'

export const activityRegistry: ActivityManifest[] = [
  industryDevelopmentBingoManifest,
  juneDemocracyWorksheetManifest,
  industryKeywordTimelineQuizManifest,
]

export function getActivityById(id: string) {
  return activityRegistry.find((activity) => activity.id === id)
}
