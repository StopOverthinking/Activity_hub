import { ActivityShell } from '../activity-kit/ActivityShell'
import { ActivityStage } from '../activity-kit/ActivityStage'
import {
  BingoWorksheetModule,
  type BingoWorksheetClue,
} from '../activity-kit/BingoWorksheetModule'
import type {
  ActivityComponentProps,
  ActivityManifest,
  SectionActivityType,
} from './types'

const sectionType: SectionActivityType = 'quiz'

const industryDevelopmentBingoManifest: ActivityManifest = {
  id: 'industry-development-bingo',
  title: '우리나라 산업 발달 빙고',
  shortLabel: '산업 빙고',
  icon: 'BG',
  color: '#9b674c',
  softColor: '#f2dfd3',
  preview: 'bingo-worksheet',
  Component: IndustryDevelopmentBingoActivity,
}

const bingoClues: BingoWorksheetClue[] = [
  {
    id: 'five-year-plan',
    prompt: '1960년대 정부는 산업을 공업 중심으로 바꾸기 위해 {{blank}}을 추진했습니다.',
    initials: 'ㄱㅈ ㄱㅂ 5ㄱㄴ ㄱㅎ',
    answer: '경제 개발 5개년 계획',
  },
  {
    id: 'gyeongbu-highway',
    prompt: '서울과 부산을 잇는 {{blank}}는 물자 수송과 수출에 큰 도움이 되었습니다.',
    initials: 'ㄱㅂ ㄱㅅ ㄱㄷ',
    answer: '경부 고속 국도',
  },
  {
    id: 'light-industry',
    prompt: '신발, 가발, 의류처럼 무게가 가벼운 물건을 만드는 산업을 {{blank}}이라고 합니다.',
    initials: 'ㄱㄱㅇ',
    answer: '경공업',
  },
  {
    id: 'heavy-chemical-industry',
    prompt:
      '철, 배, 석유화학 제품들처럼 무게가 많이 나가거나 기술이 필요한 산업을 {{blank}}이라고 합니다.',
    initials: 'ㅈㅎㅎㄱㅇ',
    answer: '중화학공업',
  },
  {
    id: 'food-shortage',
    prompt: '6·25 전쟁 이후 우리나라는 심한 {{blank}}으로 어려움을 겪었습니다.',
    initials: 'ㅅㄹㄴ',
    answer: '식량난',
  },
  {
    id: 'ramen',
    prompt: '1963년에 우리나라에서 처음 만들어졌으며, 밀가루로 만든 간편식은 {{blank}}입니다.',
    initials: 'ㄹㅁ',
    answer: '라면',
  },
  {
    id: 'flour',
    prompt: '1950년대 미국이 우리나라에 지원해 주어 산업 발전에 도움을 준 곡물은 {{blank}}입니다.',
    initials: 'ㅁㄱㄹ',
    answer: '밀가루',
  },
  {
    id: 'pohang-steelworks',
    prompt: '1973년에 완공되어 철강 산업의 중심이 된 곳은 {{blank}}입니다.',
    initials: 'ㅍㅎ ㅈㅊㅅ',
    answer: '포항 제철소',
  },
  {
    id: 'miner',
    prompt: '1960~70년대 독일의 탄광에서 일하며 외화를 벌어들인 사람은 {{blank}}입니다.',
    initials: 'ㄱㅂ',
    answer: '광부',
  },
  {
    id: 'nurse',
    prompt:
      '1960~70년대 독일 병원에서 근무하며 외화를 벌어 한국 경제에 도움을 준 사람은 {{blank}}입니다.',
    initials: 'ㄱㅎㅅ',
    answer: '간호사',
  },
  {
    id: 'labor-force',
    prompt: '1960년대 우리나라는 풍부한 {{blank}}을 바탕으로 경공업 제품을 만들어 수출했습니다.',
    initials: 'ㄴㄷㄹ',
    answer: '노동력',
  },
  {
    id: 'hundred-million-export',
    prompt: '1970년대 우리나라는 빠른 경제 성장으로 {{blank}}를 달성했습니다.',
    initials: 'ㅅㅊ 100ㅇ ㄷㄹ',
    answer: '수출 100억 달러',
  },
  {
    id: 'technology',
    prompt: '1980년대 기업들은 세계 시장에서 경쟁하기 위해 {{blank}} 개발에 힘썼습니다.',
    initials: 'ㄱㅅ',
    answer: '기술',
  },
  {
    id: 'car',
    prompt: '1980년대 연구와 개발을 통해 성장하며 처음으로 미국에 수출된 제품은 {{blank}}입니다.',
    initials: 'ㅈㄷㅊ',
    answer: '자동차',
  },
  {
    id: 'textile',
    prompt: '1950년대 미국의 원조를 받아 발달한, 옷감을 만드는 산업은 {{blank}} 산업입니다.',
    initials: 'ㅁㅈㅁ',
    answer: '면직물',
  },
  {
    id: 'wig',
    prompt: '1960년대 수출품으로 인기를 끈 머리카락으로 만든 제품은 {{blank}}입니다.',
    initials: 'ㄱㅂ',
    answer: '가발',
  },
]

function getSectionTypeLabel(type: SectionActivityType) {
  return type === 'quiz' ? '퀴즈 활동' : '수행 활동'
}

export function IndustryDevelopmentBingoActivity({
  mode,
}: ActivityComponentProps) {
  return (
    <ActivityShell manifest={industryDevelopmentBingoManifest} mode={mode}>
      {({ showAnswers }) => (
        <ActivityStage
          title="우리나라 산업 발달 빙고"
          subtitle="초성 문제를 풀고 빙고판을 완성해 보세요"
          aside={
            <div className="worksheet-stage-meta">
              <span className="chip">{getSectionTypeLabel(sectionType)}</span>
              <span className="chip" data-tone={mode === 'teacher' ? 'teacher' : undefined}>
                1 / 1
              </span>
            </div>
          }
        >
          <BingoWorksheetModule
            boardDescription="하나의 정답은 하나의 칸에만 쓰며, 빙고판을 자유롭게 완성해 보세요."
            boardTitle="각 칸에 정답을 써 주세요."
            clues={bingoClues}
            mode={mode}
            showAnswers={showAnswers}
            storageKey={`activity:industry-development-bingo:${mode}`}
          />
        </ActivityStage>
      )}
    </ActivityShell>
  )
}
