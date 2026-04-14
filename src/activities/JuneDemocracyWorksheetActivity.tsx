import {
  createStoryThinkMatchWorksheetActivity,
  type StoryThinkMatchWorksheetDefinition,
} from '../activity-kit/createStoryThinkMatchWorksheetActivity'
import { juneDemocracyMatchModule } from './june-democracy/matchModule'
import { juneDemocracyStoryModule } from './june-democracy/storyModule'
import { juneDemocracyThinkModule } from './june-democracy/thinkModule'

const juneDemocracyWorksheetDefinition: StoryThinkMatchWorksheetDefinition = {
  manifest: {
    id: 'june-democracy-worksheet',
    subject: '사회',
    title: '6\uc6d4 \ubbfc\uc8fc \ud56d\uc7c1 \uc6cc\ud06c\uc2dc\ud2b8',
    shortLabel: '\ubbfc\uc8fc \ud56d\uc7c1',
    createdAt: '2026-04-14T09:35:01+09:00',
    icon: 'DM',
    color: '#b65f4b',
    softColor: '#f3ddd6',
    preview: 'line-match-history',
  },
  sectionType: 'performance',
  stage: {
    title: '6\uc6d4 \ubbfc\uc8fc \ud56d\uc7c1',
    subtitle: '\uc774\uc57c\uae30, \uc0dd\uac01, \uc5f0\uacb0',
    sectionLabels: {
      story: '\uc774\uc57c\uae30',
      think: '\uc0dd\uac01',
      match: '\uc5f0\uacb0',
    },
  },
  worksheet: {
    storageKeyPrefix: 'activity:june-democracy-worksheet',
    story: juneDemocracyStoryModule,
    think: juneDemocracyThinkModule,
    match: juneDemocracyMatchModule,
  },
}

const juneDemocracyWorksheetActivity = createStoryThinkMatchWorksheetActivity(
  juneDemocracyWorksheetDefinition,
)

export const juneDemocracyWorksheetManifest = juneDemocracyWorksheetActivity.manifest
export const JuneDemocracyWorksheetActivity = juneDemocracyWorksheetActivity.Component
