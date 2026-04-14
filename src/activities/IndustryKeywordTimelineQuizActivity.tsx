import {
  createImageTableWorksheetActivity,
  type ImageTableWorksheetActivityDefinition,
  type ImageTableWorksheetField,
  type ImageTableWorksheetRow,
} from '../activity-kit/createImageTableWorksheetActivity'

const timelineFields: ImageTableWorksheetField[] = [
  { id: 'flour', label: '1950년대 예시 1', answer: '밀가루', widthCh: 9 },
  { id: 'sugar', label: '1950년대 예시 2', answer: '설탕', widthCh: 8 },
  { id: 'light-industry', label: '1960년대 공업 이름', answer: '경', widthCh: 5 },
  { id: 'shoes', label: '1960년대 예시', answer: '신발', widthCh: 8 },
  { id: 'heavy-chemical', label: '1970년대 공업 이름', answer: '중화학', widthCh: 10 },
  { id: 'steel', label: '1970년대 예시 1', answer: '철강', widthCh: 7 },
  { id: 'shipbuilding', label: '1970년대 예시 2', answer: '조선', widthCh: 7 },
  { id: 'automobile', label: '1980년대 산업 예시 1', answer: '자동차', widthCh: 10 },
  { id: 'electronic', label: '1980년대 산업 예시 2', answer: '전자', widthCh: 7 },
  {
    id: 'living-standard',
    label: '1980년대 산업 발달 결과',
    answer: '생활 수준',
    widthCh: 13,
  },
]

const timelineRows: ImageTableWorksheetRow[] = [
  {
    id: 'industry-1950',
    periodLabel: '1950년대',
    lines: [
      [{ type: 'text', value: '생활에 필요한 물건을 만드는 산업 발달' }],
      [
        { type: 'text', value: '예) ' },
        { type: 'field', fieldId: 'flour', placeholder: 'ㅁ ㄱ ㄹ' },
        { type: 'text', value: ', ' },
        { type: 'field', fieldId: 'sugar', placeholder: 'ㅅ ㅌ' },
        { type: 'text', value: ', 면직물 등' },
      ],
    ],
  },
  {
    id: 'industry-1960',
    periodLabel: '1960년대',
    lines: [
      [
        { type: 'field', fieldId: 'light-industry', placeholder: 'ㄱ' },
        { type: 'text', value: ' 공업' },
      ],
      [{ type: 'text', value: '(비교적 무게가 가벼운 물건)' }],
      [
        { type: 'text', value: ': ' },
        { type: 'field', fieldId: 'shoes', placeholder: 'ㅅ ㅂ' },
        { type: 'text', value: ', 가발, 의류 등' },
      ],
    ],
  },
  {
    id: 'industry-1970',
    periodLabel: '1970년대',
    lines: [
      [
        { type: 'field', fieldId: 'heavy-chemical', placeholder: 'ㅈ ㅎ ㅎ' },
        { type: 'text', value: ' 공업' },
      ],
      [{ type: 'text', value: '(무게가 많이 나가는 물건' }],
      [{ type: 'text', value: '& 화학 제품을 만드는 공업)' }],
      [
        { type: 'text', value: '= ' },
        { type: 'field', fieldId: 'steel', placeholder: 'ㅊ ㄱ' },
        { type: 'text', value: ', ' },
        { type: 'field', fieldId: 'shipbuilding', placeholder: 'ㅈ ㅅ' },
        { type: 'text', value: ', 석유 화학 등' },
      ],
    ],
  },
  {
    id: 'industry-1980',
    periodLabel: '1980년대',
    lines: [
      [
        { type: 'field', fieldId: 'automobile', placeholder: 'ㅈ ㄷ ㅊ' },
        { type: 'text', value: ', 정밀 기계, ' },
        { type: 'field', fieldId: 'electronic', placeholder: 'ㅈ ㅈ' },
        { type: 'text', value: ' 제품 등' },
      ],
      [{ type: 'text', value: '과 관련 있는 산업 발달' }],
      [
        { type: 'text', value: '▶ 수출액 증가, ' },
        { type: 'field', fieldId: 'living-standard', placeholder: 'ㅅ ㅎ ㅅ ㅈ' },
        { type: 'text', value: ' 향상' },
      ],
    ],
  },
]

const industryKeywordTimelineDefinition: ImageTableWorksheetActivityDefinition = {
  manifest: {
    id: 'industry-keyword-timeline-quiz',
    subject: '사회',
    title: '산업 발달 키워드 연표',
    shortLabel: '산업 연표',
    createdAt: '2026-04-09T11:19:39+09:00',
    icon: 'IT',
    color: '#2f7f73',
    softColor: '#d4ebe6',
    preview: 'image-text-hybrid-quiz',
  },
  sectionType: 'quiz',
  stage: {
    title: '키워드 연표',
    subtitle: '키워드 입력과 이미지 선택으로 완성하는 산업 발달 퀴즈',
    progressLabel: '1 / 1',
  },
  worksheet: {
    fields: timelineFields,
    rows: timelineRows,
    tableHeaders: {
      period: '시기',
      image: '그림',
      content: '우리나라 산업 발달 키워드',
    },
    saveImageFileName: 'industry-keyword-timeline.png',
    saveImageTitle: '산업 발달 키워드 연표',
    storageKeyPrefix: 'activity:industry-keyword-timeline',
  },
}

const industryKeywordTimelineActivity = createImageTableWorksheetActivity(
  industryKeywordTimelineDefinition,
)

export const industryKeywordTimelineQuizManifest = industryKeywordTimelineActivity.manifest
export const IndustryKeywordTimelineQuizActivity = industryKeywordTimelineActivity.Component
