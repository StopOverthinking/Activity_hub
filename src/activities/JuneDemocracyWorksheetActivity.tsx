import {
  createStoryThinkMatchWorksheetActivity,
  type StoryThinkMatchWorksheetDefinition,
} from '../activity-kit/createStoryThinkMatchWorksheetActivity'

const juneDemocracyWorksheetDefinition: StoryThinkMatchWorksheetDefinition = {
  manifest: {
    id: 'june-democracy-worksheet',
    title: '6월 민주 항쟁 워크시트',
    shortLabel: '민주 항쟁',
    icon: 'DM',
    color: '#b65f4b',
    softColor: '#f3ddd6',
    preview: 'line-match-history',
  },
  sectionType: 'performance',
  stage: {
    title: '6월 민주 항쟁',
    subtitle: '이야기, 생각, 연결',
    sectionLabels: {
      story: '이야기',
      think: '생각',
      match: '연결',
    },
  },
  worksheet: {
    storageKeyPrefix: 'activity:june-democracy-worksheet',
    story: {
      instruction: '다음 이야기를 읽고, 왜 민주주의가 필요한지 생각해 봅시다.',
      paragraphs: [
        {
          id: 'story-1',
          sentences: [
            {
              id: 'story-1-1',
              text: '어느 학교에서 학생회장을 학생들이 직접 뽑지 않고, 선생님들과 일부 학생 임원만 모여 정하도록 했습니다.',
            },
            {
              id: 'story-1-2',
              text: '그래서 많은 학생들이 불공평하다고 느꼈습니다.',
            },
          ],
        },
        {
          id: 'story-2',
          sentences: [
            {
              id: 'story-2-1',
              text: '학생회장은 학생들의 의견을 듣기보다 자신의 생각만 앞세웠고, 학생회 약속을 비판하는 글이 게시판에 올라오자 곧바로 지워 버렸습니다.',
            },
          ],
        },
        {
          id: 'story-3',
          sentences: [
            {
              id: 'story-3-1',
              text: '회장 선거를 준비할 때도 친한 친구들만 참여하게 하며 다른 학생들의 의견을 막았습니다.',
            },
            {
              id: 'story-3-2',
              text: '학생들은 이것이 공정한 선거가 아니라고 생각했습니다.',
            },
          ],
        },
        {
          id: 'story-4',
          sentences: [
            {
              id: 'story-4-1',
              text: '결국 몇몇 학생들이 운동장에 모여 자유롭게 이야기하자고 했지만, 학생 임원들은 큰 소리를 내지 못하게 하며 학생들을 제지했습니다.',
            },
          ],
        },
        {
          id: 'story-5',
          sentences: [
            {
              id: 'story-5-1',
              text: '그때 박종선이라는 학생이 학생회가 잘못하고 있다고 말하려다 크게 다쳤습니다.',
            },
            {
              id: 'story-5-2',
              text: '학교는 사실을 숨기려 했지만 학생들은 진실을 알리고 싶어 했습니다.',
            },
          ],
        },
        {
          id: 'story-6',
          sentences: [
            {
              id: 'story-6-1',
              text: '이어 이한울이라는 학생도 시위 도중 다치는 일이 생겼고, 이 사건은 학교 전체에 큰 충격을 주었습니다.',
            },
          ],
        },
        {
          id: 'story-7',
          sentences: [
            {
              id: 'story-7-1',
              text: '그 뒤 많은 학생들이 함께 목소리를 내기 시작했고, 마침내 모든 학생이 직접 투표로 학생회장을 뽑는 제도가 시작되었습니다.',
            },
          ],
        },
      ],
    },
    think: {
      instruction: '이 상황 속 학생이라면 어떤 마음이 들었을지 써 봅시다.',
      answerPrefix: '예) ',
      prompts: [
        {
          id: 'fairness',
          prompt: '학생회장을 소수의 임원만 정한다면 어떤 기분이 들까요?',
          teacherAnswer:
            '모든 학생이 참여하지 못하므로 불공평하고 답답하다는 생각이 들 것 같습니다.',
        },
        {
          id: 'speech',
          prompt: '게시판 글을 마음대로 지운다면 학생들은 어떻게 느낄까요?',
          teacherAnswer:
            '자유롭게 말할 권리를 빼앗긴 것 같아 답답하고 속상하다고 느낄 수 있습니다.',
        },
        {
          id: 'violence',
          prompt: '시위에 참여한 학생이 다쳤다는 소식을 들으면 어떤 마음이 들까요?',
          teacherAnswer:
            '무섭고 부당하다는 생각이 들며, 진실이 꼭 밝혀져야 한다고 느낄 수 있습니다.',
        },
        {
          id: 'direct-vote',
          prompt: '모든 학생이 직접 투표하게 되었다면 어떤 기분이 들까요?',
          teacherAnswer:
            '우리 손으로 대표를 뽑을 수 있어 뿌듯하고 학교가 더 공정해졌다고 느낄 수 있습니다.',
        },
      ],
    },
    match: {
      instruction: '이야기 속 상황과 실제 역사 속 사건을 연결해 봅시다.',
      leftItems: [
        {
          id: 'election-by-few',
          marker: '가',
          label: '학생회장을 학생들이 직접 뽑지 못하고 일부 사람만 모여 정함.',
        },
        {
          id: 'post-deleted',
          marker: '나',
          label: '학생회 비판 글이 게시판에 올라왔지만 곧바로 지워짐.',
        },
        {
          id: 'friends-only',
          marker: '다',
          label: '친한 친구들만 선거 준비에 참여하게 함.',
        },
        {
          id: 'park-jongseon',
          marker: '라',
          label: '박종선 학생이 잘못을 알리려다 크게 다침.',
        },
        {
          id: 'lee-haneul',
          marker: '마',
          label: '이한울 학생이 시위 도중 다침.',
        },
        {
          id: 'direct-election',
          marker: '바',
          label: '결국 모든 학생이 직접 투표하는 제도가 시작됨.',
        },
      ],
      rightItems: [
        {
          id: 'indirect-election',
          marker: '1',
          label: '국민이 직접 대표를 뽑지 못하고 일부 사람만 대신 뽑던 간선제',
        },
        {
          id: 'coup',
          marker: '2',
          label: '권력을 가진 쪽이 힘으로 질서를 바꾸고 참여를 막던 모습',
        },
        {
          id: 'park-jongcheol',
          marker: '3',
          label: '박종철 고문치사 사건',
        },
        {
          id: 'direct-election-promise',
          marker: '4',
          label: '대통령 직선제를 약속한 6.29 선언',
        },
        {
          id: 'press-control',
          marker: '5',
          label: '비판적인 글과 소식을 통제하던 언론 통제',
        },
        {
          id: 'lee-hanyeol',
          marker: '6',
          label: '시위 중 크게 다친 이한열 열사 사건',
        },
      ],
      answerMap: {
        'election-by-few': 'indirect-election',
        'post-deleted': 'press-control',
        'friends-only': 'coup',
        'park-jongseon': 'park-jongcheol',
        'lee-haneul': 'lee-hanyeol',
        'direct-election': 'direct-election-promise',
      },
    },
  },
}

const juneDemocracyWorksheetActivity = createStoryThinkMatchWorksheetActivity(
  juneDemocracyWorksheetDefinition,
)

export const juneDemocracyWorksheetManifest = juneDemocracyWorksheetActivity.manifest
export const JuneDemocracyWorksheetActivity = juneDemocracyWorksheetActivity.Component
