import type { LineMatchWorksheetModuleConfig } from '../../activity-kit/LineMatchWorksheetModule'

export const juneDemocracyMatchModule = {
  instruction:
    '\uc774\uc57c\uae30 \uc18d \uc0c1\ud669\uacfc \uc2e4\uc81c \uc5ed\uc0ac \uc18d \uc0ac\uac74\uc744 \uc5f0\uacb0\ud574 \ubd05\uc2dc\ub2e4.',
  leftItems: [
    {
      id: 'election-by-few',
      marker: '\uac00',
      label:
        '\ud559\uc0dd\ud68c\uc7a5\uc744 \ud559\uc0dd\ub4e4\uc774 \uc9c1\uc811 \ubf51\uc9c0 \ubabb\ud558\uace0 \uc77c\ubd80 \uc0ac\ub78c\ub9cc \ubaa8\uc5ec \uc815\ud568.',
    },
    {
      id: 'post-deleted',
      marker: '\ub098',
      label:
        '\ud559\uc0dd\ud68c \ube44\ud310 \uae00\uc774 \uac8c\uc2dc\ud310\uc5d0 \uc62c\ub77c\uc654\uc9c0\ub9cc \uace7\ubc14\ub85c \uc9c0\uc6cc\uc9d0.',
    },
    {
      id: 'friends-only',
      marker: '\ub2e4',
      label:
        '\uce5c\ud55c \uce5c\uad6c\ub4e4\ub9cc \uc120\uac70 \uc900\ube44\uc5d0 \ucc38\uc5ec\ud558\uac8c \ud568.',
    },
    {
      id: 'park-jongseon',
      marker: '\ub77c',
      label:
        '\ubc15\uc885\uc120 \ud559\uc0dd\uc774 \uc798\ubabb\uc744 \uc54c\ub9ac\ub824\ub2e4 \ud06c\uac8c \ub2e4\uce68.',
    },
    {
      id: 'lee-haneul',
      marker: '\ub9c8',
      label: '\uc774\ud55c\uc6b8 \ud559\uc0dd\uc774 \uc2dc\uc704 \ub3c4\uc911 \ub2e4\uce68.',
    },
    {
      id: 'direct-election',
      marker: '\ubc14',
      label:
        '\uacb0\uad6d \ubaa8\ub4e0 \ud559\uc0dd\uc774 \uc9c1\uc811 \ud22c\ud45c\ud558\ub294 \uc81c\ub3c4\uac00 \uc2dc\uc791\ub428.',
    },
  ],
  rightItems: [
    {
      id: 'indirect-election',
      marker: '1',
      label:
        '\uad6d\ubbfc\uc774 \uc9c1\uc811 \ub300\ud45c\ub97c \ubf51\uc9c0 \ubabb\ud558\uace0 \uc77c\ubd80 \uc0ac\ub78c\ub9cc \ub300\uc2e0 \ubf51\ub358 \uac04\uc120\uc81c',
    },
    {
      id: 'coup',
      marker: '2',
      label:
        '\uad8c\ub825\uc744 \uac00\uc9c4 \ucabd\uc774 \ud798\uc73c\ub85c \uc9c8\uc11c\ub97c \ubc14\uafb8\uace0 \ucc38\uc5ec\ub97c \ub9c9\ub358 \ubaa8\uc2b5',
    },
    {
      id: 'park-jongcheol',
      marker: '3',
      label: '\ubc15\uc885\ucca0 \uace0\ubb38\uce58\uc0ac \uc0ac\uac74',
    },
    {
      id: 'direct-election-promise',
      marker: '4',
      label: '\ub300\ud1b5\ub839 \uc9c1\uc120\uc81c\ub97c \uc57d\uc18d\ud55c 6.29 \uc120\uc5b8',
    },
    {
      id: 'press-control',
      marker: '5',
      label:
        '\ube44\ud310\uc801\uc778 \uae00\uacfc \uc18c\uc2dd\uc744 \ud1b5\uc81c\ud558\ub358 \uc5b8\ub860 \ud1b5\uc81c',
    },
    {
      id: 'lee-hanyeol',
      marker: '6',
      label: '\uc2dc\uc704 \uc911 \ud06c\uac8c \ub2e4\uce5c \uc774\ud55c\uc5f4 \uc5f4\uc0ac \uc0ac\uac74',
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
} satisfies LineMatchWorksheetModuleConfig
