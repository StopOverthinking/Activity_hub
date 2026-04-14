import {
  createBingoWorksheetActivity,
  type BingoWorksheetActivityDefinition,
  type BingoWorksheetClue,
} from '../activity-kit/createBingoWorksheetActivity'

const bingoClues: BingoWorksheetClue[] = [
  {
    id: 'five-year-plan',
    prompt:
      '1960년대 정부는 농업 중심 구조를 공업 중심으로 바꾸기 위해 {{blank}}을 추진했습니다.',
    initials: 'ㄱㅈ ㄱㅂ 5ㄱㄴ ㄱㅎ',
    answer: '경제 개발 5개년 계획',
  },
  {
    id: 'gyeongbu-highway',
    prompt:
      '서울과 부산을 잇는 {{blank}}은 물자 수송과 수출에 큰 도움이 되었습니다.',
    initials: 'ㄱㅂ ㄱㅅ ㄷㄹ',
    answer: '경부 고속 도로',
  },
  {
    id: 'light-industry',
    prompt:
      '신발, 가방, 의류처럼 무게가 가벼운 물건을 만드는 산업을 {{blank}}이라고 합니다.',
    initials: 'ㄱㄱㅇ',
    answer: '경공업',
  },
  {
    id: 'heavy-chemical-industry',
    prompt:
      '철, 배, 석유화학 제품처럼 무게가 많이 나가거나 기술이 필요한 산업을 {{blank}}이라고 합니다.',
    initials: 'ㅈㅎㅎ ㄱㅇ',
    answer: '중화학 공업',
  },
  {
    id: 'food-shortage',
    prompt:
      '6.25 전쟁 이후 우리나라는 심한 {{blank}}으로 어려운 생활을 겪었습니다.',
    initials: 'ㅅㄹㄴ',
    answer: '식량난',
  },
  {
    id: 'ramen',
    prompt:
      '1963년에 우리나라에서 처음 만들어졌고, 밀가루로 만든 간편식은 {{blank}}입니다.',
    initials: 'ㄹㅁ',
    answer: '라면',
  },
  {
    id: 'flour',
    prompt:
      '1950년대 미국이 우리나라를 지원해 주어 산업 발전에 쓰인 재료는 {{blank}}입니다.',
    initials: 'ㅁㄱㄹ',
    answer: '밀가루',
  },
  {
    id: 'pohang-steelworks',
    prompt:
      '1973년에 준공되어 철강 산업의 중심지가 된 공장은 {{blank}}입니다.',
    initials: 'ㅍㅎ ㅈㅊㅅ',
    answer: '포항 제철소',
  },
  {
    id: 'miner',
    prompt:
      '1960~70년대 서독의 광산에서 일하며 외화를 벌어들인 사람들은 {{blank}}입니다.',
    initials: 'ㄱㅂ',
    answer: '광부',
  },
  {
    id: 'nurse',
    prompt:
      '1960~70년대 서독 병원에서 근무하며 외화를 벌어 국가 경제에 도움을 준 사람들은 {{blank}}입니다.',
    initials: 'ㄱㅎㅅ',
    answer: '간호사',
  },
  {
    id: 'labor-force',
    prompt:
      '1960년대 우리나라는 풍부한 {{blank}}을 바탕으로 경공업 제품을 만들어 수출했습니다.',
    initials: 'ㄴㄷㄹ',
    answer: '노동력',
  },
  {
    id: 'hundred-million-export',
    prompt:
      '1970년대 우리나라는 빠른 경제 성장으로 {{blank}}를 달성했습니다.',
    initials: 'ㅅㅊ 100ㅇ ㄷㄹ',
    answer: '수출 100억 달러',
  },
  {
    id: 'technology',
    prompt:
      '1980년대 기업들은 세계 시장에서 경쟁하기 위해 {{blank}} 개발에 힘썼습니다.',
    initials: 'ㄱㅅ',
    answer: '기술',
  },
  {
    id: 'car',
    prompt:
      '1980년대 연구와 개발을 통해 성장하고 처음으로 미국에 수출한 제품은 {{blank}}입니다.',
    initials: 'ㅈㄷㅊ',
    answer: '자동차',
  },
  {
    id: 'textile',
    prompt:
      '1950년대 미국의 원조를 받아 발달한 옷감을 만드는 산업은 {{blank}} 산업입니다.',
    initials: 'ㅁㅈㅁ',
    answer: '면직물',
  },
  {
    id: 'wig',
    prompt:
      '1960년대 수출품으로 인기를 끈, 머리카락으로 만든 제품은 {{blank}}입니다.',
    initials: 'ㄱㅂ',
    answer: '가발',
  },
]

export const industryDevelopmentBingoDefinition: BingoWorksheetActivityDefinition = {
  manifest: {
    id: 'industry-development-bingo',
    subject: '사회',
    title: '우리나라 산업 발달 빙고',
    shortLabel: '산업 빙고',
    createdAt: '2026-04-08T00:00:00+09:00',
    icon: 'BG',
    color: '#9b674c',
    softColor: '#f2dfd3',
    preview: 'bingo-worksheet',
  },
  sectionType: 'quiz',
  stage: {
    title: '우리나라 산업 발달 빙고',
    subtitle: '초성 문제를 풀고 정답 카드로 빙고판을 완성해 보세요.',
    progressLabel: '1 / 1',
  },
  worksheet: {
    clues: bingoClues,
    boardTitle: '정답 카드를 빙고판에 배치해 보세요.',
    boardDescription:
      '정답 카드를 모두 채운 뒤 빙고판 확정 버튼으로 줄을 표시해 보세요.',
    storageKeyPrefix: 'activity:industry-development-bingo',
  },
}

const industryDevelopmentBingoActivity = createBingoWorksheetActivity(
  industryDevelopmentBingoDefinition,
)

export const industryDevelopmentBingoManifest = industryDevelopmentBingoActivity.manifest
export const IndustryDevelopmentBingoActivity = industryDevelopmentBingoActivity.Component
