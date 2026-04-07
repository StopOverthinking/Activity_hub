import { useState } from 'react'
import { ActivityShell } from '../activity-kit/ActivityShell'
import { ActivityStage } from '../activity-kit/ActivityStage'
import { LineMatchBoard } from '../activity-kit/LineMatchBoard'
import { usePersistentState } from '../activity-kit/usePersistentState'
import type {
  ActivityComponentProps,
  ActivityManifest,
  SectionActivityType,
} from './types'

const storyParagraphs = [
  '한 학교에 전두광 학생회장이 있었어요. 이 학생회장은 학생들이 투표로 뽑은 게 아니라, 선생님들과 학생회 임원 몇 명이 모여 정해서 회장이 되었어요. 그래서 많은 학생들은 “우리 의견은 왜 묻지 않아요?” 하며 불만을 느꼈어요.',
  '전두광 학생회장은 학생들의 목소리를 듣기보다는 자신의 말만 따르도록 했어요. 어느 날, 한 학생이 “학생회장이 약속을 안 지켰어요.”라고 학교 게시판에 글을 올렸는데, 학생회장이 “이런 글은 올리면 안 돼.” 하며 글을 지워 버렸어요.',
  '새 회장을 뽑는 선거가 열린다고 했지만, 전두광 회장은 “후보는 내가 고를게.”라고 하며 자기 친구만 후보로 내세웠어요. 학생들은 “이건 선거가 아니야. 다 짜고 하는 거잖아.” 하며 더 답답했어요.',
  '결국 몇몇 학생들이 운동장에서 모여 이야기라도 하자고 했어요. 그런데 학생회 임원들이 와서 “모이면 안 돼! 다 흩어져!” 하며 학생들을 쫓아냈어요. 자유롭게 말할 수도, 모일 수도 없는 상황이었어요.',
  '그때 박종선 학생이 “학생회가 잘못한 걸 밝혀야 해요.” 하며 진실을 알려고 했는데, 그 일로 심하게 혼나고 다치는 일이 생겼어요. 학교는 이 사실을 숨기려 했지만, 학생들은 진실을 알게 되었어요.',
  '이 일로 마음이 아팠던 친구 이하늘 학생은 “이건 정말 불공평해요. 바꿔야 해요!” 하며 운동장에 나가 목소리를 냈어요. 그런데 시위 도중 학생회 임원이 던진 물병에 맞아 다치는 일이 일어났어요. 이 사건으로 학교 전체가 충격을 받았어요.',
  '그제야 많은 학생들이 용기 내어 외쳤어요. “우리도 직접 투표로 학생회장을 뽑고 싶어요!” 결국 학교는 학생들의 뜻을 받아들여 모든 학생이 학생회장을 직접 투표로 뽑는 직선제를 시작했어요.',
]

const reflectionPrompts = [
  {
    id: 'fairness',
    prompt: '학생회장을 임원 몇 명이 마음대로 정할 때',
    teacherAnswer:
      '모든 학생이 함께 뽑아야 하는데 일부만 정하는 건 불공평하다고 생각할 것 같다.',
  },
  {
    id: 'speech',
    prompt: '학교 게시판 글이 학생회장 마음대로 지워질 때',
    teacherAnswer: '자유롭게 말할 권리가 없어 답답하다고 생각할 것 같다.',
  },
  {
    id: 'violence',
    prompt: '운동장에서 시위하자 학생회 임원이 물병을 던질 때',
    teacherAnswer: '무섭고 부당하다는 감정이 들 것이다.',
  },
  {
    id: 'direct-vote',
    prompt: '결국 학생회장을 직접 투표로 뽑게 되었을 때',
    teacherAnswer: '드디어 우리가 직접 뽑을 수 있어서 뿌듯하다고 생각할 것 같다.',
  },
]

