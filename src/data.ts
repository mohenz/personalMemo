import { Group, Note } from './types';

export const PREMIUM_IMAGES = {
  jejuSunset: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqigFHyl57agz-SS5jkAhWcUx-NR-XXfHW84u9PXQ52ZYxUleaG4CPw4lIgNfuDOncombl_nbqXiYAj8fbTg5IePl_SYZh_K-RMcQJ5DTwCspa_LYrykJmGetYJEG8uat-dkYuuBLstKk5_VbZk1C0rFZD1qdOkvFx-0cCG4_m10iznXe2WIAX_TDde-a4E03YkI9F8iEHXpcmuGnxsF6grDt1olce6CCk-P70Alba4qRfNL9tLXVRn32iCrmA6vIBKty6hH2PSHhA',
  jejuDesk: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASuc1yEHFdyqRFVEhZ226J3orpvJwSWM7dE0iFJ67zh3x--ICkfqfZ_a7_YXjlz2SHFlVVZfd2Q0iY83dX8zC09HlvcDE5NQ8Ya9okktlafmGTuhs5oaM9kdh0sUGMxYKlUmWlD-M3hOpGVG0iVMtxbwKARV1W-_GoL3lDIrd_abRuDJqGkcJFNmlgJE6oXLliqMhIVRyA4X30zzQ0fT16DoWAHf5geRS0XXTMOmZRUyLX8PoVKeSzM20dp2NyWAj-L8-dvVv8Virr',
  office: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO8X4YaSw8zPdv9tdFAFW708_m_E2bzS-zwdg-A9-a8yZeXjUooNCvBKJ10Xz8sY7bl6MO8MHBkSWqnFZ5dT6xop-EoVDMcThZPhN1mRIjAya-Q7e8IdLRUO4o3kGSExesirIdIaFSgvZVIw_d6dERTJrAaIJU2dv94O7MrmprT9mgXJHQCSyN-HAYMbvRPzMqzOLvNmQdvPiFT8nSDIYerd-8h_WMqG8YURQ4HdGV0c0Ejou84qn2Hjf3hcceZduvvafjG04-aCyx',
  gridPaper: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaQWUk7LWofRcBilFflYqJt9o8W0me34aeRLO_gvKX36OFWVB1zvO1WDS2-Qs1akAUhOgrQSAd_RPBrnCA37Dkg7YDjWsQ7iNw_eQPI31ncogDu_ddqlFvY2DeS354Oe0VpqGcjtydd1P9PL6P4Xue4n-PcPQpa68_FbitpFCQDwK_d7rBuN_xs2VF5DuTYAKGCVaHljjq1keNl1iSt1zyKr7KFHWCB7Wti-H0hiCy6paqA9BCpW-apxiTvqz30Z_TW_hO7T4ExcCz',
  azureGradients: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCy7c5yFJUW95nl-ZEdCD-lEHlDFiea62GL4TCjZSTXtoJuUqQLw2UFZvn77jMaX6Iixe_BBtSq1GjoKsocs1P82PhoAStD-t_kwB5wiriShuuu7hjBXck8TmXX0muZy3TaIHwXraUxTRsVqwDe82FGj1K5XOCLXvbqRb7U3b8GHs7ljhkiOZFpsfozsQ6aW04Ehw2VAI8n7GSQOfFEECE-sJm-M-L1o1_a7noPtoOIQuC8agP00P3G1nm0zC_oszZnW2xJe7xRjxQQ',
  userProfile: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQNYgfuLF2Dm4YjmDF0nFoESHKiWRn36q3Z-owI6CIvv2Bcw9aNF0J1PRVHip6E03u4god9PtvEUIYXKr9dFPmLGiAqO2Zircnm8n1DQPh6-NX41LWzPeXWPsn1IK3J9v4HmDCts83oQpGBtYYf911D8pM2vrNlv2xxt6x1HiWIxGNi-McUNmrc_4tLHdiJo3cVjM2NjV-2Vx_JTW-7Ossypww7e3MfM2_SyHPEmVoy8rlifrWVVRY4qvfV_QZIYEeIgBm5BPzWo8O',
  moodBoard: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlFzLn1ZhcJuNvkxmOnoSo-Kd_dKtPHS94btWDNR2Q7iib3MKnqaSmccXaY-4kOIE19B4BUvgvAZEmHWHxeKNB-sTnJ2hD-5RnqbnFaJAhc7Lv_NX1YoxgfefT8RmIQfpaeZ_RJGxd4_AP0qZnwnb2MsdoPrKcvivpqMkQAOfmlDZ6OzLh03EKmG94rhvWfpTaXQEcmdd2YI0fzTisMXlRnZd-sRbsp08hWaufTH6jEvcPGEeSo2U8s6O0JM2DvUPVsYqdzOWphA8M'
};

