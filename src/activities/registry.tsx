import { debateProcedureMazeManifest } from './DebateProcedureMazeActivity'
import { electionImportanceMazeManifest } from './ElectionImportanceMazeActivity'
import { industryDevelopmentBingoManifest } from './IndustryDevelopmentBingoActivity'
import { industryKeywordTimelineQuizManifest } from './IndustryKeywordTimelineQuizActivity'
import { juneDemocracyWorksheetManifest } from './JuneDemocracyWorksheetActivity'
import type { ActivityManifest } from './types'

export const activityRegistry: ActivityManifest[] = [
  debateProcedureMazeManifest,
  electionImportanceMazeManifest,
  industryDevelopmentBingoManifest,
  juneDemocracyWorksheetManifest,
  industryKeywordTimelineQuizManifest,
]

export function getActivityById(id: string) {
  return activityRegistry.find((activity) => activity.id === id)
}