const leftItems = [
  {
    id: 'election-by-few',
    marker: '①',
    label: '학생회장을 학생들이 직접 뽑지 못하고 선생님들과 임원들이 정함.',
  },
  {
    id: 'post-deleted',
    marker: '②',
    label: '학생이 학생회장의 약속을 비판하는 글을 게시판에 올렸는데, 글이 지워짐.',
  },
  {
    id: 'friends-only',
    marker: '③',
    label: '전두광 학생회장과 친한 친구들만 회장 선거에 참여함.',
  },
  {
    id: 'park-jongseon',
    marker: '④',
    label: '박종선 학생이 학생회의 잘못을 밝히려다 다침.',
  },
  {
    id: 'lee-haneul',
    marker: '⑤',
    label: '이하늘 학생이 운동장에서 시위를 하다 다침.',
  },
  {
    id: 'direct-election',
    marker: '⑥',
    label: '결국 모든 학생이 학생회장을 직접 투표로 뽑게 됨.',
  },
]

const rightItems = [
  {
    id: 'indirect-election',
    marker: '㉠',
    label: '국민이 직접 대통령을 뽑지 못하고 국회의원들이 뽑던 간선제 제도 유지',
  },
  {
    id: 'coup',
    marker: '㉡',
    label: '전두환이 군사 쿠데타로 권력을 잡고, 국민이 아닌 일부 인물들에 의해 대통령이 됨.',
  },
  {
    id: 'park-jongcheol',
    marker: '㉢',
    label: '경찰 조사 중 고문으로 숨진 박종철 고문치사 사건',
  },
  {
    id: 'direct-election-promise',
    marker: '㉣',
    label: '정부가 국민의 요구를 받아들여 대통령 직선제를 약속함.',
  },
  {
    id: 'press-control',
    marker: '㉤',
    label: '정부가 언론을 통제하고, 비판적인 기사나 방송을 막았던 일',
  },
  {
    id: 'lee-hanyeol',
    marker: '㉥',
    label: '민주화를 요구하는 시위 중 최루탄에 맞아 숨진 이한열 열사 사건',
  },
]

const answerMap = {
  'election-by-few': 'indirect-election',
  'post-deleted': 'press-control',
  'friends-only': 'coup',
  'park-jongseon': 'park-jongcheol',
  'lee-haneul': 'lee-hanyeol',
  'direct-election': 'direct-election-promise',
}

const sections = [
  { id: 'story', label: '읽기', type: 'performance' },
  { id: 'think', label: '생각', type: 'performance' },
  { id: 'match', label: '연결', type: 'performance' },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  type: SectionActivityType
}>

type SectionId = (typeof sections)[number]['id']

const emptyThoughts = reflectionPrompts.reduce<Record<string, string>>((accumulator, item) => {
  accumulator[item.id] = ''
  return accumulator
}, {})

const juneDemocracyWorksheetManifest: ActivityManifest = {
  id: 'june-democracy-worksheet',
  title: '6월 민주 항쟁',
  shortLabel: '민주',
  icon: '↔',
  color: '#b65f4b',
  softColor: '#f3ddd6',
  preview: 'line-match-history',
  Component: JuneDemocracyWorksheetActivity,
}

function getSectionTypeLabel(type: SectionActivityType) {
  return type === 'quiz' ? '퀴즈 활동' : '수행 활동'
}

