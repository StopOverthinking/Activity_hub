import { useState } from 'react'
import industry1950Art from '../assets/industry/industry-1950-art.png'
import industry1960Art from '../assets/industry/industry-1960-art.png'
import industry1970Art from '../assets/industry/industry-1970-art.png'
import industry1980Art from '../assets/industry/industry-1980-art.png'
import { usePersistentState } from '../activity-kit/usePersistentState'
import type { AppMode } from './types'

type IndustryKeywordTimelineWorksheetProps = {
  mode: AppMode
  showAnswers: boolean
}

type WorksheetVariant = {
  id: 'empty' | 'illustrated'
  label: string
  description: string
}

type WorksheetFieldId =
  | 'flour'
  | 'sugar'
  | 'light-industry'
  | 'shoes'
  | 'heavy-chemical'
  | 'steel'
  | 'shipbuilding'
  | 'automobile'
  | 'electronic'
  | 'living-standard'

type WorksheetToken =
  | {
      type: 'text'
      value: string
    }
  | {
      type: 'field'
      fieldId: WorksheetFieldId
      placeholder: string
    }

type WorksheetRow = {
  id: string
  periodLabel: string
  imageSrc: string
  imageAlt: string
  lines: WorksheetToken[][]
}

type WorksheetField = {
  id: WorksheetFieldId
  label: string
  answer: string
  widthCh: number
}

const worksheetVariants: WorksheetVariant[] = [
  {
    id: 'empty',
    label: '빈 활동지',
    description: '표와 문장을 보고 그림 칸까지 떠올리며 정리해 보는 형태입니다.',
  },
  {
    id: 'illustrated',
    label: '그림 제공',
    description: '원본처럼 핵심 그림을 함께 보며 키워드를 채우는 형태입니다.',
  },
]

const worksheetFields: WorksheetField[] = [
  { id: 'flour', label: '1950년대 예시 1', answer: '밀가루', widthCh: 6 },
  { id: 'sugar', label: '1950년대 예시 2', answer: '설탕', widthCh: 5 },
  { id: 'light-industry', label: '1960년대 공업 이름', answer: '경', widthCh: 3 },
  { id: 'shoes', label: '1960년대 예시', answer: '신발', widthCh: 5 },
  { id: 'heavy-chemical', label: '1970년대 공업 이름', answer: '중화학', widthCh: 6 },
  { id: 'steel', label: '1970년대 예시 1', answer: '철강', widthCh: 4 },
  { id: 'shipbuilding', label: '1970년대 예시 2', answer: '조선', widthCh: 4 },
  { id: 'automobile', label: '1980년대 산업 예시 1', answer: '자동차', widthCh: 6 },
  { id: 'electronic', label: '1980년대 산업 예시 2', answer: '전자', widthCh: 4 },
  { id: 'living-standard', label: '1980년대 산업 발달 결과', answer: '생활 수준', widthCh: 8 },
]

const fieldMap = worksheetFields.reduce<Record<WorksheetFieldId, WorksheetField>>(
  (accumulator, field) => {
    accumulator[field.id] = field
    return accumulator
  },
  {} as Record<WorksheetFieldId, WorksheetField>,
)