export const DEFAULT_GROUPS: Group[] = [
  { id: 'work', name: '업무', icon: 'Briefcase' },
  { id: 'personal', name: '개인', icon: 'User' },
  { id: 'travel', name: '여행', icon: 'Compass' }
];

export const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-1',
    title: '제주도 3박 4일 여행 계획',
    content: `이번 제주도 여행은 힐링과 건축물 투어를 테마로 잡았습니다. 첫날은 공항 근처 애월읍의 바다를 보며 휴식하고, 둘째 날은 한라산 영실 코스를 가볍게 등반할 예정입니다. 셋째 날은 서귀포의 안도 타다오 건축물들을 방문합니다.`,
    groupId: 'travel',
    createdAt: '2026년 7월 15일 오후 2:30',
    updatedAt: '2026년 7월 15일 오후 2:30',
    dateString: '2026-07-15',
    isFavorite: true,
    isDeleted: false,
    images: [PREMIUM_IMAGES.jejuSunset, PREMIUM_IMAGES.jejuDesk],
    checklist: [
      { id: 'item-1', text: 'Day 1: 애월 해안도로 드라이브 - 숙소 체크인 - 흑돼지 저녁 식사', done: true },
      { id: 'item-2', text: 'Day 2: 영실 코스 등반 (약 3시간 소요) - 서귀포 올레시장 투어', done: false },
      { id: 'item-3', text: 'Day 3: 본태박물관 - 방주교회 - 유동커피 (서귀포 본점)', done: false },
      { id: 'item-4', text: 'Day 4: 동문시장 기념품 구매 - 공항 이동 (오후 5시 비행기)', done: false }
    ]
  },
  {
    id: 'note-2',
    title: '디자인 시스템 워크숍',
    content: `새로운 Galaxy Tab용 디자인 시스템은 Material Design 3를 기반으로 하면서도 사용자에게 익숙한 종이의 질감과 격자 무늬를 제공합니다.

우리가 집중해야 할 핵심 요소들:
1. 타이포그래피의 가독성 (Manrope 폰트 활용)
2. 8dp 그리드 시스템을 통한 완벽한 정렬
3. S-Pen을 활용한 정밀한 인터랙션

격자 무늬는 24dp 간격으로 설정되어 있어 텍스트의 line-height와 완벽하게 일치합니다. 이는 사용자에게 실제 노트를 쓰는 듯한 심리적 안정감을 제공하며 정보의 구조화를 돕습니다.

이미지 첨부 기능은 하단 바를 통해 직관적으로 관리할 수 있으며, 드래그 앤 드롭을 지원하여 데스크탑과 유사한 생산성을 보장합니다.`,
    groupId: 'work',
    createdAt: '2026년 7월 14일 오전 10:00',
    updatedAt: '2026년 7월 14일 오전 10:00',
    dateString: '2026-07-14',
    isFavorite: false,
    isDeleted: false,
    images: [PREMIUM_IMAGES.office, PREMIUM_IMAGES.gridPaper, PREMIUM_IMAGES.azureGradients],
    checklist: [
      { id: 'item-2-1', text: '핵심 타이포그래피 가이드라인 설정', done: true },
      { id: 'item-2-2', text: '그리드 컴포넌트 라이브러리 제작', done: false }
    ]
  },
  {
    id: 'note-3',
    title: '2024 신규 프로젝트 아이디어',
    content: `이번 분기 핵심 전략은 사용자 경험의 극대화입니다. 새로운 디자인 시스템을 적용하여 생산성을 높이는 아이디어를 구체화해보았습니다.

추가 브레인스토밍 방향:
- 디바이스 가로 모드 및 세로 모드 유연한 대응
- 펜 드로잉 캔버스 오버레이 지원`,
    groupId: 'work',
    createdAt: '2026년 7월 05일 오후 3:15',
    updatedAt: '2026년 7월 05일 오후 3:15',
    dateString: '2026-07-05',
    isFavorite: true,
    isDeleted: false,
    images: [],
    checklist: []
  },
  {
    id: 'note-4',
    title: '앱 UI 컬러 아이디어',
    content: `갤럭시 탭 대화면에 최적화된 3단 레이아웃 컬러 팔레트 정리.
종이의 편안한 미색(Warm White, Off-white)과 지능적인 디지털 느낌을 주는 deep blue의 결합.`,
    groupId: 'work',
    createdAt: '2026년 7월 12일 오후 12:40',
    updatedAt: '2026년 7월 12일 오후 12:40',
    dateString: '2026-07-12',
    isFavorite: false,
    isDeleted: false,
    images: [PREMIUM_IMAGES.moodBoard],
    checklist: []
  },
  {
    id: 'note-5',
    title: '브랜딩 아이디어 노트',
    content: `로고 심볼은 단순하면서도 신뢰감을 줄 수 있어야 함. 스테이셔너리 브랜드의 감성을 살리기 위해 미세한 종이 질감을 UI에 녹여내는 것이 이번 아이디어의 핵심.`,
    groupId: 'personal',
    createdAt: '2026년 7월 08일 오전 9:15',
    updatedAt: '2026년 7월 08일 오전 9:15',
    dateString: '2026-07-08',
    isFavorite: false,
    isDeleted: false,
    images: [],
    checklist: []
  },
  {
    id: 'note-6',
    title: '읽고 싶은 책 리스트',
    content: `1. 도둑맞은 집중력
2. 미움받을 용기
3. 사피엔스 (재독)

교보문고 장바구니 확인하고 구매 결정하기. 주말 독서 시간 확보 필요.`,
    groupId: 'personal',
    createdAt: '2026년 7월 01일 오후 5:00',
    updatedAt: '2026년 7월 01일 오후 5:00',
    dateString: '2026-07-01',
    isFavorite: false,
    isDeleted: false,
    images: [],
    checklist: [
      { id: 'bk-1', text: '도둑맞은 집중력', done: false },
      { id: 'bk-2', text: '미움받을 용기', done: true }
    ]
  },
  {
    id: 'note-7',
    title: '일본 오사카 맛집 지도',
    content: `도톤보리 타코야끼, 우메다 규카츠, 난바역 근처 이자카야 예약 현황. 구글 맵 저장 완료.`,
    groupId: 'travel',
    createdAt: '2026년 6월 28일 오후 8:12',
    updatedAt: '2026년 6월 28일 오후 8:12',
    dateString: '2026-06-28',
    isFavorite: false,
    isDeleted: false,
    images: [],
    checklist: []
  },
  {
    id: 'note-8',
    title: '회의 아이디어 정리',
    content: `하반기 프로젝트 마케팅 채널 확장 전략 수립 관련 회의 기록.
블로그, 인플루언서, 검색 광고 예산 배분 조정 필요.`,
    groupId: 'work',
    createdAt: '2026년 7월 21일 오후 2:00',
    updatedAt: '2026년 7월 21일 오후 2:00',
    dateString: '2026-07-21',
    isFavorite: false,
    isDeleted: false,
    images: [],
    checklist: []
  },
  {
    id: 'note-9',
    title: '유튜브 콘텐츠 아이디어',
    content: `일상의 사소한 발견들을 생산성 도구와 연결시키는 시리즈물 기획. 1편: 아날로그 기록과 디지털의 결합.`,
    groupId: 'personal',
    createdAt: '2026년 7월 28일 오전 11:30',
    updatedAt: '2026/07/28 오전 11:30',
    dateString: '2026-07-28',
    isFavorite: false,
    isDeleted: false,
    images: [],
    checklist: []
  },
  {
    id: 'note-10',
    title: '선물 아이디어 리스트',
    content: `친구 결혼 선물 후보군 정리. 가습기, 식기 세트, 무드등 등 센스 있는 아이디어 추천 받기.`,
    groupId: 'personal',
    createdAt: '2026년 7월 30일 오후 4:45',
    updatedAt: '2026년 7월 30일 오후 4:45',
    dateString: '2026-07-30',
    isFavorite: false,
    isDeleted: false,
    images: [],
    checklist: []
  }
];