export function JuneDemocracyWorksheetActivity({ mode }: ActivityComponentProps) {
  const [sectionId, setSectionId] = useState<SectionId>('story')
  const [thoughts, setThoughts] = usePersistentState<Record<string, string>>(
    `activity:june-democracy:${mode}:thoughts`,
    emptyThoughts,
  )
  const [matches, setMatches] = usePersistentState<Record<string, string>>(
    `activity:june-democracy:${mode}:matches`,
    {},
  )

  const sectionIndex = sections.findIndex((section) => section.id === sectionId)
  const currentSection = sections[sectionIndex]
  const matchedCount = Object.keys(matches).length

  const goToSection = (nextSectionId: SectionId) => {
    setSectionId(nextSectionId)
  }

  const goToAdjacentSection = (direction: -1 | 1) => {
    const nextIndex = Math.min(
      sections.length - 1,
      Math.max(0, sectionIndex + direction),
    )

    setSectionId(sections[nextIndex].id)
  }

  const updateThought = (id: string, value: string) => {
    setThoughts((currentThoughts) => ({
      ...currentThoughts,
      [id]: value,
    }))
  }

  return (
    <ActivityShell manifest={juneDemocracyWorksheetManifest} mode={mode}>
      {({ showAnswers }) => (
        <ActivityStage
          title="6월 민주 항쟁"
          subtitle="읽기 · 생각 · 연결"
          aside={
            <div className="worksheet-stage-meta">
              <span className="chip">
                {getSectionTypeLabel(currentSection.type)}
              </span>
              <span className="chip" data-tone={mode === 'teacher' ? 'teacher' : undefined}>
                {sectionIndex + 1} / {sections.length}
              </span>
            </div>
          }
        >
          <div className="worksheet-shell">
            <nav className="worksheet-tabs" aria-label="worksheet sections">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className="worksheet-tab"
                  data-active={section.id === sectionId}
                  onClick={() => goToSection(section.id)}
                  type="button"
                >
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="worksheet-section">
              {sectionId === 'story' ? (
                <div className="story-sheet">
                  <div className="worksheet-heading">
                    <span className="worksheet-heading__index">1</span>
                    <p>다음 이야기를 읽고, 물음에 답하세요.</p>
                  </div>
                  <div className="story-sheet__body">
                    {storyParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              {sectionId === 'think' ? (
                <div className="reflection-list">
                  <div className="worksheet-heading">
                    <span className="worksheet-heading__index">2</span>
                    <p>내가 이야기 속 학교에 다니는 학생이라면 어떤 생각을 했을까요?</p>
                  </div>
                  {reflectionPrompts.map((prompt) => (
                    <section className="reflection-card" key={prompt.id}>
                      <p className="reflection-card__prompt">{prompt.prompt}</p>
                      <textarea
                        className="reflection-card__input"
                        onChange={(event) => updateThought(prompt.id, event.target.value)}
                        rows={2}
                        value={thoughts[prompt.id] ?? ''}
                      />
                      {mode === 'teacher' && showAnswers ? (
                        <p className="reflection-card__answer">{prompt.teacherAnswer}</p>
                      ) : null}
                    </section>
                  ))}
                </div>
              ) : null}

              {sectionId === 'match' ? (
                <div className="worksheet-match">
                  <div className="worksheet-heading">
                    <span className="worksheet-heading__index">3</span>
                    <p>이야기 속 상황과 실제 역사적 사건을 알맞게 연결해 보세요.</p>
                  </div>
                  <div className="worksheet-match__meta">
                    <span className="chip">{matchedCount}개 연결</span>
                    {showAnswers ? (
                      <span className="chip" data-tone="teacher">
                        정답 표시
                      </span>
                    ) : null}
                    <button
                      className="tiny-button"
                      onClick={() => setMatches({})}
                      type="button"
                    >
                      모두 지우기
                    </button>
                  </div>
                  <div className="worksheet-match__board">
                    <LineMatchBoard
                      answerMap={answerMap}
                      leftItems={leftItems}
                      onChange={setMatches}
                      revealAnswer={showAnswers}
                      rightItems={rightItems}
                      value={matches}
                    />
                  </div>
                </div>
              ) : null}

              <div className="worksheet-actions">
                <button
                  className="pill-button"
                  data-tone="secondary"
                  disabled={sectionIndex === 0}
                  onClick={() => goToAdjacentSection(-1)}
                  type="button"
                >
                  이전
                </button>
                <span className="worksheet-actions__label">{currentSection.label}</span>
                <button
                  className="pill-button"
                  disabled={sectionIndex === sections.length - 1}
                  onClick={() => goToAdjacentSection(1)}
                  type="button"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </ActivityStage>
      )}
    </ActivityShell>
  )
}