const worksheetRows: WorksheetRow[] = [
  {
    id: 'industry-1950',
    periodLabel: '1950년대',
    imageSrc: industry1950Art,
    imageAlt: '밀가루와 설탕을 나타내는 그림',
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
    imageSrc: industry1960Art,
    imageAlt: '옷, 신발, 가발을 나타내는 그림',
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
    imageSrc: industry1970Art,
    imageAlt: '철강과 조선을 나타내는 그림',
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
    imageSrc: industry1980Art,
    imageAlt: '자동차와 기계를 나타내는 그림',
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

const emptyAnswers = worksheetFields.reduce<Record<WorksheetFieldId, string>>(
  (accumulator, field) => {
    accumulator[field.id] = ''
    return accumulator
  },
  {} as Record<WorksheetFieldId, string>,
)

function renderToken(
  token: WorksheetToken,
  isTeacherAnswerView: boolean,
  answers: Record<WorksheetFieldId, string>,
  onChange: (fieldId: WorksheetFieldId, value: string) => void,
) {
  if (token.type === 'text') {
    return <span key={token.value}>{token.value}</span>
  }

  const field = fieldMap[token.fieldId]

  return (
    <span className="industry-sheet__field" key={field.id}>
      <span className="industry-sheet__sr-only">{field.label}</span>
      {isTeacherAnswerView ? (
        <span className="industry-sheet__answer">{field.answer}</span>
      ) : (
        <input
          aria-label={field.label}
          autoComplete="off"
          className="industry-sheet__input"
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={token.placeholder}
          spellCheck={false}
          style={{ width: `${field.widthCh}ch` }}
          type="text"
          value={answers[field.id] ?? ''}
        />
      )}
    </span>
  )
}

export function IndustryKeywordTimelineWorksheet({
  mode,
  showAnswers,
}: IndustryKeywordTimelineWorksheetProps) {
  const [variantId, setVariantId] = useState<WorksheetVariant['id']>(
    mode === 'teacher' ? 'illustrated' : 'empty',
  )
  const [answers, setAnswers] = usePersistentState<Record<WorksheetFieldId, string>>(
    `activity:industry-keyword-timeline:${mode}:worksheet`,
    emptyAnswers,
  )

  const selectedVariant =
    worksheetVariants.find((variant) => variant.id === variantId) ?? worksheetVariants[0]
  const isTeacherAnswerView = mode === 'teacher' && showAnswers

  const updateAnswer = (fieldId: WorksheetFieldId, value: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [fieldId]: value,
    }))
  }

  const resetAnswers = () => {
    setAnswers(emptyAnswers)
  }

  return (
    <section className="industry-worksheet">
      <div className="industry-worksheet__toolbar">
        <nav className="worksheet-tabs" aria-label="industry worksheet variants">
          {worksheetVariants.map((variant) => (
            <button
              key={variant.id}
              className="worksheet-tab"
              data-active={variant.id === variantId}
              onClick={() => setVariantId(variant.id)}
              type="button"
            >
              {variant.label}
            </button>
          ))}
        </nav>

        <div className="industry-worksheet__toolbar-meta">
          <span className="chip">{selectedVariant.description}</span>
          {isTeacherAnswerView ? (
            <span className="chip" data-tone="teacher">
              교사용 정답 표시
            </span>
          ) : null}
          <button
            className="tiny-button"
            data-tone={mode === 'teacher' ? 'teacher' : undefined}
            onClick={resetAnswers}
            type="button"
          >
            입력 지우기
          </button>
        </div>
      </div>

      <section className="industry-sheet panel">
        <header className="industry-sheet__hero">
          <div>
            <p className="industry-sheet__eyebrow">
              [사회] 6-1-1-10 우리나라 산업의 발달 과정을 알아볼까요 (37~39쪽)
            </p>
            <h3>키워드 연표</h3>
          </div>

          <div className="industry-sheet__identity">
            <div className="industry-sheet__identity-row">
              <span>학년</span>
              <span>반</span>
              <span>번</span>
            </div>
            <div className="industry-sheet__identity-row industry-sheet__identity-row--name">
              <span>이름</span>
              <span className="industry-sheet__identity-box">
                {isTeacherAnswerView ? '교사용' : ''}
              </span>
            </div>
          </div>
        </header>

        <div className="industry-sheet__instruction">
          <span className="industry-sheet__bullet" aria-hidden="true">
            ●
          </span>
          <p>핵심 키워드와 그림으로 우리나라의 산업 발달 과정을 나타낸 연표를 완성해 봅시다.</p>
        </div>

        <div className="industry-sheet__table-wrap">
          <div className="industry-sheet__table">
            <div className="industry-sheet__head">시기</div>
            <div className="industry-sheet__head">그림</div>
            <div className="industry-sheet__head">우리나라 산업 발달 키워드</div>

            {worksheetRows.map((row) => (
              <div className="industry-sheet__row" key={row.id}>
                <div className="industry-sheet__period">{row.periodLabel}</div>

                <div className="industry-sheet__art-cell" data-empty={variantId === 'empty'}>
                  {variantId === 'illustrated' ? (
                    <img alt={row.imageAlt} className="industry-sheet__art" src={row.imageSrc} />
                  ) : (
                    <div className="industry-sheet__art-placeholder" aria-hidden="true" />
                  )}
                </div>

                <div className="industry-sheet__content">
                  {row.lines.map((line, index) => (
                    <p className="industry-sheet__line" key={`${row.id}-${index}`}>
                      {line.map((token) =>
                        renderToken(token, isTeacherAnswerView, answers, updateAnswer),
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  )
}
